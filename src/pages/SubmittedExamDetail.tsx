import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios, { type AxiosError } from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import formatDateOnly from "../utils/formatDateOnly";
import { FaClipboardCheck } from "react-icons/fa";

// ---------------- Types ----------------
interface QuestionOption {
  type: "text" | "image";
  value: string;
}

interface Question {
  id: string | number;
  question: string;
  type: "multiple_choice" | "essay";
  options?: QuestionOption[];
}

interface Answer {
  question_id: string | number;
  answer: string;
  question: Question;
}

interface Exam {
  id: string | number;
  title: string;
  subject?: { id: string | number; name: string };
  date: string;
  duration: number;
}

interface ExamDetail {
  exam: Exam;
  answers: Answer[];
}

const MySwal = withReactContent(Swal);

// ---------------- Component ----------------
const SubmittedExamDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get<ExamDetail>(
        `http://localhost:3000/api/exam-submissions/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setExamDetail(res.data);
    } catch (err) {
      const axiosErr = err as AxiosError;
      console.error("Gagal ambil detail ujian:", axiosErr);
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil detail ujian.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamDetail();
  }, [submissionId]);

  const renderAnswer = (ans: Answer) => {
    if (
      ans.question.type === "multiple_choice" &&
      ans.question.options?.[0]?.type === "image"
    ) {
      return (
        <img
          src={ans.answer}
          alt="Jawaban"
          className="max-w-xs mt-2 rounded shadow"
        />
      );
    }
    return <span>{ans.answer || "-"}</span>;
  };

  return (
    <Sidebar>
      <div className="p-8 bg-gray-50 min-h-screen rounded-2xl shadow-inner">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
            <FaClipboardCheck className="text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Detail Ujian yang Disubmit
          </h3>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        ) : !examDetail ? (
          <p className="text-red-500 italic">Data tidak ditemukan.</p>
        ) : (
          <div className="space-y-6">
            {/* Info Ujian */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h4 className="text-xl font-semibold mb-2">
                {examDetail.exam?.title}
              </h4>
              <div className="text-gray-500 text-sm space-y-1">
                <p>
                  Mata Pelajaran: {examDetail.exam?.subject?.name || "-"}
                </p>
                <p>Tanggal: {formatDateOnly(examDetail.exam?.date)}</p>
                <p>Durasi: {examDetail.exam?.duration} menit</p>
              </div>
            </div>

            {/* Jawaban */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h5 className="font-semibold mb-4 text-gray-700">
                Detail Jawaban
              </h5>
              {examDetail.answers && examDetail.answers.length > 0 ? (
                <ul className="space-y-4">
                  {examDetail.answers.map((ans, idx) => (
                    <li
                      key={ans.question_id}
                      className="p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-lg shadow-sm"
                    >
                      <p className="font-medium text-gray-800">
                        {idx + 1}. {ans.question.question}
                      </p>
                      <p className="mt-2">
                        <span className="font-semibold">Jawaban:</span>{" "}
                        {renderAnswer(ans)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  Belum ada jawaban tersimpan.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default SubmittedExamDetail;
