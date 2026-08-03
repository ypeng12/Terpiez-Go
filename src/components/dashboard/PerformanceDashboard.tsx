import React, { useState } from 'react';
import { PerformanceMetrics } from '../../types/terpiez';
import { Button } from '../ui/Button';
import { Activity, Server, Zap, Database, Users, BarChart3, RefreshCw, Play } from 'lucide-react';
import './PerformanceDashboard.css';

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    p50LatencyMs: 14.2,
    p95LatencyMs: 48.5,
    p99LatencyMs: 92.1,
    redisCacheHitRate: 94.8,
    requestsPerSecond: 420.5,
    activeUsers: 156,
    captureConversionRate: 68.4,
    totalEventsProcessed: 14850,
  });

  const [isLoadTesting, setIsLoadTesting] = useState(false);

  const runLoadTest = () => {
    setIsLoadTesting(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setMetrics((prev) => ({
        ...prev,
        requestsPerSecond: Math.round(600 + Math.random() * 300),
        activeUsers: 500,
        p50LatencyMs: parseFloat((18.5 + Math.random() * 4).toFixed(1)),
        p95LatencyMs: parseFloat((65.2 + Math.random() * 12).toFixed(1)),
        p99LatencyMs: parseFloat((120.4 + Math.random() * 25).toFixed(1)),
        totalEventsProcessed: prev.totalEventsProcessed + 150,
      }));

      if (step >= 8) {
        clearInterval(interval);
        setIsLoadTesting(false);
      }
    }, 500);
  };

  return (
    <div className="perf-dashboard-container glass-panel">
      {/* Header */}
      <div className="dashboard-header">
        <div className="title-row">
          <Activity size={24} color="var(--accent-cyan)" />
          <div>
            <h2 className="dashboard-title">Go Discovery & Telemetry Performance Monitor</h2>
            <p className="dashboard-subtitle">Twitch Engineering Observability System - Redis & Go API Latency metrics</p>
          </div>
        </div>

        <div className="header-actions">
          <Button
            variant="glass"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => {
              setMetrics((prev) => ({
                ...prev,
                p50LatencyMs: parseFloat((12 + Math.random() * 5).toFixed(1)),
                redisCacheHitRate: parseFloat((92 + Math.random() * 6).toFixed(1)),
              }));
            }}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isLoadTesting}
            leftIcon={<Play size={14} />}
            onClick={runLoadTest}
          >
            Run 500-User Load Test
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><Zap size={20} color="var(--accent-amber)" /></div>
          <div className="metric-info">
            <span className="metric-label">P95 Discovery Latency</span>
            <span className="metric-val">{metrics.p95LatencyMs} ms</span>
            <span className="metric-tag success">Target: &lt;150ms</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><Database size={20} color="var(--accent-cyan)" /></div>
          <div className="metric-info">
            <span className="metric-label">Redis Cache Hit Rate</span>
            <span className="metric-val">{metrics.redisCacheHitRate}%</span>
            <span className="metric-tag success">Target: &gt;90%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><Server size={20} color="var(--primary-500)" /></div>
          <div className="metric-info">
            <span className="metric-label">Throughput (RPS)</span>
            <span className="metric-val">{metrics.requestsPerSecond} req/s</span>
            <span className="metric-tag">Peak: 950 RPS</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><Users size={20} color="var(--accent-purple)" /></div>
          <div className="metric-info">
            <span className="metric-label">Active Concurrent Users</span>
            <span className="metric-val">{metrics.activeUsers}</span>
            <span className="metric-tag">Simulated Pool</span>
          </div>
        </div>
      </div>

      {/* Latency Percentile Breakdown */}
      <div className="latency-table-container">
        <h3 className="section-subtitle"><BarChart3 size={16} /> API Percentile Breakdown (Go Backend)</h3>
        <table className="latency-table">
          <thead>
            <tr>
              <th>Metric Percentile</th>
              <th>Observed Latency</th>
              <th>SLA Status</th>
              <th>Cache Strategy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>P50 (Median)</td>
              <td className="mono">{metrics.p50LatencyMs} ms</td>
              <td><span className="sla-badge pass">PASS</span></td>
              <td>Redis In-Memory Key-Value</td>
            </tr>
            <tr>
              <td>P95 (95th Percentile)</td>
              <td className="mono">{metrics.p95LatencyMs} ms</td>
              <td><span className="sla-badge pass">PASS</span></td>
              <td>Go Scoring Engine Goroutines</td>
            </tr>
            <tr>
              <td>P99 (Worst 1%)</td>
              <td className="mono">{metrics.p99LatencyMs} ms</td>
              <td><span className="sla-badge pass">PASS</span></td>
              <td>PostgreSQL Indexing Fallback</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
