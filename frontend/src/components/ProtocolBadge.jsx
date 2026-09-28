import React from 'react';

/**
 * ProtocolBadge Component
 * Renders a color-coded badge based on network protocol
 * Colors:
 * - TCP = Blue / Cyan
 * - UDP = Green / Emerald
 * - ICMP = Orange / Rose
 * - HTTP = Purple / Indigo
 * - DNS = Yellow / Amber
 * - HTTPS = Violet
 * - ARP = Teal
 */
export default function ProtocolBadge({ protocol = 'TCP', size = 'normal' }) {
  const cleanProto = (protocol || 'UNKNOWN').toUpperCase();

  const getStyleClass = () => {
    switch (cleanProto) {
      case 'TCP':
        return 'proto-tcp';
      case 'UDP':
        return 'proto-udp';
      case 'ICMP':
        return 'proto-icmp';
      case 'HTTP':
        return 'proto-http';
      case 'HTTPS':
        return 'proto-https';
      case 'DNS':
        return 'proto-dns';
      case 'ARP':
        return 'proto-arp';
      default:
        return 'proto-default';
    }
  };

  return (
    <span className={`proto-badge ${getStyleClass()} ${size === 'sm' ? 'proto-sm' : ''}`}>
      {cleanProto}
    </span>
  );
}
