import React, { useState, useEffect, useCallback } from 'react';
import '../style/searchbar.css'

interface SearchBarProps {
  placeholder?: string;
  keyword?: string;
  api?: string;
  limit?: number;
  onSearch?: (query: string) => void;
  onResults?: (results: any[]) => void;
}

export default function SearchBar({
  placeholder = "Search...",
  keyword = "",
  api,
  limit = 10,
  onSearch,
  onResults
}: SearchBarProps) {
  const [query, setQuery] = useState(keyword);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounce = useCallback(
    (func: Function, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      return (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    },
    []
  );

  const performSearch = async (searchQuery: string) => {
    if (!api || !searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${api}?q=${encodeURIComponent(searchQuery)}&limit=${limit}`);
      const data = await response.json();
      setResults(data);
      setShowDropdown(true);
      onResults?.(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [api, limit, onResults]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleResultClick = (result: any) => {
    setQuery(result.title || result.name || result.value || '');
    setShowDropdown(false);
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowDropdown(true)}
        />
        <div className="search-icon">
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleResultClick(result)}
            >
              <div className="result-title">
                {result.title || result.name || result.value || 'No title'}
              </div>
              {result.description && (
                <div className="result-description">
                  {result.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}