import { Terpiez, DiscoveryFeedItem, DiscoveryScoreDetails, UserTelemetryEvent } from '../types/terpiez';

// Calculate Haversine distance in meters
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Compute Twitch Discovery weighted recommendation score
export const computeDiscoveryScore = (
  terpiez: Terpiez,
  userCapturedTypes: Record<string, number>,
  userLat: number,
  userLng: number
): DiscoveryScoreDetails => {
  // 1. Preference Score (30%)
  const capturedCount = userCapturedTypes[terpiez.type] || 0;
  const preferenceScore = Math.min(1.0, capturedCount / 4.0);

  // 2. Distance Score (25%)
  const distMeters = calculateDistanceMeters(
    userLat,
    userLng,
    terpiez.location.latitude,
    terpiez.location.longitude
  );
  const distanceScore = Math.max(0.0, 1.0 - distMeters / 2500.0);

  // 3. Rarity Score (20%)
  const rarityWeights: Record<string, number> = {
    Common: 0.35,
    Rare: 0.55,
    Epic: 0.75,
    Legendary: 0.92,
    Mythic: 1.0,
  };
  const rarityScore = rarityWeights[terpiez.rarity] || 0.35;

  // 4. Freshness Score (15%)
  const spawnRem = terpiez.spawnTimeRemaining || 1800;
  const freshnessScore = Math.min(1.0, spawnRem / 1800.0);

  // 5. Popularity Score (10%)
  const popularityScore = (terpiez.attack + terpiez.defense + terpiez.speed) / 300.0;

  // Final Weighted Total Score
  const totalScore =
    0.30 * preferenceScore +
    0.25 * distanceScore +
    0.20 * rarityScore +
    0.15 * freshnessScore +
    0.10 * popularityScore;

  // Generate Rationale String
  let reason = '';
  if (capturedCount > 0) {
    reason = `Recommended because you captured ${capturedCount} ${terpiez.type} Terpiez`;
  } else if (distMeters < 600) {
    reason = `Nearby discovery: Only ${distMeters} meters from your location`;
  } else if (terpiez.rarity === 'Legendary' || terpiez.rarity === 'Mythic') {
    reason = `Rare Event: High-value ${terpiez.rarity} ${terpiez.name} detected`;
  } else {
    reason = `Trending species with high community activity near ${terpiez.location.placeName}`;
  }

  return {
    totalScore,
    preferenceScore,
    distanceScore,
    rarityScore,
    freshnessScore,
    popularityScore,
    reason,
  };
};

// Generate For You feed
export const generateForYouFeed = (
  allTerpiez: Terpiez[],
  capturedTypes: Record<string, number>,
  userLat: number,
  userLng: number
): DiscoveryFeedItem[] => {
  const scored = allTerpiez.map((t) => {
    const dist = calculateDistanceMeters(
      userLat,
      userLng,
      t.location.latitude,
      t.location.longitude
    );
    const scores = computeDiscoveryScore(t, capturedTypes, userLat, userLng);
    return {
      terpiez: t,
      distanceMeters: dist,
      scores,
      feedSource: 'for_you' as const,
      rank: 0,
    };
  });

  scored.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
  return scored.map((item, index) => ({ ...item, rank: index + 1 }));
};

// Event Telemetry Dispatcher
export const sendTelemetryEvent = async (
  eventType: UserTelemetryEvent['eventType'],
  terpiezId: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const eventPayload: UserTelemetryEvent = {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    eventType,
    userId: 'user-001',
    terpiezId,
    timestamp: new Date().toISOString(),
    metadata: metadata as UserTelemetryEvent['metadata'],
  };

  try {
    // Attempting Go Service API call, fallback silently to telemetry log
    await fetch('http://localhost:8080/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
  } catch {
    // Client-side fallback logging for offline / dev demo mode
    console.log('[Telemetry Service]', eventPayload);
  }
};
