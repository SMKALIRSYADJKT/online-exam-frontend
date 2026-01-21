import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import axios from "axios";
import type { ExamType } from "../types/exam";

type UserType = "SISWA" | "GURU" | "ADMIN";

interface ActionMenuProps {
  itemId: string | number;
  onEdit?: (id: string | number) => void;
  menu: string;
  type?: ExamType| UserType | null; // ← FIX
  onShowStudents?: (id: string | number) => void;
  onEditSiswa?: (id: string | number) => void;
  onStart?: (id: string | number) => void;
  onGrade?: () => void;
}

export default function ActionMenu({
  itemId,
  onEdit,
  menu,
  type,
  onShowStudents,
  onEditSiswa,
  onStart,
}: ActionMenuProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async (examId: string | number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `http://localhost:3000/api/exam-submissions/${examId}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.submitted) {
        Swal.fire("Peringatan!", "Anda sudah mengerjakan ujian ini.", "warning");
        return;
      }

      navigate(`/student/exam/${examId}`);
    } catch (err) {
      console.error("Error check submission:", err);
      Swal.fire("Error", "Gagal memeriksa status ujian", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaire = () => navigate(`/exam/${itemId}/questionnaire`);
  const handleViewDetail = () => navigate(`/exam-submissions/${itemId}`);
  const handleScoring = () => navigate(`/teacher-exam/submission/${itemId}`);

  return (
    <div className="relative inline-block text-left">
      <Menu as="div" className="relative">
        <div>
          <MenuButton
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
          </MenuButton>
        </div>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            className="fixed z-50 mt-2 w-36 origin-top-right right-0 rounded-xl bg-white shadow-lg ring-1 ring-black/10 focus:outline-none"
            style={{ transform: "translateX(-10px)" }}
          >
            <div className="py-1">
              {(menu === "exam" ||
                menu === "user" ||
                menu === "subjects" ||
                menu === "questionnaire") &&
                type !== "SISWA" && (
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => onEdit?.(itemId)}
                        className={`${
                          active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                        } w-full px-4 py-2 text-sm text-left`}
                      >
                        Edit
                      </button>
                    )}
                  </MenuItem>
                )}

              {menu === "user" && type === "SISWA" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onEditSiswa?.(itemId)}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
                    >
                      Edit
                    </button>
                  )}
                </MenuItem>
              )}

              {type === "REMEDIAL" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onShowStudents?.(itemId)}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
                    >
                      Students
                    </button>
                  )}
                </MenuItem>
              )}

              {menu === "exam" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleQuestionnaire}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
                    >
                      Questionnaire
                    </button>
                  )}
                </MenuItem>
              )}

              {menu === "studentExam" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      disabled={loading}
                      onClick={() => handleStartExam(itemId)}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left disabled:opacity-50`}
                    >
                      {loading ? "Loading..." : "Mulai Ujian"}
                    </button>
                  )}
                </MenuItem>
              )}

              {menu === "submittedExam" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleViewDetail}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
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
                      onClick={() => onShowStudents?.(itemId)}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
                    >
                      List Students
                    </button>
                  )}
                </MenuItem>
              )}

              {menu === "teacherExamSubmission" && (
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleScoring}
                      className={`${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      } w-full px-4 py-2 text-sm text-left`}
                    >
                      Scoring
                    </button>
                  )}
                </MenuItem>
              )}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
