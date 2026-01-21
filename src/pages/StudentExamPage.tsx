import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type MutableRefObject,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { type AxiosError } from "axios";
import Swal from "sweetalert2";

/* ---------------- Helper ---------------- */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

/* ---------------- Types ---------------- */
interface ExamData {
  id: number;
  title: string;
  duration: number | string;
  [key: string]: any;
}

interface QuestionItem {
  id: number;
  question: string;
  options?: {
    type: string; value: string 
}[];
  answer?: string;
  [key: string]: any;
}

interface QuestionsResponse {
  questions: QuestionItem[];
}

const StudentExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  // Exam states
  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});

  // Session & status
  const [started, setStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Refs
  const submittingRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  /* ---------------- Fetch Exam ---------------- */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data: examData } = await axios.get<ExamData>(
          `http://localhost:3000/api/exams/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setExam(examData);
        setTimeLeft(Number(examData.duration) * 60);

        const { data: qRes } = await axios.get<QuestionsResponse>(
          `http://localhost:3000/api/exams/${examId}/questions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(qRes.questions);

        setQuestions(qRes.questions || []);
      } catch (err) {
        const axiosErr = err as AxiosError;
        console.error("Gagal ambil exam:", axiosErr);

        Swal.fire("Error", "Gagal memuat ujian", "error");
        navigate("/student/exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, navigate]);

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    if (!exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Swal.fire("Waktu Habis!", "Ujian sudah selesai", "warning");
          navigate("/student/exam");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, navigate]);

  /* ---------------- Proctoring ---------------- */
  useEffect(() => {
    if (!started) return;

    const token = localStorage.getItem("token");

    const showWarning = async (msg: string) => {
      Swal.fire("Peringatan!", msg, "warning");

      if (sessionId && !submittingRef.current) {
        await axios.post(
          `http://localhost:3000/api/exam-sessions/${sessionId}/tab-switch`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submittingRef.current) {
        showWarning("Anda keluar dari fullscreen!");
      }
    };

    const handleBlur = () => showWarning("Jangan tinggalkan halaman ujian!");

    const handleVisibilityChange = () => {
      if (document.hidden && !submittingRef.current) {
        showWarning("Anda tidak boleh berpindah tab!");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [started, sessionId]);


  /* ---------------- Recording ---------------- */
  const startRecording = useCallback(
    async (sessionId: string | number) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onerror = (event: Event) => {
          const err = (event as unknown as { error?: DOMException }).error;
          console.error("🎥 MediaRecorder error:", err ?? event);
        };


        mediaRecorder.onstop = async () => {
          console.log("🎥 onstop triggered");

          console.log("Chunks count:", chunksRef.current.length);
          let totalBytes = 0;
          chunksRef.current.forEach((c, idx) => {
            console.log(` chunk[${idx}] size:`, c.size, "type:", c.type);
            totalBytes += c.size;
          });
          console.log("Total bytes:", totalBytes);

          await new Promise((r) => setTimeout(r, 500));

          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          console.log("Blob created:", { size: blob.size, type: blob.type });

          if (blob.size === 0) {
            console.error("❌ Blob kosong, abort upload");
            return;
          }

          const formData = new FormData();
          formData.append("file", blob, "exam-recording.webm");

          for (const [name, value] of formData.entries()) {
            if (typeof value === "string") {
              console.log("FormData entry:", name, value);
            } else {
              const blob = value as Blob;
              console.log(
                `FormData entry: ${name}, size: ${blob.size}, type: ${blob.type}`
              );
            }
          }

          const token = localStorage.getItem("token");
          console.log("Token present:", !!token);

          try {
            console.log("➡️ Starting fetch upload...");
            const res = await fetch(
              `http://localhost:3000/api/exam-sessions/${sessionId}/upload-video`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );

            console.log("Fetch response status:", res.status, res.statusText);
            const text = await res.text();
            console.log("Response body text:", text);

            if (!res.ok) {
              console.error("❌ Upload failed:", res.status, text);
            } else {
              console.log("✅ Upload successful");
            }
          } catch (err) {
            console.error("🔥 Fetch error:", err);
          } finally {
            try {
              const stream = mediaRecorderRef.current?.stream;
              if (stream) {
                stream.getTracks().forEach((t) => {
                  console.log("Stopping track:", t.kind, t.label);
                  t.stop();
                });
              }
            } catch (e) {
              console.warn("Failed stopping tracks:", e);
            }
          }
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("❌ Gagal akses kamera:", err);
      }
    },
    []
  );

  /* ---------------- Handlers ---------------- */
  const handleAnswerChange = (questionId: number | string, answer: any) => {
    setStudentAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleStart = async () => {
    try {
      const { data } = await axios.post<{ id: number | string }>(
        `http://localhost:3000/api/exam-sessions/${examId}/start`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setSessionId(data.id);
      setStarted(true);

      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      startRecording(data.id);
    } catch (err) {
      console.error("Gagal mulai ujian:", err);
      Swal.fire("Error", "Tidak bisa memulai sesi ujian", "error");
    }
  };

  const handleSubmit = async () => {
    const result = await Swal.fire({
      title: "Yakin ingin mengirim jawaban?",
      text: "Pastikan semua jawaban sudah benar. Setelah dikirim, kamu tidak bisa mengubah jawaban lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, kirim sekarang!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: "Dibatalkan",
        text: "Kamu bisa memeriksa kembali jawaban sebelum mengirim.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setSubmitting(true);

      Swal.fire({
        title: "Mengirim jawaban...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("token");

      const payload = {
        answers: Object.entries(studentAnswers).map(
          ([question_id, answer]) => ({
            question_id,
            answer,
          })
        ),
      };

      await axios.post(
        `http://localhost:3000/api/exam-submissions/${examId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (sessionId) {
        await axios.post(
          `http://localhost:3000/api/exam-sessions/${sessionId}/finish`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (document.fullscreenElement) await document.exitFullscreen();

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      await Swal.fire({
        icon: "success",
        title: "Ujian Terkirim!",
        text: "Jawaban kamu berhasil dikirim. Terima kasih sudah mengikuti ujian.",
        confirmButtonText: "OK",
      });

      navigate("/student/exam");
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", "Gagal menyimpan jawaban", "error");
    } finally {
      setSubmitting(false);
    }
  };


  /* ---------------- Render ---------------- */
  if (loading) return <p className="p-6">Loading...</p>;

  if (!started) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white text-center px-6">
        <div className="max-w-md">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-4 animate-bounce">
            🚀 Siap Untuk Ujianmu?
          </h1>
          <p className="text-gray-600 mb-8">
            {exam?.title
              ? `Ujian: ${exam.title}`
              : "Pastikan kamu siap dan fokus untuk mengerjakan ujian ini."}
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-gray-700 font-medium">
              🔒 Setelah menekan tombol mulai, layar akan masuk ke mode
              fullscreen dan rekaman video akan dimulai untuk keperluan
              pengawasan. Pastikan kamera dan mikrofon kamu aktif!
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Mulai Ujian Sekarang 🎯
          </button>

          <p className="mt-6 text-sm text-gray-500">
            Semoga sukses! Fokus, tenang, dan tunjukkan kemampuan terbaikmu 💪
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header Ujian */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-blue-700">{exam?.title}</h1>
          <p className="text-sm text-gray-500">Fokus dan kerjakan dengan tenang 💪</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-red-600 animate-pulse">
            ⏳ {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-gray-500">Sisa waktu ujian</p>
        </div>
      </header>

      {/* Daftar Soal */}
      <main className="flex-1 overflow-y-auto p-6">
        {questions.length > 0 ? (
          [...questions]
            .sort((a, b) =>
              a.type === b.type
                ? (a.index ?? 0) - (b.index ?? 0)
                : a.type === "multiple_choice"
                ? -1
                : 1
            )
            .map((q, index) => (
              <div
                key={q.id}
                className="mb-8 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-semibold">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-gray-800 leading-relaxed text-lg">
                    {q.question}
                  </p>
                </div>

                {/* Opsi Pilihan Ganda */}
                {q.type === "multiple_choice" ? (
                  <div className="mt-3 space-y-3">
                    {q.options?.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                          studentAnswers[q.id] === opt.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.value}
                          onChange={() => handleAnswerChange(q.id, opt.value)}
                          checked={studentAnswers[q.id] === opt.value}
                          className="accent-blue-600 scale-110"
                        />
                        {opt.type === "text" ? (
                          <span className="text-gray-700">{opt.value}</span>
                        ) : (
                          <img
                            src={opt.value}
                            alt={`option-${i}`}
                            className="h-20 rounded-md border"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  // Jawaban Esai
                  <textarea
                    name={`q-${q.id}`}
                    className="w-full border border-gray-300 rounded-xl p-3 mt-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                    placeholder="Tulis jawaban Anda di sini..."
                    rows={5}
                    value={(studentAnswers[q.id] as string) || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Tidak ada soal tersedia 😅</p>
          </div>
        )}
      </main>

      {/* Tombol Submit */}
      <footer className="p-4 bg-white shadow-inner flex justify-end items-center sticky bottom-0">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Mengirim Jawaban..." : "Kirim Jawaban 📝"}
        </button>
      </footer>
    </div>
  );
};

export default StudentExamPage;