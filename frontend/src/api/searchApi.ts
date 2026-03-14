// API service for semantic search operations
import { SearchResult, SearchQuery, PaginatedResults } from '../types/video';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const searchApi = {
  // Semantic search using natural language
  async semanticSearch(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('Error performing search:', error);
      // Return mock search results
      return generateMockSearchResults(query.query);
    }
  },

  // Get similar frames
  async getSimilarFrames(
    videoId: string,
    timestamp: number,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search/similar?videoId=${videoId}&timestamp=${timestamp}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch similar frames');
      return await response.json();
    } catch (error) {
      console.error('Error fetching similar frames:', error);
      return [];
    }
  },
};

// Generate mock search results based on query
function generateMockSearchResults(query: string): SearchResult[] {
  const keywords = query.toLowerCase();
  
  // Mock data with different scenarios
  const mockResults: SearchResult[] = [];
  
  if (keywords.includes('animal') || keywords.includes('wildlife') || keywords.includes('lion')) {
    mockResults.push(
      {
        id: 'r1',
        video: {
          id: '1',
          title: 'Nature Documentary - Wildlife Safari',
          duration: 3600,
          uploadedAt: '2026-03-10T10:00:00Z',
          thumbnailUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615',
          videoUrl: 'https://example.com/video1.mp4',
          status: 'ready',
        },
        frame: {
          id: 'f1',
          videoId: '1',
          timestamp: 145.5,
          thumbnailUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615',
        },
        similarity: 0.94,
        timestamp: 145.5,
      },
      {
        id: 'r2',
        video: {
          id: '1',
          title: 'Nature Documentary - Wildlife Safari',
          duration: 3600,
          uploadedAt: '2026-03-10T10:00:00Z',
          thumbnailUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7',
          videoUrl: 'https://example.com/video1.mp4',
          status: 'ready',
        },
        frame: {
          id: 'f2',
          videoId: '1',
          timestamp: 892.3,
          thumbnailUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7',
        },
        similarity: 0.89,
        timestamp: 892.3,
      }
    );
  }
  
  if (keywords.includes('food') || keywords.includes('cooking') || keywords.includes('pasta')) {
    mockResults.push({
      id: 'r3',
      video: {
        id: '2',
        title: 'Cooking Masterclass - Italian Cuisine',
        duration: 2400,
        uploadedAt: '2026-03-11T14:30:00Z',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
        videoUrl: 'https://example.com/video2.mp4',
        status: 'ready',
      },
      frame: {
        id: 'f3',
        videoId: '2',
        timestamp: 456.7,
        thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
      },
      similarity: 0.92,
      timestamp: 456.7,
    });
  }
  
  if (keywords.includes('tech') || keywords.includes('computer') || keywords.includes('ai')) {
    mockResults.push({
      id: 'r4',
      video: {
        id: '3',
        title: 'Tech Conference 2026 - AI & Machine Learning',
        duration: 5400,
        uploadedAt: '2026-03-12T09:00:00Z',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        videoUrl: 'https://example.com/video3.mp4',
        status: 'ready',
      },
      frame: {
        id: 'f4',
        videoId: '3',
        timestamp: 1234.2,
        thumbnailUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9',
      },
      similarity: 0.91,
      timestamp: 1234.2,
    });
  }
  
  if (keywords.includes('building') || keywords.includes('city') || keywords.includes('architecture')) {
    mockResults.push({
      id: 'r5',
      video: {
        id: '4',
        title: 'Urban Architecture Tour',
        duration: 1800,
        uploadedAt: '2026-03-09T16:20:00Z',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        videoUrl: 'https://example.com/video4.mp4',
        status: 'ready',
      },
      frame: {
        id: 'f5',
        videoId: '4',
        timestamp: 234.8,
        thumbnailUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
      },
      similarity: 0.88,
      timestamp: 234.8,
    });
  }
  
  // Default results if no keywords match
  if (mockResults.length === 0) {
    mockResults.push(
      {
        id: 'r6',
        video: {
          id: '1',
          title: 'Nature Documentary - Wildlife Safari',
          duration: 3600,
          uploadedAt: '2026-03-10T10:00:00Z',
          thumbnailUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615',
          videoUrl: 'https://example.com/video1.mp4',
          status: 'ready',
        },
        frame: {
          id: 'f6',
          videoId: '1',
          timestamp: 67.3,
          thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
        },
        similarity: 0.75,
        timestamp: 67.3,
      }
    );
  }
  
  return mockResults.sort((a, b) => b.similarity - a.similarity);
}
