// Application constants and configuration

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Video Processing Configuration
export const VIDEO_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  SUPPORTED_FORMATS: ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
  SUPPORTED_EXTENSIONS: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  FRAMES_PER_SECOND: 1, // Frame extraction rate
  THUMBNAIL_SIZE: {
    width: 640,
    height: 360,
  },
};

// Search Configuration
export const SEARCH_CONFIG = {
  DEFAULT_LIMIT: 20,
  MIN_SIMILARITY: 0.7,
  MAX_RESULTS: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
};

// CLIP Model Configuration
export const CLIP_CONFIG = {
  MODEL_NAME: 'ViT-B/32',
  EMBEDDING_DIM: 512,
  IMAGE_SIZE: 224,
};

// UI Configuration
export const UI_CONFIG = {
  RESULTS_PER_PAGE: 12,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
};

// Status Types
export const VIDEO_STATUS = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  EXTRACTING: 'extracting',
  EMBEDDING: 'embedding',
  READY: 'ready',
  FAILED: 'failed',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  SEARCH_FAILED: 'Search failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_FILE: 'Invalid file format. Please upload a supported video file.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 2GB.',
  NO_RESULTS: 'No results found for your query.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: 'Video uploaded successfully!',
  UPLOAD_PROCESSING: 'Video is being processed. It will be searchable soon.',
  VIDEO_DELETED: 'Video deleted successfully.',
};

// Example Search Queries
export const EXAMPLE_QUERIES = [
  'animals in the wild',
  'cooking pasta',
  'people presenting on stage',
  'modern buildings',
  'sunset over ocean',
  'person using laptop',
  'city street at night',
  'food on a plate',
];

// Video Player Configuration
export const PLAYER_CONFIG = {
  SKIP_FORWARD: 10, // seconds
  SKIP_BACKWARD: 10, // seconds
  VOLUME_STEP: 0.1,
  DEFAULT_VOLUME: 1,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};
