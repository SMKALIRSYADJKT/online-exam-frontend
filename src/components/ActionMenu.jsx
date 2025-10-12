import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import Swal from "sweetalert2";
import axios from "axios";

export default function ActionMenu({ itemId, onEdit, menu, type, onShowStudents, onEditSiswa, onStart }) {
	const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async (examId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 🔎 cek apakah sudah pernah submit ujian ini
      const { data } = await axios.get(
        `http://localhost:3000/api/exam-submissions/${examId}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.submitted) {
        Swal.fire("Peringatan!", "Anda sudah mengerjakan ujian ini.", "warning");
        return;
      }

      // ✅ kalau belum submit → navigate
      navigate(`/student/exam/${examId}`);
    } catch (err) {
      console.error("Error check submission:", err);
      Swal.fire("Error", "Gagal memeriksa status ujian", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaire = () => {
    navigate(`/exam/${itemId}/questionnaire`);
  };

  const handleViewDetail = () => {
    navigate(`/student/submitted-exam/${itemId}`);
  };

  const handleScoring = (itemId) => {
    navigate(`/teacher-exam/submission/${itemId}`);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="p-2 hover:bg-gray-100 rounded-full">
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
      </MenuButton>

      <MenuItems className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {menu !== "studentExam" && menu !== "submittedExam" && menu !== "teacherExamSubmission" && type !== "SISWA" &&
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => onEdit(itemId)}
                >
                  Edit
                </button>
              )}
            </MenuItem>
          }
          {menu === "user" && 
            type === "SISWA" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => onEditSiswa(itemId)}
                >
                  Edit
                </button>
              )}
            </MenuItem>
            )
          }
          {/* Students Button (hanya untuk remedial) */}
          {type === "REMEDIAL" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => onShowStudents(itemId)}
                >
                  Students
                </button>
              )}
            </MenuItem>
          )}

          {menu == "exam" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={handleQuestionnaire}
                >
                  Questionnaire
                </button>
              )}
            </MenuItem>
          )}

          {menu == "studentExam" && (
            <MenuItem>
              {({ active }) => (
                <button
                  disabled={loading}
                  className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => handleStartExam(itemId)}
                >
                  {loading ? "Loading..." : "Start Exam"}
                </button>
              )}
            </MenuItem>
          )}

          {menu === "submittedExam" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={handleViewDetail}
                >
                  Lihat Detail
                </button>
              )}
            </MenuItem>
          )}

          {menu === "teacherExam" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-100' : ''} w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => onShowStudents && onShowStudents(itemId)}
                >
                  List Students
                </button>
              )}
            </MenuItem>
          )}

          {/* Scoring (di halaman /teacher-exam/:examId/students) */}
          {menu === "teacherExamSubmission" && (
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => handleScoring(itemId)}
                >
                  Scoring
                </button>
              )}
            </MenuItem>
          )}
        </div>
      </MenuItems>
    </Menu>
  )
}
