import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaBookOpen,
  FaUserGraduate,
  FaClock,
  FaBullhorn,
  FaTasks,
  FaClipboardList,
} from "react-icons/fa";
import axios from "axios";

// =======================
// Types
// =======================

interface Stats {
  totalExams: number;
  totalStudents: number;
  activeExams: number;
  completedExams: number;
  averageScore: number;
}

interface Announcement {
  title: string;
  content: string;
  date: string;
}

interface ActiveExam {
  title: string;
  subject: string;
  date: string;
}

interface RecentScore {
  examTitle: string;
  subject: string;
  score: number;
}

interface StudentDashboardData {
  activeExams: ActiveExam[];
  recentScores: RecentScore[];
}

type UserRole = "admin" | "teacher" | "student";

const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem("role") as UserRole) || "student"
  );

  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    totalStudents: 0,
    activeExams: 0,
    completedExams: 0,
    averageScore: 0,
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [studentData, setStudentData] = useState<StudentDashboardData>({
    activeExams: [],
    recentScores: [],
  });

  // =======================
  // Fetch Dashboard Data
  // =======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (userRole === "admin" || userRole === "teacher") {
          const res = await axios.get("http://localhost:3000/api/dashboard-data", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setStats(res.data.stats || stats);
          setAnnouncements(res.data.announcements || []);
        } else {
          const res = await axios.get("http://localhost:3000/api/student-dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setStudentData(res.data || { activeExams: [], recentScores: [] });
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      }
    };

    fetchData();
  }, [userRole]);

  // =======================
  // Render
  // =======================
  return (
    <Sidebar>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Assalamu’alaikum 👋
        </h1>

        <p className="text-gray-600 text-lg">
          {userRole === "student" ? (
            <>
              Selamat datang di{" "}
              <span className="font-semibold text-emerald-600">
                Dashboard Siswa Al-Irsyad
              </span>
              . Siapkan dirimu untuk belajar dengan semangat! ✨
            </>
          ) : (
            <>
              Selamat datang di{" "}
              <span className="font-semibold text-emerald-600">
                Dashboard Guru/Admin Al-Irsyad
              </span>
              . Pantau dan kelola kegiatan ujian dengan mudah. 📊
            </>
          )}
        </p>
      </div>

      {/* DASHBOARD ADMIN / GURU */}
      {userRole !== "student" ? (
        <>
          {/* Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between transform hover:scale-105 transition-all">
              <div>
                <h3 className="text-lg font-medium">Total Ujian</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalExams}</p>
              </div>
              <FaBookOpen className="text-4xl opacity-80" />
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between transform hover:scale-105 transition-all">
              <div>
                <h3 className="text-lg font-medium">Total Siswa</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              </div>
              <FaUserGraduate className="text-4xl opacity-80" />
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between transform hover:scale-105 transition-all">
              <div>
                <h3 className="text-lg font-medium">Ujian Aktif</h3>
                <p className="text-3xl font-bold mt-2">{stats.activeExams}</p>
              </div>
              <FaClock className="text-4xl opacity-80" />
            </div>
          </div>

          {/* Pengumuman */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FaBullhorn className="text-emerald-600 text-2xl" />
              <h2 className="text-xl font-semibold text-gray-800">Pengumuman</h2>
            </div>

            {announcements.length === 0 ? (
              <p className="text-gray-500 italic">Belum ada pengumuman terbaru.</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a, idx) => (
                  <li
                    key={idx}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 hover:bg-emerald-100 transition-all"
                  >
                    <h4 className="font-semibold text-emerald-800">{a.title}</h4>
                    <p className="text-gray-700 mt-1 text-sm">{a.content}</p>
                    <span className="text-xs text-gray-500 block mt-2">
                      {new Date(a.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Ujian Aktif */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaTasks className="text-emerald-600 text-2xl" />
              <h2 className="text-xl font-semibold text-gray-800">Ujian Aktif</h2>
            </div>

            {studentData.activeExams.length ? (
              <ul className="space-y-3">
                {studentData.activeExams.map((exam, i) => (
                  <li
                    key={i}
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-emerald-800">
                        {exam.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Mata Pelajaran: {exam.subject}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(exam.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Tidak ada ujian aktif.</p>
            )}
          </div>

          {/* Nilai Terbaru */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaClipboardList className="text-emerald-600 text-2xl" />
              <h2 className="text-xl font-semibold text-gray-800">Nilai Terbaru</h2>
            </div>

            {studentData.recentScores.length ? (
              <ul className="space-y-3">
                {studentData.recentScores.map((s, idx) => (
                  <li
                    key={idx}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-100"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">{s.examTitle}</h4>
                      <p className="text-sm text-gray-600">{s.subject}</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">
                      {s.score}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Belum ada nilai ujian.</p>
            )}
          </div>

          {/* Quote */}
          <div className="mt-10 bg-gradient-to-r from-emerald-100 to-green-50 rounded-2xl border border-green-200 p-6 text-center shadow-sm">
            <p className="text-lg italic text-gray-700">
              “Barang siapa menempuh jalan untuk mencari ilmu, maka Allah akan
              memudahkan baginya jalan menuju surga.” <br />
              <span className="text-sm text-gray-600">— HR. Muslim</span>
            </p>
          </div>
        </>
      )}
    </Sidebar>
  );
};

export default Dashboard;
