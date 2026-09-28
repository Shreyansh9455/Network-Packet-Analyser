import React from 'react';
import ProtocolBadge from './ProtocolBadge';
import { Eye, ShieldAlert } from 'lucide-react';

/**
 * PacketTable Component
 * Reusable table for displaying captured network packets with loading skeletons and inspection trigger
 */
export default function PacketTable({
  packets = [],
  loading = false,
  emptyMessage = 'No packets captured yet. Start a capture session to observe live network traffic.',
  onSelectPacket,
  compact = false,
}) {
  const formatTime = (ts) => {
    if (!ts) return '--:--:--';
    const d = new Date(ts);
    return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, '0')}`;
  };

  // Render Skeleton rows during loading
  if (loading && (!packets || packets.length === 0)) {
    return (
      <div className="table-container">
        <table className="packet-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Protocol</th>
              <th>Source IP:Port</th>
              <th>Destination IP:Port</th>
              <th>Length</th>
              <th>Flags</th>
              {!compact && <th style={{ textAlign: 'right' }}>Details</th>}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td><div className="skeleton" style={{ height: '14px', width: '80px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '50px', borderRadius: '4px' }} /></td>
                <td><div className="skeleton" style={{ height: '14px', width: '130px' }} /></td>
                <td><div className="skeleton" style={{ height: '14px', width: '130px' }} /></td>
                <td><div className="skeleton" style={{ height: '14px', width: '45px' }} /></td>
                <td><div className="skeleton" style={{ height: '14px', width: '60px' }} /></td>
                {!compact && <td><div className="skeleton" style={{ height: '24px', width: '60px', marginLeft: 'auto' }} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="packet-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Protocol</th>
            <th>Source Endpoint</th>
            <th>Destination Endpoint</th>
            <th>Length</th>
            <th>Flags</th>
            {!compact && <th style={{ textAlign: 'right' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {packets.length === 0 ? (
            <tr>
              <td colSpan={compact ? 6 : 7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={28} style={{ opacity: 0.4, color: 'var(--accent-cyan)' }} />
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            packets.map((pkt) => (
              <tr
                key={pkt._id || `${pkt.timestamp}-${Math.random()}`}
                onClick={() => onSelectPacket && onSelectPacket(pkt)}
                className={`table-row-hover ${pkt.isNew ? 'new-flash' : ''}`}
              >
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatTime(pkt.timestamp)}
                </td>
                <td>
                  <ProtocolBadge protocol={pkt.protocol} />
                </td>
                <td>
                  <span className="ip-mono">{pkt.srcIP}</span>
                  {pkt.srcPort !== null && pkt.srcPort !== undefined && (
                    <span className="port-tag">:{pkt.srcPort}</span>
                  )}
                </td>
                <td>
                  <span className="ip-mono">{pkt.dstIP}</span>
                  {pkt.dstPort !== null && pkt.dstPort !== undefined && (
                    <span className="port-tag">:{pkt.dstPort}</span>
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
                  {pkt.length} B
                </td>
                <td>
                  {pkt.flags ? (
                    <span className="flags-pill">[{pkt.flags}]</span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>-</span>
                  )}
                </td>
                {!compact && (
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPacket && onSelectPacket(pkt);
                      }}
                      title="Inspect packet headers and payload"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
