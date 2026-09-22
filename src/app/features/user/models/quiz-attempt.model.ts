export enum AttemptQuestionType {
  SingleChoice = 0,
  MultipleSelect = 1,
  TrueFalse = 2,
}

export interface AttemptAnswerOption {
  id: number;
  text: string;
}

export interface AttemptQuestion {
  id: number;
  content: string;
  image: string;
  questionType: AttemptQuestionType;
  answers: AttemptAnswerOption[];
}

export interface QuizAttemptSession {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  duration: number;
  startedAt: string;
  expiresAt: string;
  status: number;
  questions: AttemptQuestion[];
}

export interface SubmitAttemptRequest {
  answers: Array<{ questionId: number; answerIds: number[] }>;
}

export interface AttemptQuestionResult {
  questionId: number;
  isCorrect: boolean;
}

export interface QuizAttemptResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  isPassed: boolean;
  passedScore: number;
  correctAnswers: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  questionResults: AttemptQuestionResult[];
}

export interface AttemptAnswerReview {
  id: number;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
}

export interface AttemptQuestionReview {
  id: number;
  number: number;
  content: string;
  image: string;
  questionType: AttemptQuestionType;
  isCorrect: boolean;
  isAnswered: boolean;
  answers: AttemptAnswerReview[];
}

export interface QuizAttemptReview {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  isPassed: boolean;
  passedScore: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  questions: AttemptQuestionReview[];
}
