// Custom hook for semantic search functionality
import { useState, useCallback } from 'react';
import { SearchResult, SearchQuery } from '../types/video';
import { searchApi } from '../api/searchApi';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLastQuery('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const searchQuery: SearchQuery = {
        query,
        limit: 20,
        minSimilarity: 0.7,
      };
      
      const searchResults = await searchApi.semanticSearch(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setLastQuery('');
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    lastQuery,
    search,
    clearResults,
  };
}
