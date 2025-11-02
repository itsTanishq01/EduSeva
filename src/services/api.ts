const API_BASE_URL = "https://eclipsewastaken-eduseva.hf.space";

// Types
export interface UploadResponse {
  success: boolean;
  message: string;
  documentId: string;
  filename: string;
  timestamp: string;
  autoSelected: boolean;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: Array<{
    filename: string;
    chunkIndex: number;
    similarity: number;
    excerpt: string;
  }>;
  confidence: number;
  chunksUsed: number;
}

export interface Flashcard {
  front: string;
  back: string;
  type: string;
  difficulty: string;
}

export interface FlashcardsResponse {
  success: boolean;
  flashcards: Flashcard[];
  metadata: {
    totalCards: number;
    sourceDocument: string;
    generationDate: string;
    difficulty: string;
    coverageSummary: string;
  };
  documentId: string;
}

export interface SummaryResponse {
  success: boolean;
  summary: {
    overall: string;
    pageWise: Array<{
      page: number;
      summary: string;
    }>;
    keyTopics: string[];
  };
  metadata: {
    totalPages: number;
    sourceDocument: string;
    generationDate: string;
    summaryType: string;
  };
  documentId: string;
}

export interface QuestionPaperResponse {
  success: boolean;
  questionPaper: Array<{
    question: string;
    answer: string;
    marks: number;
    expectedWords: number;
    category: string;
  }>;
  metadata: {
    documentId: string;
    filename: string;
    difficulty: string;
    totalQuestions: number;
    totalMarks: number;
    breakdown: {
      oneMark: number;
      twoMark: number;
      threeMark: number;
    };
    generatedAt: string;
  };
  documentId: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  difficulty: string;
}

export interface QuizResponse {
  success: boolean;
  quiz: {
    quizId: string;
    questions: QuizQuestion[];
    metadata: {
      totalQuestions: number;
      sourceDocument: string;
      generationDate: string;
      difficulty: string;
    };
  };
  documentId: string;
}

export interface QuizSubmissionResponse {
  success: boolean;
  results: Array<{
    questionId: string;
    question: string;
    options: Record<string, string>;
    userAnswer: string;
    correctAnswer: string;
    correctAnswerText: string;
    isCorrect: boolean;
    correctAnswerExplanation: string;
    difficulty: string;
    wrongAnswerExplanation?: string;
    userAnswerText: string;
    allWrongAnswerExplanations: Record<string, string>;
  }>;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    performanceLevel: string;
    quizId: string;
    submittedAt: string;
  };
}

export interface ApiMindmapNode {
  id: string | { _type: string; value: string };
  label: string | { _type: string; value: string };
  description?: string | { _type: string; value: string };
  children?: ApiMindmapNode[] | { _type: string; value: string };
}

export interface MindmapResponse {
  success: boolean;
  mindmap: {
    name: string;
    attributes?: {
      id?: number;
      description?: string;
    };
    children?: Array<{
      name: string;
      attributes?: {
        id?: number;
        description?: string;
      };
      children?: any[];
    }>;
  };
  metadata: {
    totalNodes: number;
    maxDepth: number;
    sourceDocument: string;
    generationDate: string;
    centralTopic: string;
    chunksUsed: number;
    format: string;
  };
  documentId: string;
}

export interface PodcastSegment {
  segmentId: string;
  speaker: string;
  text: string;
  emotion: string;
  voice: string;
  wordCount: number;
  hasAudio: boolean;
  error?: string;
}

export interface PodcastResponse {
  success: boolean;
  podcastId: string;
  script: Array<{ speaker: string; text: string }>;
  audioSegments: PodcastSegment[];
  audioUrl: string | null;
  metadata: {
    totalSegments: number;
    estimatedDuration: string;
    sourceDocument: string;
    generationDate: string;
    podcastStyle: string;
    speakers: string[];
  };
  documentId: string;
}

// API Functions
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload document");
  }

  return response.json();
};

export const chat = async (question: string, sessionId: string = "default"): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, sessionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to chat");
  }

  return response.json();
};

export const generateFlashcards = async (params: {
  documentId?: string;
  topic?: string;
  numCards?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  cardTypes?: string[];
  tags?: string[];
}): Promise<FlashcardsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      topic: params.topic || "",
      numCards: params.numCards || 10,
      difficulty: params.difficulty || "intermediate",
      cardTypes: params.cardTypes || ["basic", "concept", "application"],
      tags: params.tags || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate flashcards");
  }

  return response.json();
};

export const summarizeDocument = async (params: {
  documentId?: string;
  summaryType?: "brief" | "comprehensive" | "detailed";
  includePageNumbers?: boolean;
}): Promise<SummaryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      summaryType: params.summaryType || "comprehensive",
      includePageNumbers: params.includePageNumbers ?? true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to summarize document");
  }

  return response.json();
};

export const generateQuestionPaper = async (params: {
  documentId?: string;
  oneMarkCount?: number;
  twoMarkCount?: number;
  threeMarkCount?: number;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
}): Promise<QuestionPaperResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/question-paper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      oneMarkCount: params.oneMarkCount || 10,
      twoMarkCount: params.twoMarkCount || 8,
      threeMarkCount: params.threeMarkCount || 8,
      topic: params.topic || "",
      difficulty: params.difficulty || "mixed",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate question paper");
  }

  return response.json();
};

export const generateQuiz = async (params: {
  documentId?: string;
  numQuestions?: number;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
}): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      numQuestions: params.numQuestions || 10,
      topic: params.topic || "",
      difficulty: params.difficulty || "medium",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate quiz");
  }

  return response.json();
};

export const submitQuiz = async (
  quizId: string | null,
  answers: Record<string, string>
): Promise<QuizSubmissionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quizId: quizId || null,
      answers,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to submit quiz");
  }

  return response.json();
};

export const generateMindmap = async (params: {
  documentId?: string;
  topic?: string;
  maxDepth?: number;
  maxNodesPerLevel?: number;
}): Promise<MindmapResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/mindmap/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      topic: params.topic || "",
      maxDepth: params.maxDepth || 4,
      maxNodesPerLevel: params.maxNodesPerLevel || 8,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate mindmap");
  }

  return response.json();
};

export const generatePodcast = async (params: {
  documentId?: string;
  topic?: string;
  podcastStyle?: "educational" | "conversational" | "storytelling";
  duration?: "short" | "medium" | "long";
}): Promise<PodcastResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/podcast/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId: params.documentId || null,
      topic: params.topic || "",
      podcastStyle: params.podcastStyle || "educational",
      duration: params.duration || "medium",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate podcast");
  }

  return response.json();
};

export const getPodcastAudioUrl = (podcastId: string): string => {
  return `${API_BASE_URL}/api/podcast/stream/${podcastId}`;
};
