export type ExamType = "REGULER" | "REMEDIAL" | null;

export interface Subject { id: string | number; name: string; }

export interface Exam {
  id: number;
  title: string;
  subject_id: string;
  subject?: Subject;
  type: ExamType;
  date: string;
  duration: number;
}
