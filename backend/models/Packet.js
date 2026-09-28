const mongoose = require('mongoose');

/**
 * Packet Schema
 * Represents an individual captured network packet.
 */
const packetSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    srcIP: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    dstIP: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    protocol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true, // E.g., TCP, UDP, ICMP, HTTP, DNS, HTTPS, ARP
    },
    srcPort: {
      type: Number,
      min: 0,
      max: 65535,
    },
    dstPort: {
      type: Number,
      min: 0,
      max: 65535,
    },
    length: {
      type: Number,
      required: true,
      min: 0, // packet size in bytes
    },
    flags: {
      type: String,
      default: '', // TCP flags like SYN, ACK, PSH, FIN, RST
      trim: true,
    },
    captureSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaptureSession',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient timestamp-based queries with pagination
packetSchema.index({ captureSessionId: 1, timestamp: -1 });

module.exports = mongoose.model('Packet', packetSchema);
