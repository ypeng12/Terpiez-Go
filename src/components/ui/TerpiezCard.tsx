import React from 'react';
import { Terpiez } from '../../types/terpiez';
import { Button } from './Button';
import { MapPin, Zap, Shield, Heart, CheckCircle2 } from 'lucide-react';
import './TerpiezCard.css';

export interface TerpiezCardProps {
  terpiez: Terpiez;
  variant?: 'discovery' | 'nearby' | 'captured' | 'trending' | 'compact';
  status?: 'nearby' | 'captured' | 'spawning' | 'despawned';
  distanceMeters?: number;
  onSelect?: (terpiez: Terpiez) => void;
  onCapture?: (terpiez: Terpiez) => void;
  onToggleFavorite?: (terpiez: Terpiez) => void;
  reason?: string;
  score?: number;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common': return 'var(--rarity-common)';
    case 'Rare': return 'var(--rarity-rare)';
    case 'Epic': return 'var(--rarity-epic)';
    case 'Legendary': return 'var(--rarity-legendary)';
    case 'Mythic': return 'var(--rarity-mythic)';
    default: return 'var(--rarity-common)';
  }
};

export const TerpiezCard: React.FC<TerpiezCardProps> = ({
  terpiez,
  variant = 'discovery',
  status,
  distanceMeters,
  onSelect,
  onCapture,
  onToggleFavorite,
  reason,
  score,
}) => {
  const rarityColor = getRarityColor(terpiez.rarity);
  const isCaptured = status === 'captured' || terpiez.isCaptured;

  return (
    <div
      className={`terpiez-card card-${variant} glass-panel`}
      onClick={() => onSelect?.(terpiez)}
      style={{ '--card-accent': rarityColor } as React.CSSProperties}
      role="article"
      aria-label={`${terpiez.name}, ${terpiez.rarity} ${terpiez.type} Terpiez`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(terpiez);
        }
      }}
    >
      {/* Header Badge */}
      <div className="card-header">
        <span className="rarity-badge" style={{ backgroundColor: rarityColor }}>
          {terpiez.rarity}
        </span>
        <span className="type-badge">{terpiez.type}</span>

        {score !== undefined && (
          <span className="score-badge" title="Discovery Score">
            ⚡ {(score * 100).toFixed(0)} pts
          </span>
        )}

        <button
          className={`favorite-btn ${terpiez.isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(terpiez);
          }}
          aria-label={terpiez.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={terpiez.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Image Preview */}
      <div className="card-avatar-wrapper">
        <img
          src={terpiez.imageUrl}
          alt={terpiez.name}
          className="card-avatar animate-float"
          loading="lazy"
        />
        {isCaptured && (
          <div className="captured-overlay">
            <CheckCircle2 size={24} color="var(--accent-emerald)" />
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="card-body">
        <h3 className="terpiez-name">
          #{String(terpiez.speciesNumber).padStart(3, '0')} {terpiez.name}
        </h3>
        
        {reason && (
          <div className="reason-tag" title="Recommendation Rationale">
            🎯 {reason}
          </div>
        )}

        <p className="terpiez-desc">{terpiez.description}</p>

        {/* Location & Distance */}
        <div className="location-row">
          <MapPin size={14} className="location-icon" />
          <span className="location-text">{terpiez.location.placeName}</span>
          {distanceMeters !== undefined && (
            <span className="distance-tag">{distanceMeters}m away</span>
          )}
        </div>

        {/* Mini Stats */}
        <div className="stats-row">
          <div className="stat-pill"><Zap size={12} /> ATK {terpiez.attack}</div>
          <div className="stat-pill"><Shield size={12} /> DEF {terpiez.defense}</div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="card-footer">
        {isCaptured ? (
          <Button variant="secondary" size="sm" fullWidth disabled>
            Captured
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onCapture?.(terpiez);
            }}
          >
            Capture Terpiez
          </Button>
        )}
      </div>
    </div>
  );
};
