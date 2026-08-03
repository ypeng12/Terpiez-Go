import React from 'react';
import { DiscoveryFeedItem } from '../../types/terpiez';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { Sparkles, MapPin, Compass, ArrowRight } from 'lucide-react';
import './DiscoveryCard.css';

export interface DiscoveryCardProps {
  item: DiscoveryFeedItem;
  onSelect: (item: DiscoveryFeedItem) => void;
  onCapture: (item: DiscoveryFeedItem) => void;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  item,
  onSelect,
  onCapture,
}) => {
  const { terpiez, distanceMeters, scores } = item;

  return (
    <div className="discovery-hero-card glass-panel" onClick={() => onSelect(item)}>
      {/* Top Banner */}
      <div className="discovery-header">
        <div className="recommendation-badge">
          <Sparkles size={16} className="animate-spin-slow" />
          <span>Recommended for You</span>
        </div>
        <div className="rank-badge">#{item.rank} Top Match</div>
      </div>

      <div className="discovery-grid">
        {/* Left: Avatar */}
        <div className="avatar-section">
          <img src={terpiez.imageUrl} alt={terpiez.name} className="hero-avatar animate-float" />
          <div className="rarity-pill" data-rarity={terpiez.rarity}>
            {terpiez.rarity}
          </div>
        </div>

        {/* Center: Info & Scoring Rationale */}
        <div className="info-section">
          <h2 className="hero-name">{terpiez.name}</h2>
          <div className="reason-box">
            <span className="reason-icon">💡</span>
            <span className="reason-text">{scores.reason}</span>
          </div>

          {/* Transparent Scoring Formula Breakdown */}
          <div className="scoring-breakdown">
            <span className="breakdown-title">Discovery Score Breakdown:</span>
            <div className="metrics-grid">
              <ProgressBar label="Preference (30%)" value={scores.preferenceScore * 100} height={6} />
              <ProgressBar label="Distance (25%)" value={scores.distanceScore * 100} height={6} />
              <ProgressBar label="Rarity (20%)" value={scores.rarityScore * 100} height={6} />
              <ProgressBar label="Freshness (15%)" value={scores.freshnessScore * 100} height={6} />
            </div>
          </div>

          <div className="location-meta">
            <MapPin size={16} color="var(--accent-cyan)" />
            <span>{terpiez.location.placeName}</span>
            <span className="meta-bullet">•</span>
            <Compass size={16} color="var(--accent-amber)" />
            <span>{distanceMeters} meters away</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="action-section">
          <div className="score-total">
            <span className="score-num">{(scores.totalScore * 100).toFixed(0)}</span>
            <span className="score-label">MATCH SCORE</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={18} />}
            onClick={(e) => {
              e.stopPropagation();
              onCapture(item);
            }}
          >
            Capture Now
          </Button>
        </div>
      </div>
    </div>
  );
};
