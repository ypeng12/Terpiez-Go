import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Terpiez, TerpiezType, TerpiezRarity } from '../../types/terpiez';

interface UgcBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number;
  userLng: number;
  h3Index: string;
  onDeployBeacon: (newTerpiez: Terpiez) => void;
}

export const UgcBuilderModal: React.FC<UgcBuilderModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  h3Index,
  onDeployBeacon,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TerpiezType>('Cyber');
  const [rarity, setRarity] = useState<TerpiezRarity>('Legendary');
  const [emoji, setEmoji] = useState('🤖');
  const [description, setDescription] = useState('');
  const [attack, setAttack] = useState(85);
  const [defense, setDefense] = useState(75);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // SVG generator helper
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="ugc_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill="url(#ugc_bg)" />
      <text x="100" y="120" font-size="75" text-anchor="middle">${emoji}</text>
    </svg>`;
    const imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    const newTerpiez: Terpiez = {
      id: `ugc-${Date.now()}`,
      name: name.trim(),
      speciesNumber: Math.floor(Math.random() * 800) + 100,
      type,
      rarity,
      description: description.trim() || `User-Generated Custom Terpiez deployed at Hex Cell ${h3Index}.`,
      imageUrl,
      attack: Number(attack),
      defense: Number(defense),
      speed: 90,
      hp: 100,
      location: {
        latitude: userLat,
        longitude: userLng,
        placeName: `UGC Beacon Target (H3: ${h3Index.slice(0, 8)}...)`,
      },
      isCaptured: false,
      spawnTimeRemaining: 3600,
    };

    onDeployBeacon(newTerpiez);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛠️ UGC Creator: Custom Terpiez & Beacon Deployer">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Species Name:
          </label>
          <input
            type="text"
            placeholder="e.g. CyberNeuron X"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-dark-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Element Type:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TerpiezType)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-dark-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Cyber">Cyber</option>
              <option value="Water">Water</option>
              <option value="Fire">Fire</option>
              <option value="Electric">Electric</option>
              <option value="Dark">Dark</option>
              <option value="Psychic">Psychic</option>
              <option value="Dragon">Dragon</option>
              <option value="Grass">Grass</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Rarity Tier:
            </label>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value as TerpiezRarity)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-dark-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Icon Emoji:
            </label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-dark-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Description:
          </label>
          <textarea
            placeholder="Describe your custom creature powers and lore..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-dark-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Base Attack: {attack}
            </label>
            <input
              type="range"
              min={30}
              max={150}
              value={attack}
              onChange={(e) => setAttack(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Base Defense: {defense}
            </label>
            <input
              type="range"
              min={30}
              max={150}
              value={defense}
              onChange={(e) => setDefense(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--border-glow)',
            fontSize: '12px',
            color: 'var(--primary-500)',
          }}
        >
          📡 Deploying this UGC Terpiez will place a Spatial Beacon at current <strong>H3 Cell: {h3Index}</strong>!
        </div>

        <Button variant="primary" type="submit" fullWidth>
          🚀 Deploy Custom Terpiez Beacon
        </Button>
      </form>
    </Modal>
  );
};
