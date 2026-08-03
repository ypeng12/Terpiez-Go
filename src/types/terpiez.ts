export type TerpiezRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type TerpiezType = 
  | 'Water'
  | 'Fire'
  | 'Electric'
  | 'Grass'
  | 'Psychic'
  | 'Dark'
  | 'Dragon'
  | 'Cyber';

export interface Location {
  latitude: number;
  longitude: number;
  placeName: string;
}

export interface Terpiez {
  id: string;
  name: string;
  speciesNumber: number;
  type: TerpiezType;
  rarity: TerpiezRarity;
  description: string;
  imageUrl: string;
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  location: Location;
  isCaptured?: boolean;
  capturedAt?: string;
  isFavorite?: boolean;
  spawnTimeRemaining?: number; // seconds
}

export interface DiscoveryScoreDetails {
  totalScore: number;
  preferenceScore: number; // 30%
  distanceScore: number;   // 25%
  rarityScore: number;     // 20%
  freshnessScore: number;  // 15%
  popularityScore: number; // 10%
  reason: string;
}

export interface DiscoveryFeedItem {
  terpiez: Terpiez;
  distanceMeters: number;
  scores: DiscoveryScoreDetails;
  feedSource: 'for_you' | 'nearby' | 'trending';
  rank: number;
}

export type EventType = 
  | 'terpiez_viewed'
  | 'terpiez_clicked'
  | 'terpiez_captured'
  | 'terpiez_favorited'
  | 'terpiez_searched';

export interface UserTelemetryEvent {
  eventId: string;
  eventType: EventType;
  userId: string;
  terpiezId: string;
  timestamp: string;
  metadata?: {
    source?: string;
    rank?: number;
    distanceMeters?: number;
  };
}

export interface PerformanceMetrics {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  redisCacheHitRate: number;
  requestsPerSecond: number;
  activeUsers: number;
  captureConversionRate: number;
  totalEventsProcessed: number;
}
