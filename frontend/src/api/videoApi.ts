// API service for video operations
import { VideoMetadata, UploadProgress } from '../types/video';

// Configure your FastAPI backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const videoApi = {
  // Get all videos
  async getAllVideos(): Promise<VideoMetadata[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Return mock data for demo
      return generateMockVideos();
    }
  },

  // Get video by ID
  async getVideo(id: string): Promise<VideoMetadata> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}`);
      if (!response.ok) throw new Error('Failed to fetch video');
      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      return generateMockVideos()[0];
    }
  },

  // Upload video
  async uploadVideo(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VideoMetadata> {
    try {
      const formData = new FormData();
      formData.append('video', file);

      // Simulate upload progress for demo
      if (onProgress) {
        simulateUploadProgress(onProgress);
      }

      const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Error uploading video:', error);
      // Return mock response
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        duration: 0,
        uploadedAt: new Date().toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1574267432644-f00c82fe5a8a',
        videoUrl: URL.createObjectURL(file),
        status: 'processing',
      };
    }
  },

  // Delete video
  async deleteVideo(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete video');
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  },
};

// Mock data generator
function generateMockVideos(): VideoMetadata[] {
  return [
    {
      id: '1',
      title: 'Nature Documentary - Wildlife Safari',
      duration: 3600,
      uploadedAt: '2026-03-10T10:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615',
      videoUrl: 'https://example.com/video1.mp4',
      status: 'ready',
      totalFrames: 3600,
    },
    {
      id: '2',
      title: 'Cooking Masterclass - Italian Cuisine',
      duration: 2400,
      uploadedAt: '2026-03-11T14:30:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
      videoUrl: 'https://example.com/video2.mp4',
      status: 'ready',
      totalFrames: 2400,
    },
    {
      id: '3',
      title: 'Tech Conference 2026 - AI & Machine Learning',
      duration: 5400,
      uploadedAt: '2026-03-12T09:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      videoUrl: 'https://example.com/video3.mp4',
      status: 'ready',
      totalFrames: 5400,
    },
    {
      id: '4',
      title: 'Urban Architecture Tour',
      duration: 1800,
      uploadedAt: '2026-03-09T16:20:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
      videoUrl: 'https://example.com/video4.mp4',
      status: 'ready',
      totalFrames: 1800,
    },
  ];
}

// Simulate upload progress
function simulateUploadProgress(onProgress: (progress: UploadProgress) => void) {
  const videoId = Math.random().toString(36).substr(2, 9);
  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;
    
    if (progress <= 30) {
      onProgress({
        videoId,
        progress,
        status: 'uploading',
        message: 'Uploading video...',
      });
    } else if (progress <= 60) {
      onProgress({
        videoId,
        progress,
        status: 'extracting',
        message: 'Extracting frames...',
      });
    } else if (progress <= 90) {
      onProgress({
        videoId,
        progress,
        status: 'embedding',
        message: 'Generating embeddings...',
      });
    } else {
      onProgress({
        videoId,
        progress: 100,
        status: 'complete',
        message: 'Processing complete!',
      });
      clearInterval(interval);
    }
  }, 500);
}
