// Type definitions for video search system

export interface VideoMetadata {
  id: string;
  title: string;
  duration: number;
  uploadedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: 'processing' | 'ready' | 'failed';
  totalFrames?: number;
}

export interface FrameEmbedding {
  id: string;
  videoId: string;
  timestamp: number;
  thumbnailUrl: string;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  video: VideoMetadata;
  frame: FrameEmbedding;
  similarity: number;
  timestamp: number;
}

export interface SearchQuery {
  query: string;
  limit?: number;
  minSimilarity?: number;
}

export interface UploadProgress {
  videoId: string;
  progress: number;
  status: 'uploading' | 'extracting' | 'embedding' | 'complete' | 'error';
  message?: string;
}

export interface PaginatedResults<T> {
  results: T[];
  total: number;
  page: number;
  pageSize: number;
}
