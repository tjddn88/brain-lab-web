export interface Question {
  id: number;
  content: string;
  options: string[];
  difficulty: number;
  orderNum: number;
  category: string;
  correctRate: number | null;
  explanation?: string;
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
  category: string;
}

export interface ResultResponse {
  id: number;
  shareToken: string;
  nickname: string;
  score: number;
  correctCount: number;
  timeSeconds: number;
  rank: number;
  totalParticipants: number;
  topPercent: number;
  estimatedIq: number;
  answerFeedback?: QuestionFeedback[]; // 본인 결과 조회 시에만 포함
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  correctCount: number;
  timeSeconds: number;
  estimatedIq: number;
}

export interface PercentileEntry {
  topPercent: number;
  rank: number;
  nickname: string;
  score: number;
  correctCount: number;
  timeSeconds: number;
  estimatedIq: number;
}

export interface RankingResponse {
  topEntries: RankingEntry[];
  percentileEntries: PercentileEntry[];
  totalCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
