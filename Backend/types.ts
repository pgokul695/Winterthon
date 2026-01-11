// Type definitions for the question generation system

export interface GeneratedOption {
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface GeneratedQuestion {
  questionText: string;
  options?: GeneratedOption[];
  solution?: string;
  questionType: string;
  timeTaken: number;
  rawOutput?: string;
  parsedData?: any;
}

export interface QuestionRequest {
  mode: "ollama" | "gemini";
  model: string;
  transcript: string;
  questionTypes: Record<string, number>; // e.g., {"SOL": 2, "SML": 1}
}

export interface YoutubeQuestionRequest {
  videoUrl: string;  // YouTube URL or video ID
  startTime?: number;  // Start time in seconds
  endTime?: number;    // End time in seconds
  mode?: "ollama" | "gemini";  // Optional, defaults to "ollama"
  model?: string;  // Optional, defaults to "gemma:latest"
  questionTypes?: Record<string, number>;  // Optional, defaults to {"MCQ": 3}
}

export interface QuestionResponse {
  questions: GeneratedQuestion[];
  totalTime: number;
  mode: string;
  model: string;
  logId: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  mode: string;
  model: string;
  questionTypes: Record<string, number>;
  totalTime: number;
  questionsGenerated: number;
  questions: GeneratedQuestion[];
  prompts: Array<{
    questionType: string;
    prompt: string;
    response: string;
    timeTaken: number;
  }>;
  transcript: string;
}

export interface ParsedMCQ {
  question: string;
  correct: string;
  wrong: string[];
  explanations: string[];
}
