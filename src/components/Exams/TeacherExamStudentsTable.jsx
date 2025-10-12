import React from "react";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";
import PropTypes from "prop-types";
import formatDateOnly from "../../utils/formatDateOnly";
import ActionMenu from "../ActionMenu";
import { useNavigate } from "react-router-dom";

const TeacherExamStudentsTable = ({ data, searchParams, setSearchParams }) => {
  const navigate = useNavigate();
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";

  const handleSort = (key) => {
    const currentSort = searchParams.get("sort");
    const currentOrder = searchParams.get("order") || "desc";
    const newOrder = currentSort === key && currentOrder === "asc" ? "desc" : "asc";
    setSearchParams({
      search: searchParams.get("search") || "",
      sort: key,
      order: newOrder,
      page: "1",
    });
  };

  const renderSortIndicator = (key) => {
    if (sort !== key) return <HiSelector className="inline text-gray-400 ml-1" />;
    return order === "asc" ? (
      <HiChevronUp className="inline text-blue-500 ml-1" />
    ) : (
      <HiChevronDown className="inline text-blue-500 ml-1" />
    );
  };

  const handleGrade = (submissionId) => {
    navigate(`/teacher/exams/submission/${submissionId}/grading`);
  };

  return (
    <div className="mt-4">
      <table className="table-auto w-full min-w-full bg-white border border-gray-200 rounded shadow text-sm text-gray-500 border-separate border-spacing-0">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center">No</th>
            <th
              className="px-4 py-2 text-center cursor-pointer"
              onClick={() => handleSort("student_name")}
            >
              Student {renderSortIndicator("student_name")}
            </th>
            <th
              className="px-4 py-2 text-center cursor-pointer"
              onClick={() => handleSort("submitted_at")}
            >
              Submitted At {renderSortIndicator("submitted_at")}
            </th>
            <th className="px-4 py-2 text-center">Score</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((submission, index) => (
              <tr key={submission.id}>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {submission.users?.name || "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {formatDateOnly(submission.created_at)}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {submission.score != null ? (() => {
                    let color = "text-green-500";
                    if (submission.score < 50) {
                      color = "text-red-500";
                    } else if (submission.score < 75) {
                      color = "text-yellow-500";
                    }
                    return <span className={`${color} font-semibold`}>{submission.score}</span>;
                  })()
                  :
                  ("-")
                  }
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  <ActionMenu
                    itemId={submission.id}
                    menu="teacherExamSubmission"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-4 py-2 text-center text-gray-500"
              >
                Belum ada siswa yang mengerjakan ujian ini
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TeacherExamStudentsTable.propTypes = {
  data: PropTypes.array.isRequired,
  searchParams: PropTypes.object.isRequired,
  setSearchParams: PropTypes.func.isRequired,
};

export default TeacherExamStudentsTable;
