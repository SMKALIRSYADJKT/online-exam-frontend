import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

interface Option {
  type: "text" | "image";
  value: string;
}

interface Question {
  id: string | number;
  text: string;
  type: "multiple_choice" | "essay";
  options?: Option[];
  correctAnswer?: string;
  studentAnswer?: string;
}

interface ScoringQuestionCardProps {
  question: Question;
  index: number;
  isCorrect?: boolean;
  onSetScore: (id: string | number, isCorrect: boolean) => void;
}

const ScoringQuestionCard: React.FC<ScoringQuestionCardProps> = ({
  question,
  index,
  isCorrect,
  onSetScore,
}) => {
  const { id, text, type, options, correctAnswer, studentAnswer } = question;

  // Render opsi jawaban untuk multiple choice
  const renderOptions = () => {
    if (!options || !Array.isArray(options)) return null;

    return (
      <div className="grid grid-cols-2 gap-3 mt-2">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className={`border rounded-md p-2 flex items-center justify-center text-sm text-gray-700 ${
              opt.value === studentAnswer
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {opt.type === "text" ? (
              <span>{opt.value}</span>
            ) : (
              <img
                src={opt.value}
                alt={`Option ${idx + 1}`}
                className="h-16 object-contain"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render jawaban siswa untuk essay
  const renderStudentAnswer = () => {
    if (type === "essay") {
      return (
        <p className="bg-gray-50 p-3 rounded-md mt-2 text-gray-800 whitespace-pre-line">
          {studentAnswer || "-"}
        </p>
      );
    }
    return null;
  };

  // Render jawaban benar (hanya untuk non-essay)
  const renderCorrectAnswer = () => {
    if (!correctAnswer || type === "essay") return null;

    return (
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-medium">Jawaban Benar:</span>{" "}
        {correctAnswer.startsWith("http") ? (
          <img
            src={correctAnswer}
            alt="Jawaban benar"
            className="h-16 mt-1 rounded-md border"
          />
        ) : (
          <span className="ml-1">{correctAnswer}</span>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      {/* Header soal + tombol penilaian */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800">
          {index + 1}. {text || "Soal tidak ditemukan"}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => onSetScore(id, true)}
            className={`p-2 rounded-full transition ${
              isCorrect === true
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400 hover:text-green-500"
            }`}
            title="Jawaban Benar"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onSetScore(id, false)}
            className={`p-2 rounded-full transition ${
              isCorrect === false
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-400 hover:text-red-500"
            }`}
            title="Jawaban Salah"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Konten soal */}
      <div className="ml-1 text-gray-700">
        {type === "multiple_choice" ? (
          <>
            <p className="text-sm text-gray-600">Pilihan:</p>
            {renderOptions()}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Jawaban Siswa:</p>
            {renderStudentAnswer()}
          </>
        )}

        {renderCorrectAnswer()}
      </div>
    </div>
  );
};

export default ScoringQuestionCard;
