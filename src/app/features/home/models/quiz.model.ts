export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  image: string;
  isActive: boolean;
  passedScore: number;
  attempts: number;
  numberOfQuestions: number;
  passRate: number;
  createdAt: string;
  updatedAt: string;
}
