import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { FilterChip } from '../components/ui/FilterChip';
import { Tabs } from '../components/ui/Tabs';
import { SearchBar } from '../components/ui/SearchBar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TerpiezCard } from '../components/ui/TerpiezCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { INITIAL_TERPIEZ } from '../data/mockTerpiez';
import { Sparkles, Heart, Search, Shield, Layers, Accessibility, Terminal } from 'lucide-react';
import './DesignSystemPage.css';

export const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [searchValue, setSearchValue] = useState('');
  const [selectedChip, setSelectedChip] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="ds-page-container">
      {/* Hero Header */}
      <div className="ds-hero glass-panel">
        <div className="ds-hero-content">
          <div className="ds-badge">
            <Layers size={16} /> Roblox UI Engineering & Component System
          </div>
          <h1 className="ds-title">Terpiez Foundation Design System</h1>
          <p className="ds-subtitle">
            A reusable, typed, accessible UI component library built with modern CSS Design Tokens, ARIA roles, Vitest component testing, and micro-interactions.
          </p>

          <div className="ds-metrics-row">
            <div className="ds-metric"><span className="val">13</span><span className="lbl">Core Components</span></div>
            <div className="ds-metric"><span className="val">42+</span><span className="lbl">Design Tokens</span></div>
            <div className="ds-metric"><span className="val">100%</span><span className="lbl">TypeScript Typed</span></div>
            <div className="ds-metric"><span className="val">WCAG AA</span><span className="lbl">Accessibility Status</span></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="ds-nav-row">
        <Tabs
          tabs={[
            { id: 'components', label: 'Component Gallery', icon: <Layers size={16} /> },
            { id: 'tokens', label: 'Design Tokens', icon: <Sparkles size={16} /> },
            { id: 'a11y', label: 'Accessibility & Keyboard Nav', icon: <Accessibility size={16} /> },
            { id: 'tests', label: 'Testing Suite', icon: <Terminal size={16} /> },
          ]}
          activeTabId={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
      </div>

      {activeTab === 'components' && (
        <div className="ds-section-grid">
          {/* Section 1: Buttons & IconButtons */}
          <div className="ds-card glass-panel">
            <h2 className="ds-section-title">Button System</h2>
            <p className="ds-section-desc">Supports primary, secondary, ghost, glass, danger variants, sizes, and loading states.</p>
            <div className="ds-demo-row">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="glass">Glassmorphism</Button>
              <Button variant="danger">Danger Action</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" isLoading>Loading State</Button>
            </div>
            <div className="ds-demo-row">
              <IconButton icon={<Heart size={18} />} aria-label="Favorite" variant="glass" />
              <IconButton icon={<Search size={18} />} aria-label="Search" variant="primary" />
              <IconButton icon={<Shield size={18} />} aria-label="Shield" variant="ghost" />
            </div>
          </div>

          {/* Section 2: Input Controls & Filter Chips */}
          <div className="ds-card glass-panel">
            <h2 className="ds-section-title">Filters & Search Controls</h2>
            <div className="ds-demo-col">
              <SearchBar value={searchValue} onChange={setSearchValue} placeholder="Interactive debounced search bar..." />
              <div className="ds-demo-row">
                <FilterChip label="All Terpiez" selected={selectedChip === 'all'} onToggle={() => setSelectedChip('all')} count={8} />
                <FilterChip label="Water" selected={selectedChip === 'Water'} onToggle={() => setSelectedChip('Water')} count={2} colorHex="#38bdf8" />
                <FilterChip label="Legendary" selected={selectedChip === 'Legendary'} onToggle={() => setSelectedChip('Legendary')} count={2} colorHex="#f59e0b" />
              </div>
            </div>
          </div>

          {/* Section 3: Progress & Meters */}
          <div className="ds-card glass-panel">
            <h2 className="ds-section-title">Progress & Stat Meters</h2>
            <div className="ds-demo-col">
              <ProgressBar label="Capture Progress" value={68} />
              <ProgressBar label="Legendary Spawn Meter" value={92} color="var(--grad-legendary)" />
              <ProgressBar label="Health Point (HP)" value={45} color="var(--accent-pink)" />
            </div>
          </div>

          {/* Section 4: TerpiezCard Variants */}
          <div className="ds-card glass-panel full-width">
            <h2 className="ds-section-title">TerpiezCard Variants & States</h2>
            <p className="ds-section-desc">Polymorphic card system supporting discovery, nearby, and captured states.</p>
            <div className="ds-cards-demo-grid">
              <TerpiezCard
                terpiez={INITIAL_TERPIEZ[0]}
                variant="discovery"
                status="captured"
                distanceMeters={120}
              />
              <TerpiezCard
                terpiez={INITIAL_TERPIEZ[2]}
                variant="nearby"
                status="nearby"
                distanceMeters={320}
                score={0.88}
                reason="Recommended: Water Type Match"
              />
              <TerpiezCard
                terpiez={INITIAL_TERPIEZ[4]}
                variant="trending"
                status="spawning"
                distanceMeters={850}
                score={0.96}
                reason="High-Demand Legendary Spawn"
              />
            </div>
          </div>

          {/* Section 5: Modal & Feedback Components */}
          <div className="ds-card glass-panel">
            <h2 className="ds-section-title">Modal & Feedback System</h2>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Accessible Modal
            </Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Accessible Dialog Window">
              <p>This modal implements focus trapping, ESC key listener, and ARIA attributes for full accessibility compliance.</p>
              <div style={{ marginTop: '1rem' }}>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
              </div>
            </Modal>
          </div>

          {/* Section 6: Skeletons & Empty States */}
          <div className="ds-card glass-panel">
            <h2 className="ds-section-title">Loading Skeletons & Empty States</h2>
            <div className="ds-demo-col">
              <Skeleton height={24} width="60%" />
              <Skeleton height={14} width="90%" />
              <EmptyState title="No Terpiez Captured" description="Explore the map or check the For You feed to start capturing!" actionLabel="Start Discovery" onAction={() => {}} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="ds-card glass-panel full-width">
          <h2 className="ds-section-title">Design Tokens Specification</h2>
          <div className="tokens-grid">
            <div className="token-box" style={{ background: 'var(--bg-dark-base)' }}>--bg-dark-base</div>
            <div className="token-box" style={{ background: 'var(--primary-500)' }}>--primary-500</div>
            <div className="token-box" style={{ background: 'var(--accent-cyan)' }}>--accent-cyan</div>
            <div className="token-box" style={{ background: 'var(--rarity-legendary)' }}>--rarity-legendary</div>
            <div className="token-box" style={{ background: 'var(--rarity-mythic)' }}>--rarity-mythic</div>
          </div>
        </div>
      )}

      {activeTab === 'a11y' && (
        <div className="ds-card glass-panel full-width">
          <h2 className="ds-section-title">Accessibility & Keyboard Standards</h2>
          <ul className="a11y-list">
            <li>✅ <strong>Focus Rings:</strong> Bright cyan 2px outline offset on <code>:focus-visible</code>.</li>
            <li>✅ <strong>Keyboard Navigation:</strong> Tabs support <code>ArrowLeft</code> / <code>ArrowRight</code> cycling.</li>
            <li>✅ <strong>ARIA Dialogs:</strong> Modals feature <code>role="dialog"</code> and <code>aria-modal="true"</code>.</li>
            <li>✅ <strong>Contrast Ratios:</strong> Text meets WCAG AA 4.5:1 minimum contrast.</li>
          </ul>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="ds-card glass-panel full-width">
          <h2 className="ds-section-title">Vitest & Component Test Suite</h2>
          <pre className="test-code">
{`import { render, screen } from '@testing-library/react';
import { TerpiezCard } from './TerpiezCard';

test('renders TerpiezCard with distance and rarity badge', () => {
  render(<TerpiezCard terpiez={mockTerpiez} distanceMeters={320} />);
  expect(screen.getByText(/HydroShell/i)).toBeInTheDocument();
  expect(screen.getByText(/320m away/i)).toBeInTheDocument();
});`}
          </pre>
        </div>
      )}
    </div>
  );
};
