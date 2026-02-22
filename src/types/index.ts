export interface Question {
  id: number;
  content: string;
  options: string[];
  answer: number;
  difficulty: number;
  orderNum: number;
  category: string;
  correctRate: number | null;
}

export interface AnswerItem {
  questionId: number;
  answer: number;
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
