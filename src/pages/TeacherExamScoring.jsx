import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import ScoringQuestionCard from "../components/Exams/ScoringQuestionCard";

const TeacherExamScoring = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [scoring, setScoring] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSubmissionDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/teacher-exams/submission/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data;
      setSubmission(data);

      // Pre-fill skor awal jika sudah pernah dinilai
      const initialScoring = {};
      data.questions?.forEach((q) => {
        initialScoring[q.id] = q.is_correct ?? null;
      });
      setScoring(initialScoring);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data ujian siswa.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetScore = (questionId, isCorrect) => {
    setScoring((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }));
  };

  const handleSaveScore = async () => {
    try {
      // Hitung jumlah benar untuk tiap tipe soal
      const questions = submission.questions || [];
      const totalMultiple = questions.filter((q) => q.type === "multiple_choice").length;
      const totalEssay = questions.filter((q) => q.type === "essay").length;

      const correctMultiple = questions.filter(
        (q) => q.type === "multiple_choice" && scoring[q.id] === true
      ).length;
      const correctEssay = questions.filter(
        (q) => q.type === "essay" && scoring[q.id] === true
      ).length;

      const scoreMultiple =
        totalMultiple > 0 ? (correctMultiple / totalMultiple) * 60 : 0;
      const scoreEssay = totalEssay > 0 ? (correctEssay / totalEssay) * 40 : 0;

      const finalScore = Math.round(scoreMultiple + scoreEssay);

      const payload = Object.entries(scoring).map(([questionId, isCorrect]) => ({
        question_id: questionId,
        is_correct: isCorrect,
      }));

      await axios.patch(
        `http://localhost:3000/api/teacher-exams/submission/${submissionId}/scoring`,
        { scores: payload, totalScore: finalScore },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Swal.fire(
        "Berhasil!",
        `Nilai ujian berhasil disimpan.\nSkor akhir: ${finalScore}`,
        "success"
      ).then(() => {
        navigate("/teacher-exam"); // balik ke daftar ujian
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan nilai.", "error");
    }
  };

  useEffect(() => {
    fetchSubmissionDetail();
  }, [submissionId]);

  if (loading)
    return (
      <Sidebar>
        <p className="p-6">Loading...</p>
      </Sidebar>
    );

  if (!submission)
    return (
      <Sidebar>
        <p className="p-6 text-gray-500">Data tidak ditemukan.</p>
      </Sidebar>
    );

  return (
    <Sidebar>
      <div className="p-6 bg-white rounded shadow max-w-screen-lg mx-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-700">
          Penilaian Ujian Siswa
        </h3>

        {/* Info Umum */}
        <div className="border-b pb-3 mb-4 text-sm text-gray-600">
          <p>
            <span className="font-semibold">Ujian:</span>{" "}
            {submission.exam?.title || "-"}
          </p>
          <p>
            <span className="font-semibold">Tanggal:</span>{" "}
            {new Date(submission.created_at).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Siswa:</span>{" "}
            {submission.student?.name || "-"}
          </p>
        </div>

        {/* Daftar Soal */}
        {submission.questions?.map((q, idx) => (
          <ScoringQuestionCard
            key={q.id}
            question={{
              id: q.id,
              text: q.question,
              type: q.type,
              options: q.options,
              correctAnswer: q.answer, // jawaban benar dari DB
              studentAnswer: q.student_answer, // jawaban siswa
            }}
            index={idx}
            isCorrect={scoring[q.id]}
            onSetScore={handleSetScore}
          />
        ))}

        {/* Tombol Simpan */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveScore}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Simpan / Submit Penilaian
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default TeacherExamScoring;
