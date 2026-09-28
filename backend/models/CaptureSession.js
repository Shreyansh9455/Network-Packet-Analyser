const mongoose = require('mongoose');

/**
 * CaptureSession Schema
 * Represents an individual packet capture session (similar to a Wireshark capture session).
 */
const captureSessionSchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    networkInterface: {
      type: String,
      default: 'eth0 (simulated)',
      trim: true,
    },
    totalPackets: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['running', 'stopped'],
      default: 'running',
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Helpful index to quickly query sessions by status or start time
captureSessionSchema.index({ status: 1, startTime: -1 });

module.exports = mongoose.model('CaptureSession', captureSessionSchema);
