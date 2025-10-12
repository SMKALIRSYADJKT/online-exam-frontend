import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";

// Importing the pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Users from "./pages/Users";
import Exam from "./pages/Exam";
import StudentExam from "./pages/StudentExam";
import SubmittedExam from "./pages/SubmittedExam";
import SubmittedExamDetail from "./pages/SubmittedExamDetail";
import StudentExamPage from "./pages/StudentExamPage";
import TeacherExam from "./pages/TeacherExam";
import TeacherExamStudents from "./pages/TeacherExamStudents";
import TeacherExamScoring from "./pages/TeacherExamScoring";
import Questionnaire from "./pages/Questionnaire";
import Subject from "./pages/Subject";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />  
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <Users />  
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam"
          element={
            <ProtectedRoute>
              <Exam />  
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:examId/questionnaire"
          element={
            <ProtectedRoute>
              <Questionnaire />  
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subject />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/exam"
          element={
            <ProtectedRoute>
              <StudentExam />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/exam/:examId"
          element={
            <ProtectedRoute>
              <StudentExamPage />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/exam-submissions"
          element={
            <ProtectedRoute>
              <SubmittedExam />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/submitted-exam/:submissionId"
          element={
            <ProtectedRoute>
              <SubmittedExamDetail />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher-exam"
          element={
            <ProtectedRoute>
              <TeacherExam />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher-exam/:examId/students"
          element={
            <ProtectedRoute>
              <TeacherExamStudents />  
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher-exam/submission/:submissionId"
          element={
            <ProtectedRoute>
              <TeacherExamScoring />  
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
