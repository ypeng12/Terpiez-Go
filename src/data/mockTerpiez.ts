import { Terpiez } from '../types/terpiez';

// SVG generator helper for vibrant inline artwork
const generateTerpiezSvg = (_type: string, color1: string, color2: string, emoji: string) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="100" cy="100" r="85" fill="url(#bg)" filter="url(#glow)" />
    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-dasharray="10 5" />
    <text x="100" y="120" font-size="75" text-anchor="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const INITIAL_TERPIEZ: Terpiez[] = [
  {
    id: 'terpiez-01',
    name: 'HydroShell',
    speciesNumber: 1,
    type: 'Water',
    rarity: 'Common',
    description: 'A nimble aquatic shell Terpiez that loves sunny fountains at McKeldin Mall.',
    imageUrl: generateTerpiezSvg('Water', '#38bdf8', '#1e40af', '🐢'),
    attack: 48,
    defense: 65,
    speed: 52,
    hp: 70,
    location: { latitude: 38.9859, longitude: -76.9426, placeName: 'McKeldin Library Fountain' },
    isCaptured: true,
    capturedAt: '2026-08-01T14:20:00Z',
    spawnTimeRemaining: 1800,
  },
  {
    id: 'terpiez-02',
    name: 'Pyrophant',
    speciesNumber: 2,
    type: 'Fire',
    rarity: 'Rare',
    description: 'Emits gentle heat waves. Often found near computer labs generating high CPU compute.',
    imageUrl: generateTerpiezSvg('Fire', '#f97316', '#b91c1c', '🐘'),
    attack: 78,
    defense: 54,
    speed: 68,
    hp: 82,
    location: { latitude: 38.9892, longitude: -76.9367, placeName: 'Iribe Computer Science Center' },
    isCaptured: false,
    spawnTimeRemaining: 1200,
  },
  {
    id: 'terpiez-03',
    name: 'VoltFox',
    speciesNumber: 3,
    type: 'Electric',
    rarity: 'Epic',
    description: 'Crackles with static electricity. Speeds past tech hubs leaving blue sparks.',
    imageUrl: generateTerpiezSvg('Electric', '#eab308', '#ca8a04', '🦊'),
    attack: 88,
    defense: 45,
    speed: 110,
    hp: 75,
    location: { latitude: 38.9875, longitude: -76.9401, placeName: 'Stamp Student Union' },
    isCaptured: false,
    isFavorite: true,
    spawnTimeRemaining: 450,
  },
  {
    id: 'terpiez-04',
    name: 'FloraBear',
    speciesNumber: 4,
    type: 'Grass',
    rarity: 'Common',
    description: 'Covered in lush moss. Naps under shaded oak trees near the botanical gardens.',
    imageUrl: generateTerpiezSvg('Grass', '#22c55e', '#15803d', '🐻'),
    attack: 55,
    defense: 72,
    speed: 40,
    hp: 90,
    location: { latitude: 38.9835, longitude: -76.9442, placeName: 'UMD Arboretum' },
    isCaptured: true,
    capturedAt: '2026-07-28T09:15:00Z',
    spawnTimeRemaining: 3600,
  },
  {
    id: 'terpiez-05',
    name: 'CyberDrake',
    speciesNumber: 5,
    type: 'Cyber',
    rarity: 'Legendary',
    description: 'A mythical holographic cyber-dragon. Spawns during high network traffic bursts.',
    imageUrl: generateTerpiezSvg('Cyber', '#a855f7', '#6b21a8', '🐉'),
    attack: 115,
    defense: 92,
    speed: 98,
    hp: 110,
    location: { latitude: 38.9910, longitude: -76.9350, placeName: 'Xfinity Center Arena' },
    isCaptured: false,
    spawnTimeRemaining: 300,
  },
  {
    id: 'terpiez-06',
    name: 'ShadowOwl',
    speciesNumber: 6,
    type: 'Dark',
    rarity: 'Mythic',
    description: 'Only appears under moonlight. Possesses ancient wisdom and stealth capabilities.',
    imageUrl: generateTerpiezSvg('Dark', '#64748b', '#0f172a', '🦉'),
    attack: 125,
    defense: 88,
    speed: 120,
    hp: 105,
    location: { latitude: 38.9880, longitude: -76.9430, placeName: 'Hornbake Plaza' },
    isCaptured: false,
    spawnTimeRemaining: 150,
  },
  {
    id: 'terpiez-07',
    name: 'PsySpike',
    speciesNumber: 7,
    type: 'Psychic',
    rarity: 'Epic',
    description: 'Floats effortlessly while transmitting telepathic waves across the campus quad.',
    imageUrl: generateTerpiezSvg('Psychic', '#ec4899', '#be185d', '🔮'),
    attack: 95,
    defense: 60,
    speed: 85,
    hp: 80,
    location: { latitude: 38.9840, longitude: -76.9410, placeName: 'Tawes Fine Arts Plaza' },
    isCaptured: false,
    spawnTimeRemaining: 900,
  },
  {
    id: 'terpiez-08',
    name: 'AeroWhale',
    speciesNumber: 8,
    type: 'Water',
    rarity: 'Legendary',
    description: 'A colossal sky-swimmer that creates gentle mist clouds over the engineering bridge.',
    imageUrl: generateTerpiezSvg('Water', '#0ea5e9', '#0369a1', '🐋'),
    attack: 105,
    defense: 110,
    speed: 65,
    hp: 130,
    location: { latitude: 38.9898, longitude: -76.9385, placeName: 'GL Martin Hall Bridge' },
    isCaptured: false,
    spawnTimeRemaining: 600,
  }
];
