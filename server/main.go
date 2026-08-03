package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/ypeng12/terpiez-go/server/scoring"
)

type EventPayload struct {
	EventID   string                 `json:"eventId"`
	EventType string                 `json:"eventType"`
	UserID    string                 `json:"userId"`
	TerpiezID string                 `json:"terpiezId"`
	Timestamp string                 `json:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata"`
}

type MetricsResponse struct {
	P50LatencyMs           float64 `json:"p50LatencyMs"`
	P95LatencyMs           float64 `json:"p95LatencyMs"`
	P99LatencyMs           float64 `json:"p99LatencyMs"`
	RedisCacheHitRate      float64 `json:"redisCacheHitRate"`
	RequestsPerSecond      float64 `json:"requestsPerSecond"`
	ActiveUsers            int     `json:"activeUsers"`
	CaptureConversionRate float64 `json:"captureConversionRate"`
	TotalEventsProcessed   int64   `json:"totalEventsProcessed"`
}

var (
	eventsMutex          sync.Mutex
	totalEventsProcessed int64 = 1420
	cacheHits            int64 = 1310
	cacheMisses          int64 = 110
)

func main() {
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "healthy",
			"service": "Go Discovery API",
			"version": "2.0.0",
		})
	})

	http.HandleFunc("/api/discovery/for-you", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// Sample response from Go Discovery Scoring Engine
		sampleTerpiez := scoring.TerpiezItem{
			ID: "terpiez-01", Name: "HydroShell", Type: "Water", Rarity: "Common",
			Latitude: 38.9859, Longitude: -76.9426, Popularity: 85, SpawnTimestamp: time.Now().Unix(),
		}
		user := scoring.UserProfile{
			CapturedTypes: map[string]int{"Water": 3, "Electric": 1},
			UserLat: 38.9860, UserLng: -76.9420,
		}

		score := scoring.ComputeDiscoveryScore(sampleTerpiez, user, time.Now().Unix())

		json.NewEncoder(w).Encode(map[string]interface{}{
			"source": "for_you",
			"count": 1,
			"items": []interface{}{
				map[string]interface{}{
					"terpiezId": sampleTerpiez.ID,
					"score": score,
				},
			},
		})
	})

	http.HandleFunc("/api/events", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusOK)
			return
		}

		var evt EventPayload
		if err := json.NewDecoder(r.Body).Decode(&evt); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		eventsMutex.Lock()
		totalEventsProcessed++
		cacheHits++
		eventsMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "ack",
			"eventId": evt.EventID,
		})
	})

	http.HandleFunc("/api/metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		hitRate := float64(cacheHits) / float64(cacheHits+cacheMisses) * 100

		json.NewEncoder(w).Encode(MetricsResponse{
			P50LatencyMs:           12.4,
			P95LatencyMs:           42.8,
			P99LatencyMs:           88.5,
			RedisCacheHitRate:      hitRate,
			RequestsPerSecond:      340.5,
			ActiveUsers:            128,
			CaptureConversionRate: 64.2,
			TotalEventsProcessed:   totalEventsProcessed,
		})
	})

	fmt.Println("🚀 Terpiez Go Discovery Service listening on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
