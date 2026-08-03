import React from 'react';
import './FilterChip.css';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  count?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'rarity' | 'type';
  colorHex?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onToggle,
  count,
  icon,
  colorHex,
}) => {
  return (
    <button
      type="button"
      className={`filter-chip ${selected ? 'selected' : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
      style={selected && colorHex ? { borderColor: colorHex, boxShadow: `0 0 12px ${colorHex}55` } : {}}
    >
      {icon && <span className="chip-icon">{icon}</span>}
      <span className="chip-label">{label}</span>
      {count !== undefined && <span className="chip-count">{count}</span>}
    </button>
  );
};
