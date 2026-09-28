import React from 'react';
import { PieChart } from 'lucide-react';

const PROTO_COLORS = {
  TCP: '#38bdf8',
  UDP: '#f59e0b',
  HTTP: '#10b981',
  HTTPS: '#a855f7',
  DNS: '#ec4899',
  ICMP: '#f43f5e',
  ARP: '#06b6d4',
};

export default function ProtocolChart({ protocolStats = [] }) {
  if (!protocolStats || protocolStats.length === 0) {
    return (
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
          <PieChart size={18} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Protocol Distribution</h3>
        </div>
        <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
          No packet data available yet. Start packet capture to see real-time protocol breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Protocol Breakdown</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          {protocolStats.reduce((acc, curr) => acc + curr.count, 0)} total analyzed
        </span>
      </div>

      {/* Distribution Multi-Segment Bar */}
      <div className="proto-distribution-bar">
        {protocolStats.map((item) => {
          const color = PROTO_COLORS[item.protocol] || '#6b7280';
          const pct = parseFloat(item.percentage) || 0;
          return (
            <div
              key={item.protocol}
              className="proto-bar-segment"
              style={{
                width: `${pct}%`,
                backgroundColor: color,
              }}
              title={`${item.protocol}: ${item.count} packets (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Protocol Legend & Details */}
      <div className="proto-legend">
        {protocolStats.map((item) => {
          const color = PROTO_COLORS[item.protocol] || '#6b7280';
          return (
            <div key={item.protocol} className="proto-legend-item">
              <span className="proto-legend-dot" style={{ backgroundColor: color }} />
              <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{item.protocol}</span>
              <span style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                {item.count} ({item.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
