export interface Question {
  id: number;
  content: string;
  options: string[];
  difficulty: number;
  orderNum: number;
  category: string;
  correctRate: number | null;
}

export interface QuestionsResponse {
  sessionToken: string;
  questions: Question[];
}

export interface AnswerItem {
  questionId: number;
  answer: number;
}

export interface QuestionFeedback {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface ResultResponse {
  id: number;
  nickname: string;
  score: number;
  correctCount: number;
  timeSeconds: number;
  rank: number;
  totalParticipants: number;
  topPercent: number;
  estimatedIq: number;
  answerFeedback: QuestionFeedback[];
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  correctCount: number;
  timeSeconds: number;
  estimatedIq: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
