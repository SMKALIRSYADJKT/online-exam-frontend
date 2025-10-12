export const roleMenus: Record<string, string[]> = {
  SISWA: ['dashboard', 'ujian', 'exam_submissions'],
  GURU: ['dashboard', 'exam', 'subject', 'teacher_exam'],
  ADMIN: ['dashboard', 'exam', 'subject', 'user_management', 'laporan', 'exam_submissions', 'teacher_exam'],
};

export const menus = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    icon: 'FaHome',
    path: '/dashboard',
  },
  {
    name: 'ujian',
    title: 'Ujian',
    icon: 'FaClipboardList',
    path: '/student/exam',
  },
  {
    name: 'exam',
    title: 'Soal Ujian',
    icon: 'FaQuestionCircle',
    path: '/exam',
  },
  {
    name: 'exam_submissions',
    title: 'Hasil Ujian',
    icon: 'FaFileAlt',
    path: '/student/exam-submissions',
  },
  {
    name: 'teacher_exam',
    title: 'Skor Ujian',
    icon: 'FaCheckCircle',
    path: '/teacher-exam',
  },
  {
    name: 'subject',
    title: 'Mata Pelajaran',
    icon: 'FaBook',
    path: '/subjects',
  },
  {
    name: 'user_management',
    title: 'User Management',
    icon: 'FaUsers',
    path: '/user-management',
  },
  {
    name: 'laporan',
    title: 'Laporan',
    icon: 'FaChartBar',
    path: '/laporan',
  },
];