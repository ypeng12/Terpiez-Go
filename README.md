---
title: Terpiez Go - Twitch & Roblox Discovery Engine
emoji: 🎮
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
short_description: Terpiez-Go Roblox & Twitch Discovery Engine Web App
---

# 🎮 Terpiez-Go 2.0: Uber H3 Spatial Grid & 3D WebGL AR Discovery Engine

Welcome to **Terpiez-Go 2.0**, a state-of-the-art Location-Based Services (LBS) Augmented Reality & Recommendation Engine application inspired by *Niantic (Pokémon GO)*, *Roblox design aesthetics*, and *Twitch discovery feeds*. 

Rebuilt from the ground up using **React 18, Vite, TypeScript, Three.js, Uber H3 Spatial Indexing, and Go**, Terpiez-Go 2.0 seamlessly combines spatial computing, real-world real-time weather modifiers, 3D WebGL rendering, and multi-controller input into a unified high-performance web platform.

---

## 🚀 Key Systems & Architectural Breakthroughs

### 1. ⬡ Uber H3 Hexagonal Spatial Indexing Grid (Niantic Architecture)
- **$O(1)$ Spatial Lookup**: Integrated Uber's official `h3-js` library at **Resolution 9 (~100m hex cells)** to map player GPS coordinates and monster spawns to hexagonal grid cells.
- **K-Ring Neighbor Disks**: Calculates surrounding 7-cell hexagonal clusters in real time for ultra-fast spatial proximity detection.
- **Interactive Spatial Inspector**: Features a real-time overlay panel (`Uber H3 Spatial Grid Inspector`) displaying current H3 Cell IDs (e.g. `892a1008007ffff`), cell resolution, and centroid coordinates.

### 2. 🧊 Three.js WebGL 3D Engine & Hologram Inspector
- **2D / 3D Perspective Map View (`ThreeDMapView`)**: Toggle between 2D Leaflet map view and interactive Three.js 3D WebGL perspective terrain with a glowing 3D player beacon, hex-style ground grid, and floating 3D low-poly creatures.
- **360° Holographic Monster Viewer (`ThreeDMonsterViewer`)**: Interactive modal rendering low-poly 3D geometries with metallic/wireframe materials, rotating holographic pedestal rings, point light illuminations, and floating particle FX (particle systems).

### 3. 🕹️ Gamepad API, WASD Controls & Auto-Walk Patrol
- **Multi-Controller Input**: Native support for **WASD / Arrow Keys** and **HTML5 Gamepad API** (Xbox / PlayStation left joysticks and D-Pad controls).
- **Auto-Walk / Patrol Engine**: Automated AI patrol mode that walks the player avatar along campus paths and H3 grid cells for hands-free monster discovery.
- **Proximity Alerts**: Triggers real-time alerts and confetti when entering within 80 meters of wild Terpiez.

### 4. 🌧️ Dynamic Weather & Time Spawn Modifiers
- **Real-World Environment Modifiers**: Integrated weather engine supporting `Sunny ☀️`, `Rainy 🌧️`, `Night 🌙`, and `Thunderstorm ⚡` conditions.
- **Stat & Encounter Boosts**: Rainy/Stormy weather boosts Water, Electric, Dark, and Cyber Terpiez encounter rates and combat stats up to **+300%**.

### 5. 👾 Real-Time Multiplayer Presence & UGC Beacon Creator
- **Online Ghost Avatars**: Displays active online player avatars (`Player_Alex`, `Player_Maya`) moving across adjacent H3 grid cells.
- **UGC Terpiez & Beacon Builder**: Allows players to design custom Terpiez species (name, type, rarity, stats, emoji) and deploy spatial **Beacon Signals** to attract wild spawns.

### 6. ⚡ Roblox UI Design System & Twitch Recommendation Engine
- **Design Tokens**: Custom CSS variable system featuring HSL dark themes, glassmorphism (`backdrop-filter`), micro-animations, and rarity color gradients.
- **Multi-Feed Recommendation**: Algorithmic scoring for `For You`, `Nearby`, and `Trending` discovery feeds based on user preferences, spatial distance, and rarity.
- **Go Telemetry Server**: High-throughput Go telemetry pipeline (`server/main.go`) logging telemetry events with real-time p50/p95/p99 latency tracking.
- **Zero Redis Lock**: Built-in local fallback ensuring 100% uptime with zero database login blocks.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, TypeScript 5 |
| **Spatial Indexing** | Uber `h3-js` (Resolution 9 Hexagonal Grid) |
| **3D & Graphics** | Three.js (WebGL Renderer, Lighting, Particle Systems, Geometries) |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap |
| **UI & Styling** | Vanilla CSS Design System (Tokens, HSL Dark Mode, Glassmorphism), Lucide React |
| **Input Engine** | HTML5 Gamepad API (Xbox Controller), Keyboard Event Listeners |
| **Backend & Telemetry** | Go 1.22 REST Server, Vitest Test Suite, Docker + Nginx |

---

## ⚙️ Project Setup & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Go**: v1.20+ (optional, for backend telemetry server)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Production Build & Type Checking
```bash
npm run build
```

### 4. Run Vitest Unit Tests
```bash
npx vitest run
```

### 5. Run Go Telemetry Server (Optional)
```bash
go run server/main.go
```

---

## 📜 Credits & License

- **Terpiez Original Concept & Art**: Created by Noah McMullen and UMD CMSC team.
- **Terpiez-Go 2.0 Engine & Spatial Architecture**: Engineered with React, Vite, Three.js, Uber H3, and Go.
