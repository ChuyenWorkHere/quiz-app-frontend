export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
  questionId: number;
}

export interface Question {
  id: number;
  content: string;
  image: string;
  level: number;
  questionType: number;
  quizId: number | null;
  quizTitle: string;
  answers: Answer[];
}
