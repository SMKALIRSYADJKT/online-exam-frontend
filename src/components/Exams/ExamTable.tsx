import React, { useState } from "react";
import StudentsModal from "../StudentsModal";
import formatDateOnly from "../../utils/formatDateOnly";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";
import ActionMenu from "../ActionMenu";
import type { Exam } from "../../types/exam";

// Tipe untuk subject
interface Subject {
  id?: number | string;
  name?: string;
}

// Props untuk ExamTable
interface ExamTableProps {
  data: Exam[];
  onRefresh?: () => void;
  searchParams: URLSearchParams;
  setSearchParams: (params: Record<string, string>) => void;
  onEdit?: (id: number | string) => void;
}

const ExamTable: React.FC<ExamTableProps> = ({
  data,
  onRefresh,
  searchParams,
  setSearchParams,
  onEdit,
}) => {
  const sort = searchParams.get("sort") || "title";
  const order = searchParams.get("order") || "asc";
  const [selectedExamId, setSelectedExamId] = useState<number | string | null>(null);
  const [showStudents, setShowStudents] = useState<boolean>(false);

  const openStudentsModal = (examId: number | string) => {
    setSelectedExamId(examId);
    setShowStudents(true);
  };

  const handleSort = (key: string) => {
    const currentSort = searchParams.get("sort");
    const currentOrder = searchParams.get("order") || "asc";
    const newOrder =
      currentSort === key && currentOrder === "asc" ? "desc" : "asc";
    setSearchParams({ sort: key, order: newOrder, page: "1" });
  };

  const renderSortIndicator = (key: string) => {
    if (sort !== key)
      return <HiSelector className="inline text-gray-400 ml-1" />;
    return order === "asc" ? (
      <HiChevronUp className="inline text-primary-500 ml-1" />
    ) : (
      <HiChevronDown className="inline text-primary-500 ml-1" />
    );
  };

  return (
    <div className="font-poppins">
      <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-sm text-gray-700">
        <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs font-semibold tracking-wider">
          <tr>
            <th className="px-4 py-3 text-center border-b min-w-[60px]">No</th>
            <th
              className="px-4 py-3 text-center cursor-pointer select-none border-b min-w-[180px] hover:text-emerald-700"
              onClick={() => handleSort("title")}
            >
              Judul Ujian {renderSortIndicator("title")}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer select-none border-b min-w-[160px] hover:text-emerald-700"
              onClick={() => handleSort("subject")}
            >
              Mata Pelajaran {renderSortIndicator("subject")}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer select-none border-b min-w-[130px] hover:text-emerald-700"
              onClick={() => handleSort("type")}
            >
              Tipe {renderSortIndicator("type")}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer select-none border-b min-w-[130px] hover:text-emerald-700"
              onClick={() => handleSort("date")}
            >
              Tanggal {renderSortIndicator("date")}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer select-none border-b min-w-[140px] hover:text-emerald-700"
              onClick={() => handleSort("duration")}
            >
              Durasi (menit) {renderSortIndicator("duration")}
            </th>
            <th className="px-4 py-3 text-center border-b min-w-[120px]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((exam, index) => (
              <tr
                key={exam.id}
                className="hover:bg-emerald-50 transition-all duration-150 border-b last:border-none"
              >
                <td className="px-4 py-3 text-center">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{exam.title}</td>
                <td className="px-4 py-3">{exam.subject?.name || "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      exam.type === "REGULER"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {exam.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{formatDateOnly(exam.date)}</td>
                <td className="px-4 py-3 text-center">{exam.duration}</td>
                <td className="px-4 py-3 text-center">
                  <ActionMenu
                    itemId={exam.id}
                    onEdit={onEdit}
                    menu="exam"
                    type={exam.type}
                    onShowStudents={openStudentsModal}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-gray-500 bg-gray-50 italic"
              >
                Tidak ada ujian ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <StudentsModal
        isOpen={showStudents}
        onClose={() => setShowStudents(false)}
        examId={selectedExamId}
      />
    </div>
  );
};

export default ExamTable;
