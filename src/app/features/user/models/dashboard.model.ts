import { Quiz } from "../../home/models/quiz.model";

export interface QuizAttempt {
  id: number;
  startedAt: string;
  expiresAt: string;
  submittedAt: string;
  score: number;
  isPassed: boolean;
  status: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  quiz: Quiz;
}

export interface AttemptHistoryResult {
  items: QuizAttempt[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  totalCompleted: number;
  averageScore: number;
  passedAttempts: number;
  totalDurationSeconds: number;
  bestScore: number;
  bestQuizTitle: string | null;
}
