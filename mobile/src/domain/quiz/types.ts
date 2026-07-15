export interface QuizQuestion {
  prompt: string;
  options: readonly string[];
  correctIndex: number;
}
