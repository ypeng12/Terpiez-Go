import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  color,
  height = 8,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="progress-container">
      {(label || showPercent) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showPercent && <span className="progress-value">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className="progress-fill"
          style={{
            width: `${clampedValue}%`,
            background: color || 'var(--grad-primary)',
          }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
