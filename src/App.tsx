import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_TERPIEZ } from './data/mockTerpiez';
import { Terpiez, TerpiezType } from './types/terpiez';
import { generateForYouFeed, sendTelemetryEvent, calculateDistanceMeters } from './services/discoveryEngine';
import { getH3IndexFromLatLng, getSurroundingH3Cells } from './services/h3SpatialEngine';
import { WeatherCondition, WEATHER_CONFIGS } from './services/weatherEngine';
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
import { ThreeDMonsterViewer } from './components/3d/ThreeDMonsterViewer';
import { ThreeDMapView } from './components/3d/ThreeDMapView';
import { UgcBuilderModal } from './components/ugc/UgcBuilderModal';

import confetti from 'canvas-confetti';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';

import {
  Compass,
  MapPin,
  Flame,
  Layers,
  Activity,
  Sparkles,
  Trophy,
  Gamepad2,
  Navigation,
  Shuffle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Hexagon,
  CloudRain,
  Box,
  PlusCircle,
  Users,
  Play,
  Pause,
  Database,
} from 'lucide-react';
import './styles/global.css';
import './App.css';

// Custom Leaflet Markers
const playerMarkerIcon = new L.DivIcon({
  className: 'player-marker-pin',
  html: `<div style="
    background: #6366f1;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  ">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const ghostPlayerMarkerIcon = new L.DivIcon({
  className: 'ghost-player-marker',
  html: `<div style="
    background: #a855f7;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  ">👾</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const terpiezMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const beaconMarkerIcon = new L.DivIcon({
  className: 'beacon-marker',
  html: `<div style="
    background: #ec4899;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  ">📡</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Helper component to auto-pan map when player moves
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
};

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [activeNav, setActiveNav] = useState('discovery');
  const [discoverySubTab, setDiscoverySubTab] = useState('for_you');
  const [mapMode, setMapMode] = useState<'2d_leaflet' | '3d_threejs'>('2d_leaflet');
  const [terpiezList, setTerpiezList] = useState<Terpiez[]>(INITIAL_TERPIEZ);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TerpiezType | 'All'>('All');
  const [selectedTerpiezModal, setSelectedTerpiezModal] = useState<Terpiez | null>(null);

  // Dynamic Player GPS Coordinates State (McKeldin Fountain baseline)
  const [userLat, setUserLat] = useState(38.9860);
  const [userLng, setUserLng] = useState(-76.9420);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('');

  // Auto-Walk Patrol State (自动漫游巡航)
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Weather & Time Engine State
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>('Sunny');

  // UGC Builder Modal State
  const [isUgcModalOpen, setIsUgcModalOpen] = useState(false);

  // Calculate H3 Hex Index string for current player position
  const playerH3Index = useMemo(() => {
    return getH3IndexFromLatLng(userLat, userLng, 9);
  }, [userLat, userLng]);

  // Calculate surrounding H3 cells for spatial grid overlay
  const surroundingH3Cells = useMemo(() => {
    return getSurroundingH3Cells(userLat, userLng, 2, 9);
  }, [userLat, userLng]);

  // Simulated Real-Time Online Ghost Players on adjacent H3 cells
  const ghostPlayers = useMemo(() => {
    return surroundingH3Cells.slice(1, 4).map((cell, idx) => ({
      id: `ghost-${idx}`,
      name: `Player_${['Alex', 'Maya', 'RiotDev'][idx]}`,
      lat: cell.centerLat,
      lng: cell.centerLng,
      h3Index: cell.h3Index,
    }));
  }, [surroundingH3Cells]);

  // Movement step size (~25-30 meters per step)
  const STEP_LAT = 0.0003;
  const STEP_LNG = 0.0004;

  // Move player helper
  const movePlayer = useCallback((direction: 'N' | 'S' | 'E' | 'W') => {
    setUserLat((prevLat) => {
      let nextLat = prevLat;
      if (direction === 'N') nextLat += STEP_LAT;
      if (direction === 'S') nextLat -= STEP_LAT;
      return parseFloat(nextLat.toFixed(5));
    });

    setUserLng((prevLng) => {
      let nextLng = prevLng;
      if (direction === 'E') nextLng += STEP_LNG;
      if (direction === 'W') nextLng -= STEP_LNG;
      return parseFloat(nextLng.toFixed(5));
    });
  }, []);

  // Auto-Walk Patrol Loop (自动巡航移动)
  useEffect(() => {
    if (!isAutoWalking || activeNav !== 'nearby_map') return;

    const directions: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'N', 'E', 'S', 'W', 'S', 'W'];
    let stepIdx = 0;

    const timer = setInterval(() => {
      movePlayer(directions[stepIdx % directions.length]);
      stepIdx++;
    }, 1200);

    return () => clearInterval(timer);
  }, [isAutoWalking, activeNav, movePlayer]);

  // Keyboard Movement Listener (WASD / Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeNav !== 'nearby_map') return;

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        movePlayer('N');
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        movePlayer('S');
      } else if (key === 'a' || key === 'arrowleft') {
        e.preventDefault();
        movePlayer('W');
      } else if (key === 'd' || key === 'arrowright') {
        e.preventDefault();
        movePlayer('E');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNav, movePlayer]);

  // Gamepad API Polling (Xbox / PlayStation controller support)
  useEffect(() => {
    let animId: number;

    const handleGamepadConnected = (e: GamepadEvent) => {
      setGamepadConnected(true);
      setGamepadName(e.gamepad.id);
      addToast({
        type: 'success',
        title: '🎮 Controller Connected!',
        message: `Connected: ${e.gamepad.id}. Use Left Joystick / D-Pad to move player.`,
      });
    };

    const handleGamepadDisconnected = () => {
      setGamepadConnected(false);
      setGamepadName('');
      addToast({
        type: 'info',
        title: 'Controller Disconnected',
        message: 'Switched back to WASD Keyboard controls.',
      });
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    let lastMoveTime = 0;
    const pollGamepad = (time: number) => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp && activeNav === 'nearby_map') {
        if (!gamepadConnected) {
          setGamepadConnected(true);
          setGamepadName(gp.id);
        }

        if (time - lastMoveTime > 200) {
          const axisX = gp.axes[0] || 0;
          const axisY = gp.axes[1] || 0;
          const dpadUp = gp.buttons[12]?.pressed;
          const dpadDown = gp.buttons[13]?.pressed;
          const dpadLeft = gp.buttons[14]?.pressed;
          const dpadRight = gp.buttons[15]?.pressed;

          if (axisY < -0.4 || dpadUp) {
            movePlayer('N');
            lastMoveTime = time;
          } else if (axisY > 0.4 || dpadDown) {
            movePlayer('S');
            lastMoveTime = time;
          } else if (axisX < -0.4 || dpadLeft) {
            movePlayer('W');
            lastMoveTime = time;
          } else if (axisX > 0.4 || dpadRight) {
            movePlayer('E');
            lastMoveTime = time;
          }
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      cancelAnimationFrame(animId);
    };
  }, [activeNav, gamepadConnected, movePlayer, addToast]);

  // Handle Weather Change
  const handleWeatherChange = (weather: WeatherCondition) => {
    setCurrentWeather(weather);
    const config = WEATHER_CONFIGS[weather];
    addToast({
      type: 'info',
      title: `${config.iconEmoji} Weather Changed: ${weather}`,
      message: config.description,
    });
  };

  // Toggle Auto Walk
  const handleToggleAutoWalk = () => {
    setIsAutoWalking((prev) => {
      const nextState = !prev;
      addToast({
        type: 'info',
        title: nextState ? '🤖 Auto-Patrol Walking Active' : '⏸️ Auto-Patrol Paused',
        message: nextState ? 'Player is exploring surrounding Uber H3 cells automatically.' : 'Switched back to manual movement.',
      });
      return nextState;
    });
  };

  // Scatter Spawns tightly around player location function
  const handleScatterSpawns = () => {
    setTerpiezList((prev) =>
      prev.map((t) => {
        // Tight offset within ~100m capture radius around current user position
        const latOffset = (Math.random() - 0.5) * 0.0016;
        const lngOffset = (Math.random() - 0.5) * 0.0022;
        return {
          ...t,
          isCaptured: false,
          location: {
            latitude: parseFloat((userLat + latOffset).toFixed(5)),
            longitude: parseFloat((userLng + lngOffset).toFixed(5)),
            placeName: `${t.name} (Nearby Wild Spawn)`,
          },
        };
      })
    );

    addToast({
      type: 'info',
      title: '✨ 20 Wild Terpiez Spawned Nearby!',
      message: 'Multiple wild Terpiez have appeared in immediate capture range around your player position!',
    });
  };

  // Handle UGC Custom Terpiez Beacon Deployment
  const handleDeployUgcBeacon = (newTerpiez: Terpiez) => {
    setTerpiezList((prev) => [newTerpiez, ...prev]);
    addToast({
      type: 'success',
      title: '📡 UGC Spatial Beacon Deployed!',
      message: `Placed '${newTerpiez.name}' at Hex Cell ${playerH3Index.slice(0, 8)}...`,
    });
  };

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
  }, [terpiezList, capturedTypeCounts, userLat, userLng]);

  const nearbyFeedItems = useMemo(() => {
    return terpiezList.map((t) => ({
      terpiez: t,
      distanceMeters: calculateDistanceMeters(userLat, userLng, t.location.latitude, t.location.longitude),
    })).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [terpiezList, userLat, userLng]);

  const trendingFeedItems = useMemo(() => {
    return [...terpiezList].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
  }, [terpiezList]);

  // Check if any uncaught Terpiez is within 80 meters
  const inRangeTerpiez = useMemo(() => {
    return nearbyFeedItems.find((item) => !item.terpiez.isCaptured && item.distanceMeters <= 80);
  }, [nearbyFeedItems]);

  // Capture Handler with confetti & telemetry event
  const handleCapture = (terpiez: Terpiez) => {
    setTerpiezList((prev) =>
      prev.map((t) => (t.id === terpiez.id ? { ...t, isCaptured: true, capturedAt: new Date().toISOString() } : t))
    );

    confetti({
      particleCount: 120,
      spread: 80,
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
            <span className="logo-tag">Uber H3 Spatial & 3D WebGL AR Engine</span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="header-nav">
          <Tabs
            tabs={[
              { id: 'discovery', label: 'Discovery Feed', icon: <Compass size={16} /> },
              { id: 'nearby_map', label: 'Spatial H3 & 3D Map', icon: <MapPin size={16} /> },
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
        {/* 1. DISCOVERY FEEDS TAB */}
        {activeNav === 'discovery' && (
          <div className="discovery-section">
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

            {discoverySubTab === 'for_you' && (
              <div className="feed-container">
                {forYouFeedItems.length > 0 && (
                  <div className="hero-feed-wrapper animate-fade-in">
                    <DiscoveryCard
                      item={forYouFeedItems[0]}
                      onSelect={(item) => setSelectedTerpiezModal(item.terpiez)}
                      onCapture={(item) => handleCapture(item.terpiez)}
                    />
                  </div>
                )}

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

        {/* 2. SPATIAL H3 & 3D MAP VIEW */}
        {activeNav === 'nearby_map' && (
          <div className="map-view-container glass-panel">
            <div className="map-header">
              <div className="map-title-box">
                <h2><MapPin color="var(--accent-cyan)" /> Uber H3 Spatial & 3D Map Engine</h2>
                <p>Coordinates: Lat {userLat.toFixed(4)}, Lng {userLng.toFixed(4)} | Use WASD / Gamepad / Auto-Walk Patrol!</p>
              </div>

              <div className="map-controls-toolbar">
                {/* Auto-Walk Patrol Button */}
                <button
                  className={`autowalk-btn ${isAutoWalking ? 'active' : ''}`}
                  onClick={handleToggleAutoWalk}
                >
                  {isAutoWalking ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isAutoWalking ? '⏸️ Pause Auto-Patrol' : '▶️ Auto-Walk / Patrol'}</span>
                </button>

                {/* Weather Bar Controls */}
                <div className="weather-control-bar">
                  <CloudRain size={16} color="#38bdf8" />
                  {(['Sunny', 'Rainy', 'Night', 'Thunderstorm'] as WeatherCondition[]).map((w) => (
                    <button
                      key={w}
                      className={`weather-btn ${currentWeather === w ? 'active' : ''}`}
                      onClick={() => handleWeatherChange(w)}
                    >
                      {WEATHER_CONFIGS[w].iconEmoji} {w}
                    </button>
                  ))}
                </div>

                {/* H3 Cell Badge */}
                <div className="h3-status-badge">
                  <Hexagon size={16} />
                  <span>H3 Res 9 Cell: {playerH3Index}</span>
                </div>

                {/* Gamepad Status Badge */}
                <div className={`gamepad-status-badge ${gamepadConnected ? 'connected' : ''}`}>
                  <Gamepad2 size={16} />
                  <span>{gamepadConnected ? `Connected: ${gamepadName.slice(0, 18)}...` : '⌨️ WASD Controls'}</span>
                </div>

                {/* 2D / 3D Mode Toggle Switch */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMapMode((m) => (m === '2d_leaflet' ? '3d_threejs' : '2d_leaflet'))}
                >
                  <Box size={14} /> {mapMode === '2d_leaflet' ? 'Switch to 3D WebGL Mode' : 'Switch to 2D Leaflet Mode'}
                </Button>

                {/* UGC Beacon Creator Button */}
                <Button variant="primary" size="sm" onClick={() => setIsUgcModalOpen(true)}>
                  <PlusCircle size={14} /> 🛠️ UGC Beacon Creator
                </Button>

                <Button variant="secondary" size="sm" onClick={handleScatterSpawns}>
                  <Shuffle size={14} /> Scatter Spawns
                </Button>
              </div>
            </div>

            {/* 3D MAP VIEW */}
            {mapMode === '3d_threejs' ? (
              <ThreeDMapView
                playerLat={userLat}
                playerLng={userLng}
                terpiezList={terpiezList}
                onSelectTerpiez={(t) => setSelectedTerpiezModal(t)}
              />
            ) : (
              /* 2D LEAFLET H3 GRID MAP VIEW */
              <div className="leaflet-wrapper">
                {/* H3 Spatial Grid Inspector Floating Panel Overlay */}
                <div className="h3-inspector-panel">
                  <div className="h3-panel-header">
                    <Hexagon size={18} /> Uber H3 Spatial Grid Inspector
                  </div>
                  <div className="h3-panel-body">
                    <p>Current H3 Cell: <span className="h3-panel-cell-id">{playerH3Index}</span></p>
                    <p>Grid Resolution: <strong>9 (~100m hex)</strong></p>
                    <p>Active K-Ring Neighbors: <strong>{surroundingH3Cells.length} Hex Cells</strong></p>
                    <p style={{ marginTop: '4px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={12} /> Embedded State (Zero Redis Lock)
                    </p>
                  </div>
                </div>

                {inRangeTerpiez && (
                  <div className="map-proximity-alert animate-glow">
                    <Zap size={18} />
                    <span>Wild #{inRangeTerpiez.terpiez.speciesNumber} {inRangeTerpiez.terpiez.name} is in Capture Range! ({Math.round(inRangeTerpiez.distanceMeters)}m away)</span>
                    <Button variant="primary" size="sm" onClick={() => handleCapture(inRangeTerpiez.terpiez)}>
                      Capture Now
                    </Button>
                  </div>
                )}

                <MapContainer
                  center={[userLat, userLng]}
                  zoom={15}
                  scrollWheelZoom={true}
                  style={{ height: '580px', width: '100%', borderRadius: 'var(--radius-xl)' }}
                >
                  <RecenterMap center={[userLat, userLng]} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Uber H3 Hexagonal Grid Polygons */}
                  {surroundingH3Cells.map((cell) => {
                    const isPlayerCell = cell.h3Index === playerH3Index;
                    return (
                      <Polygon
                        key={cell.h3Index}
                        positions={cell.boundaryCoords}
                        pathOptions={{
                          color: isPlayerCell ? '#a855f7' : '#6366f1',
                          weight: isPlayerCell ? 3 : 1.5,
                          fillColor: isPlayerCell ? '#a855f7' : '#6366f1',
                          fillOpacity: isPlayerCell ? 0.25 : 0.08,
                          dashArray: isPlayerCell ? undefined : '5, 5',
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>⬡ Uber H3 Grid Cell</strong>
                            <p>Index: {cell.h3Index}</p>
                            <p>Resolution: {cell.resolution} (~100m grid)</p>
                          </div>
                        </Popup>
                      </Polygon>
                    );
                  })}

                  {/* Player Location Marker */}
                  <Marker position={[userLat, userLng]} icon={playerMarkerIcon}>
                    <Popup>
                      <div className="map-popup">
                        <strong>📍 Player Position</strong>
                        <p>Lat: {userLat.toFixed(4)}, Lng: {userLng.toFixed(4)}</p>
                        <p>H3 Cell: {playerH3Index}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Simulated Online Ghost Players */}
                  {ghostPlayers.map((ghost) => (
                    <Marker key={ghost.id} position={[ghost.lat, ghost.lng]} icon={ghostPlayerMarkerIcon}>
                      <Popup>
                        <div className="map-popup">
                          <strong><Users size={14} /> Active Player: {ghost.name}</strong>
                          <p>Location: Hex Cell {ghost.h3Index.slice(0, 8)}...</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Terpiez Spawn Pins & Beacons */}
                  {terpiezList.map((t) => {
                    const distMeters = calculateDistanceMeters(userLat, userLng, t.location.latitude, t.location.longitude);
                    const inRange = distMeters <= 80;
                    const isUgcBeacon = t.id.startsWith('ugc-');

                    return (
                      <Marker
                        key={t.id}
                        position={[t.location.latitude, t.location.longitude]}
                        icon={isUgcBeacon ? beaconMarkerIcon : terpiezMarkerIcon}
                      >
                        <Popup>
                          <div className="map-popup">
                            <strong>#{t.speciesNumber} {t.name}</strong> ({t.rarity})
                            <p>{t.location.placeName}</p>
                            <p style={{ fontSize: '11px', color: '#64748b' }}>Distance: {Math.round(distMeters)}m away</p>
                            <Button
                              variant={inRange ? 'primary' : 'secondary'}
                              size="sm"
                              disabled={t.isCaptured}
                              onClick={() => handleCapture(t)}
                            >
                              {t.isCaptured ? 'Captured' : inRange ? '⚡ Capture (In Range!)' : 'Move Closer to Catch'}
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                {/* On-Screen D-Pad Overlay */}
                <div className="map-dpad-overlay">
                  <button className="dpad-btn" title="Move North (W)" onClick={() => movePlayer('N')}>
                    <ChevronUp size={20} />
                  </button>
                  <div className="dpad-row">
                    <button className="dpad-btn" title="Move West (A)" onClick={() => movePlayer('W')}>
                      <ChevronLeft size={20} />
                    </button>
                    <div className="dpad-btn" style={{ background: 'transparent', border: 'none', cursor: 'default' }}>
                      <Navigation size={18} color="var(--primary-500)" />
                    </div>
                    <button className="dpad-btn" title="Move East (D)" onClick={() => movePlayer('E')}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <button className="dpad-btn" title="Move South (S)" onClick={() => movePlayer('S')}>
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            )}
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
                <FilterChip label="Dark" selected={selectedType === 'Dark'} onToggle={() => setSelectedType('Dark')} />
                <FilterChip label="Cyber" selected={selectedType === 'Cyber'} onToggle={() => setSelectedType('Cyber')} />
                <FilterChip label="Dragon" selected={selectedType === 'Dragon'} onToggle={() => setSelectedType('Dragon')} />
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

        {/* 4. DESIGN SYSTEM TAB */}
        {activeNav === 'design_system' && <DesignSystemPage />}

        {/* 5. GO TELEMETRY DASHBOARD TAB */}
        {activeNav === 'performance' && <PerformanceDashboard />}
      </main>

      {/* Terpiez Detail Modal with 3D Hologram Viewer */}
      <Modal
        isOpen={!!selectedTerpiezModal}
        onClose={() => setSelectedTerpiezModal(null)}
        title={selectedTerpiezModal ? `#${selectedTerpiezModal.speciesNumber} ${selectedTerpiezModal.name}` : ''}
      >
        {selectedTerpiezModal && (
          <div className="modal-detail-content">
            <div className="detail-hero">
              {/* Three.js WebGL Hologram 3D Viewer */}
              <ThreeDMonsterViewer terpiez={selectedTerpiezModal} height={260} />
              <div>
                <span className="rarity-tag">{selectedTerpiezModal.rarity} {selectedTerpiezModal.type} Terpiez</span>
                <p>{selectedTerpiezModal.description}</p>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                  Location: {selectedTerpiezModal.location.placeName}
                </p>
                <p style={{ fontSize: '12px', color: '#a855f7' }}>
                  H3 Hex Index: {getH3IndexFromLatLng(selectedTerpiezModal.location.latitude, selectedTerpiezModal.location.longitude, 9)}
                </p>
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

      {/* UGC Custom Terpiez & Beacon Modal */}
      <UgcBuilderModal
        isOpen={isUgcModalOpen}
        onClose={() => setIsUgcModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        h3Index={playerH3Index}
        onDeployBeacon={handleDeployUgcBeacon}
      />
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
