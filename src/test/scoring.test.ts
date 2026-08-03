import { describe, test, expect } from 'vitest';
import { computeDiscoveryScore, calculateDistanceMeters } from '../services/discoveryEngine';
import { INITIAL_TERPIEZ } from '../data/mockTerpiez';

describe('Twitch Discovery Recommendation Engine', () => {
  test('calculateDistanceMeters computes accurate Haversine distance', () => {
    // McKeldin to Iribe Center distance
    const dist = calculateDistanceMeters(38.9859, -76.9426, 38.9892, -76.9367);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(700);
  });

  test('computeDiscoveryScore boosts preferred species type', () => {
    const terpiez = INITIAL_TERPIEZ[0]; // Water type
    const userCapturedTypes = { Water: 5 }; // High water preference

    const score = computeDiscoveryScore(terpiez, userCapturedTypes, 38.9859, -76.9426);
    expect(score.preferenceScore).toBe(1.0);
    expect(score.reason).toContain('Recommended because you captured 5 Water Terpiez');
  });

  test('computeDiscoveryScore generates rarity boost for Legendary Terpiez', () => {
    const legendaryTerpiez = INITIAL_TERPIEZ[4]; // CyberDrake
    const score = computeDiscoveryScore(legendaryTerpiez, {}, 38.9859, -76.9426);
    expect(score.rarityScore).toBeGreaterThanOrEqual(0.9);
  });
});
