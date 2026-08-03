import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search Terpiez species or location...',
  onClear,
}) => {
  return (
    <div className="search-bar-container">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search Terpiez"
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search query"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
