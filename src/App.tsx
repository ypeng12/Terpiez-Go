import React, { useState, useMemo } from 'react';
import { INITIAL_TERPIEZ } from './data/mockTerpiez';
import { Terpiez, TerpiezType } from './types/terpiez';
import { generateForYouFeed, sendTelemetryEvent, calculateDistanceMeters } from './services/discoveryEngine';
import { Button } from './components/ui/Button';
import { Tabs } from './components/ui/Tabs';
import { SearchBar } from './components/ui/SearchBar';
import { FilterChip } from './components/ui/FilterChip';
import { TerpiezCard } from './components/ui/TerpiezCard';
import { DiscoveryCard } from './components/ui/DiscoveryCard';
import { Modal } from './components/ui/Modal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { PerformanceDashboard } from './components/dashboard/PerformanceDashboard';
import confetti from 'canvas-confetti';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import {
  Compass,
  MapPin,
  Flame,
  Layers,
  Activity,
  Sparkles,
  Trophy,
} from 'lucide-react';
import './styles/global.css';
import './App.css';

// Fix Leaflet default marker icon bug in Webpack/Vite
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [activeNav, setActiveNav] = useState('discovery');
  const [discoverySubTab, setDiscoverySubTab] = useState('for_you');
  const [terpiezList, setTerpiezList] = useState<Terpiez[]>(INITIAL_TERPIEZ);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TerpiezType | 'All'>('All');
  const [selectedTerpiezModal, setSelectedTerpiezModal] = useState<Terpiez | null>(null);

  // User simulated state
  const userLat = 38.9860;
  const userLng = -76.9420;

  // Compute user captured type count map
  const capturedTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    terpiezList.forEach((t) => {
      if (t.isCaptured) {
        counts[t.type] = (counts[t.type] || 0) + 1;
      }
    });
    return counts;
  }, [terpiezList]);

  // Discovery Feeds Generation
  const forYouFeedItems = useMemo(() => {
    return generateForYouFeed(terpiezList, capturedTypeCounts, userLat, userLng);
  }, [terpiezList, capturedTypeCounts]);

  const nearbyFeedItems = useMemo(() => {
    return terpiezList.map((t) => ({
      terpiez: t,
      distanceMeters: calculateDistanceMeters(userLat, userLng, t.location.latitude, t.location.longitude),
    })).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [terpiezList]);

  const trendingFeedItems = useMemo(() => {
    return [...terpiezList].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
  }, [terpiezList]);

  // Capture Handler with confetti & telemetry event
  const handleCapture = (terpiez: Terpiez) => {
    setTerpiezList((prev) =>
      prev.map((t) => (t.id === terpiez.id ? { ...t, isCaptured: true, capturedAt: new Date().toISOString() } : t))
    );

    // Fire Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    addToast({
      type: 'success',
      title: `Captured ${terpiez.name}! 🎉`,
      message: `Added #${terpiez.speciesNumber} ${terpiez.name} (${terpiez.rarity}) to your collection.`,
    });

    sendTelemetryEvent('terpiez_captured', terpiez.id, { source: discoverySubTab });
  };

  // Toggle Favorite
  const handleToggleFavorite = (terpiez: Terpiez) => {
    setTerpiezList((prev) =>
      prev.map((t) => (t.id === terpiez.id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    const isFavNow = !terpiez.isFavorite;
    addToast({
      type: 'info',
      title: isFavNow ? 'Added to Favorites' : 'Removed from Favorites',
      message: terpiez.name,
    });
    sendTelemetryEvent('terpiez_favorited', terpiez.id);
  };

  // Filtered List
  const filteredTerpiez = useMemo(() => {
    return terpiezList.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.placeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || t.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [terpiezList, searchQuery, selectedType]);

  const capturedCount = terpiezList.filter((t) => t.isCaptured).length;

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="app-header glass-panel">
        <div className="header-brand">
          <div className="logo-icon animate-glow">
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="logo-title">Terpiez Go</h1>
            <span className="logo-tag">Roblox UI & Twitch Discovery Portfolio</span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="header-nav">
          <Tabs
            tabs={[
              { id: 'discovery', label: 'Discovery Feed', icon: <Compass size={16} /> },
              { id: 'nearby_map', label: 'Nearby Map', icon: <MapPin size={16} /> },
              { id: 'collection', label: 'Collection', icon: <Trophy size={16} />, badge: capturedCount },
              { id: 'design_system', label: 'Design System', icon: <Layers size={16} /> },
              { id: 'performance', label: 'Go Telemetry', icon: <Activity size={16} /> },
            ]}
            activeTabId={activeNav}
            onChange={setActiveNav}
            variant="pills"
          />
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="app-main-content">
        {/* 1. DISCOVERY FEEDS TAB (Twitch Discovery Focus) */}
        {activeNav === 'discovery' && (
          <div className="discovery-section">
            {/* Sub-tabs: For You, Nearby, Trending */}
            <div className="feed-subtabs-row">
              <Tabs
                tabs={[
                  { id: 'for_you', label: 'For You', icon: <Sparkles size={16} /> },
                  { id: 'nearby', label: 'Nearby', icon: <MapPin size={16} /> },
                  { id: 'trending', label: 'Trending', icon: <Flame size={16} /> },
                ]}
                activeTabId={discoverySubTab}
                onChange={setDiscoverySubTab}
                variant="segmented"
              />
            </div>

            {/* FOR YOU FEED */}
            {discoverySubTab === 'for_you' && (
              <div className="feed-container">
                {/* Hero Recommendation Item */}
                {forYouFeedItems.length > 0 && (
                  <div className="hero-feed-wrapper animate-fade-in">
                    <DiscoveryCard
                      item={forYouFeedItems[0]}
                      onSelect={(item) => setSelectedTerpiezModal(item.terpiez)}
                      onCapture={(item) => handleCapture(item.terpiez)}
                    />
                  </div>
                )}

                {/* Secondary Recommendations Grid */}
                <h2 className="feed-section-heading">More Recommended Species</h2>
                <div className="terpiez-cards-grid">
                  {forYouFeedItems.slice(1).map((item) => (
                    <TerpiezCard
                      key={item.terpiez.id}
                      terpiez={item.terpiez}
                      variant="discovery"
                      status={item.terpiez.isCaptured ? 'captured' : 'nearby'}
                      distanceMeters={item.distanceMeters}
                      score={item.scores.totalScore}
                      reason={item.scores.reason}
                      onSelect={(t) => setSelectedTerpiezModal(t)}
                      onCapture={(t) => handleCapture(t)}
                      onToggleFavorite={(t) => handleToggleFavorite(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NEARBY FEED */}
            {discoverySubTab === 'nearby' && (
              <div className="feed-container">
                <div className="terpiez-cards-grid">
                  {nearbyFeedItems.map((item) => (
                    <TerpiezCard
                      key={item.terpiez.id}
                      terpiez={item.terpiez}
                      variant="nearby"
                      distanceMeters={item.distanceMeters}
                      onSelect={(t) => setSelectedTerpiezModal(t)}
                      onCapture={(t) => handleCapture(t)}
                      onToggleFavorite={(t) => handleToggleFavorite(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TRENDING FEED */}
            {discoverySubTab === 'trending' && (
              <div className="feed-container">
                <div className="terpiez-cards-grid">
                  {trendingFeedItems.map((terpiez) => (
                    <TerpiezCard
                      key={terpiez.id}
                      terpiez={terpiez}
                      variant="trending"
                      onSelect={(t) => setSelectedTerpiezModal(t)}
                      onCapture={(t) => handleCapture(t)}
                      onToggleFavorite={(t) => handleToggleFavorite(t)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. NEARBY MAP VIEW */}
        {activeNav === 'nearby_map' && (
          <div className="map-view-container glass-panel">
            <div className="map-header">
              <h2><MapPin color="var(--accent-cyan)" /> Terpiez Spatial Map View</h2>
              <p>Real-time GPS coordinate mapping & campus spawn locations</p>
            </div>
            <div className="leaflet-wrapper">
              <MapContainer
                center={[userLat, userLng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '550px', width: '100%', borderRadius: 'var(--radius-xl)' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* User Pin */}
                <Marker position={[userLat, userLng]} icon={customMarkerIcon}>
                  <Popup>📍 You are here (College Park Campus)</Popup>
                </Marker>

                {/* Terpiez Spawn Pins */}
                {terpiezList.map((t) => (
                  <Marker
                    key={t.id}
                    position={[t.location.latitude, t.location.longitude]}
                    icon={customMarkerIcon}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>#{t.speciesNumber} {t.name}</strong> ({t.rarity})
                        <p>{t.location.placeName}</p>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={t.isCaptured}
                          onClick={() => handleCapture(t)}
                        >
                          {t.isCaptured ? 'Captured' : 'Capture'}
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* 3. COLLECTION TAB */}
        {activeNav === 'collection' && (
          <div className="collection-section">
            <div className="filter-controls-row">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <div className="type-chips-row">
                <FilterChip label="All Types" selected={selectedType === 'All'} onToggle={() => setSelectedType('All')} />
                <FilterChip label="Water" selected={selectedType === 'Water'} onToggle={() => setSelectedType('Water')} />
                <FilterChip label="Fire" selected={selectedType === 'Fire'} onToggle={() => setSelectedType('Fire')} />
                <FilterChip label="Electric" selected={selectedType === 'Electric'} onToggle={() => setSelectedType('Electric')} />
                <FilterChip label="Grass" selected={selectedType === 'Grass'} onToggle={() => setSelectedType('Grass')} />
              </div>
            </div>

            <div className="terpiez-cards-grid">
              {filteredTerpiez.map((t) => (
                <TerpiezCard
                  key={t.id}
                  terpiez={t}
                  variant="captured"
                  onSelect={(item) => setSelectedTerpiezModal(item)}
                  onCapture={(item) => handleCapture(item)}
                  onToggleFavorite={(item) => handleToggleFavorite(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. DESIGN SYSTEM TAB (Roblox Focus) */}
        {activeNav === 'design_system' && <DesignSystemPage />}

        {/* 5. GO TELEMETRY DASHBOARD TAB (Twitch Focus) */}
        {activeNav === 'performance' && <PerformanceDashboard />}
      </main>

      {/* Terpiez Detail Modal */}
      <Modal
        isOpen={!!selectedTerpiezModal}
        onClose={() => setSelectedTerpiezModal(null)}
        title={selectedTerpiezModal ? `#${selectedTerpiezModal.speciesNumber} ${selectedTerpiezModal.name}` : ''}
      >
        {selectedTerpiezModal && (
          <div className="modal-detail-content">
            <div className="detail-hero">
              <img src={selectedTerpiezModal.imageUrl} alt={selectedTerpiezModal.name} className="modal-avatar" />
              <div>
                <span className="rarity-tag">{selectedTerpiezModal.rarity} {selectedTerpiezModal.type} Terpiez</span>
                <p>{selectedTerpiezModal.description}</p>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="primary"
                fullWidth
                disabled={selectedTerpiezModal.isCaptured}
                onClick={() => {
                  handleCapture(selectedTerpiezModal);
                  setSelectedTerpiezModal(null);
                }}
              >
                {selectedTerpiezModal.isCaptured ? 'Already Captured' : 'Capture Terpiez'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
