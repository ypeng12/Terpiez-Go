package scoring

import (
	"fmt"
	"math"
)

// TerpiezItem represents a species entity in the Go discovery service
type TerpiezItem struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Rarity        string  `json:"rarity"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Popularity    int     `json:"popularity"`
	SpawnTimestamp int64  `json:"spawnTimestamp"`
}

// UserProfile represents the user preference vector
type UserProfile struct {
	CapturedTypes map[string]int `json:"capturedTypes"`
	UserLat       float64        `json:"userLat"`
	UserLng       float64        `json:"userLng"`
}

// DiscoveryScore holds computed ranking breakdown
type DiscoveryScore struct {
	TotalScore       float64 `json:"totalScore"`
	PreferenceScore  float64 `json:"preferenceScore"` // 30%
	DistanceScore    float64 `json:"distanceScore"`   // 25%
	RarityScore      float64 `json:"rarityScore"`     // 20%
	FreshnessScore   float64 `json:"freshnessScore"`  // 15%
	PopularityScore  float64 `json:"popularityScore"` // 10%
	Reason           string  `json:"reason"`
	DistanceMeters   float64 `json:"distanceMeters"`
}

// CalculateDistance computes Haversine distance in meters
func CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth radius in meters
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

// ComputeDiscoveryScore runs Twitch Discovery ranking formula
func ComputeDiscoveryScore(item TerpiezItem, user UserProfile, nowUnix int64) DiscoveryScore {
	// 1. Preference Score (30%)
	prefCount := user.CapturedTypes[item.Type]
	prefScore := math.Min(1.0, float64(prefCount)/5.0)

	// 2. Distance Score (25%) - decays with distance
	distMeters := CalculateDistance(user.UserLat, user.UserLng, item.Latitude, item.Longitude)
	distScore := math.Max(0.0, 1.0-(distMeters/2000.0)) // Max 2km

	// 3. Rarity Score (20%)
	rarityMap := map[string]float64{
		"Common":    0.3,
		"Rare":      0.5,
		"Epic":      0.75,
		"Legendary": 0.95,
		"Mythic":    1.0,
	}
	rarityScore := rarityMap[item.Rarity]
	if rarityScore == 0 {
		rarityScore = 0.3
	}

	// 4. Freshness Score (15%) - recent spawns rank higher
	ageSeconds := float64(nowUnix - item.SpawnTimestamp)
	freshnessScore := math.Max(0.0, 1.0-(ageSeconds/3600.0))

	// 5. Popularity Score (10%)
	popScore := math.Min(1.0, float64(item.Popularity)/100.0)

	// Final Weighted Sum
	total := (0.30 * prefScore) +
		(0.25 * distScore) +
		(0.20 * rarityScore) +
		(0.15 * freshnessScore) +
		(0.10 * popScore)

	// Rationale string generation
	var reason string
	if prefCount > 0 {
		reason = fmt.Sprintf("Recommended because you captured %d %s Terpiez", prefCount, item.Type)
	} else if distMeters < 500 {
		reason = fmt.Sprintf("Nearby discovery: Only %.0f meters away", distMeters)
	} else if rarityScore >= 0.9 {
		reason = fmt.Sprintf("Rare spawn event: High rarity %s Terpiez spotted!", item.Rarity)
	} else {
		reason = fmt.Sprintf("Trending in your area with %d active engagements", item.Popularity)
	}

	return DiscoveryScore{
		TotalScore:      total,
		PreferenceScore:  prefScore,
		DistanceScore:    distScore,
		RarityScore:      rarityScore,
		FreshnessScore:   freshnessScore,
		PopularityScore:  popScore,
		Reason:           reason,
		DistanceMeters:   distMeters,
	}
}
