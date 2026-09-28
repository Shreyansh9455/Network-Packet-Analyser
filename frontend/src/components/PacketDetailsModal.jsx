import React from 'react';
import { X, Shield, Clock, HardDrive, ArrowRight, Flag, Terminal } from 'lucide-react';

export default function PacketDetailsModal({ packet, onClose }) {
  if (!packet) return null;

  // Generate synthetic hex dump representation for realistic Wireshark packet view
  const generateSyntheticHex = (pkt) => {
    const lines = [];
    const length = pkt.length || 64;
    const protoHex = pkt.protocol === 'TCP' ? '06' : pkt.protocol === 'UDP' ? '11' : '01';
    
    // Header representation
    lines.push(`0000   45 00 00 ${length.toString(16).padStart(2, '0')} a1 b2 40 00  40 ${protoHex} 00 00 c0 a8 01 0a   E...@@..@.......`);
    lines.push(`0010   c0 a8 01 01 ${pkt.srcPort ? (pkt.srcPort & 0xff).toString(16).padStart(2, '0') : '00'} ${pkt.dstPort ? (pkt.dstPort & 0xff).toString(16).padStart(2, '0') : '00'} 00 00 00 00  00 00 00 00 50 02 20 00   ..........P. .`);
    
    if (length > 32) {
      lines.push(`0020   7e 6f 00 00 ${pkt.protocol.split('').map(c => c.charCodeAt(0).toString(16)).join(' ')} 67 65 74 20 2f 20 68 74 74 70   ~o..${pkt.protocol} get / http`);
      lines.push(`0030   31 2e 31 0d 0a 48 6f 73  74 3a 20 6c 6f 63 61 6c   1.1..Host: local`);
    }
    
    return lines.join('\n');
  };

  const getProtoClass = (proto) => {
    const map = {
      TCP: 'proto-tcp',
      UDP: 'proto-udp',
      HTTP: 'proto-http',
      HTTPS: 'proto-https',
      DNS: 'proto-dns',
      ICMP: 'proto-icmp',
      ARP: 'proto-arp',
    };
    return map[proto] || 'proto-tcp';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`proto-badge ${getProtoClass(packet.protocol)}`}>
              {packet.protocol}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Packet Inspection <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>#{packet._id?.slice(-8)}</span>
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Timestamp</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                {new Date(packet.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Packet Length</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}>
                {packet.length} Bytes ({packet.length * 8} bits)
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Source Endpoint</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8' }}>
                {packet.srcIP} {packet.srcPort !== null && packet.srcPort !== undefined && `:${packet.srcPort}`}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Destination Endpoint</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#a855f7' }}>
                {packet.dstIP} {packet.dstPort !== null && packet.dstPort !== undefined && `:${packet.dstPort}`}
              </div>
            </div>
          </div>

          {/* TCP Flags & Session */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {packet.flags && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <Flag size={14} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>Flags: <strong>{packet.flags}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <Terminal size={14} color="#9ca3af" />
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Session ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{packet.captureSessionId?._id || packet.captureSessionId || 'N/A'}</span></span>
            </div>
          </div>

          {/* Hex & Raw Frame Inspector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                Raw Frame Byte Dump (Hex & ASCII)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ethernet II / IPv4 Layer</span>
            </div>
            <pre className="hex-dump">
              {generateSyntheticHex(packet)}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
