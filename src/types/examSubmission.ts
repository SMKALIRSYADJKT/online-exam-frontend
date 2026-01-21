export interface Subject {
  id: string | number;
  name: string;
}

export interface Exam {
  id: number;
  title: string;
  subject_id: string | number;
  subject?: Subject | string | null;
  type: "REGULER" | "REMEDIAL" | null;
}

export interface QuestionOption {
  type: "text" | "image";
  value: string;
}

export interface Question {
  id: number;
  question: string;
  options?: QuestionOption[];
  answer?: string | object | null;
}

export interface AnswerItem {
  question: Question | string | null;
  answer: string | object | null;
}

export interface ExamSubmissionResult {
  id: number;
  exam: Exam | null;
  created_at: string | null;
  score: number | null;
  answers: AnswerItem[];
}
