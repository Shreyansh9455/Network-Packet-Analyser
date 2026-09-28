const express = require('express');
const mongoose = require('mongoose');
const Packet = require('../models/Packet');
const CaptureSession = require('../models/CaptureSession');
const packetCaptureService = require('../services/packetCaptureService');

const router = express.Router();

/**
 * Helper to get the Socket.IO instance attached to the Express app
 */
function getIO(req) {
  return req.app.get('io') || null;
}

/**
 * @route   GET /api/packets
 * @desc    Get paginated packets with strict input validation and query filters
 * @access  Public
 */
router.get('/packets', async (req, res, next) => {
  try {
    const {
      page: rawPage = '1',
      limit: rawLimit = '20',
      protocol,
      srcIP,
      dstIP,
      startDate,
      endDate,
      sessionId,
    } = req.query;

    // 1. Pagination input validation
    const page = parseInt(rawPage, 10);
    const limit = parseInt(rawLimit, 10);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "page" must be a positive integer greater than or equal to 1',
      });
    }

    if (isNaN(limit) || limit < 1 || limit > 200) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "limit" must be a positive integer between 1 and 200',
      });
    }

    const skip = (page - 1) * limit;
    const query = {};

    // 2. Protocol filter validation
    if (protocol) {
      const cleanProtocol = String(protocol).trim().toUpperCase();
      if (!/^[A-Z0-9_-]{2,10}$/.test(cleanProtocol)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid protocol filter format. Must be an alphanumeric string (e.g. TCP, UDP, HTTP, DNS)',
        });
      }
      query.protocol = cleanProtocol;
    }

    // 3. IP Filters
    if (srcIP && typeof srcIP === 'string' && srcIP.trim().length > 0) {
      // Escape regex special chars to prevent ReDoS
      const safeSrc = srcIP.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.srcIP = { $regex: safeSrc, $options: 'i' };
    }

    if (dstIP && typeof dstIP === 'string' && dstIP.trim().length > 0) {
      const safeDst = dstIP.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.dstIP = { $regex: safeDst, $options: 'i' };
    }

    // 4. Session ID validation
    if (sessionId) {
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sessionId format. Must be a 24-character hexadecimal MongoDB ObjectId',
        });
      }
      query.captureSessionId = sessionId;
    }

    // 5. Date range validation
    if (startDate || endDate) {
      query.timestamp = {};

      let parsedStart = null;
      let parsedEnd = null;

      if (startDate) {
        parsedStart = new Date(startDate);
        if (isNaN(parsedStart.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid startDate format. Please provide a valid ISO-8601 date string (e.g. 2026-09-27T00:00:00Z)',
          });
        }
        query.timestamp.$gte = parsedStart;
      }

      if (endDate) {
        parsedEnd = new Date(endDate);
        if (isNaN(parsedEnd.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid endDate format. Please provide a valid ISO-8601 date string',
          });
        }
        query.timestamp.$lte = parsedEnd;
      }

      if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
        return res.status(400).json({
          success: false,
          message: 'startDate cannot be after endDate',
        });
      }
    }

    // Execute queries in parallel for high performance
    const [packets, total] = await Promise.all([
      Packet.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('captureSessionId', 'networkInterface status')
        .lean(),
      Packet.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      packets,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/packets/:id
 * @desc    Get a single packet by its MongoDB ID
 * @access  Public
 */
router.get('/packets/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Packet ID format. Must be a 24-character hexadecimal MongoDB ObjectId',
      });
    }

    const packet = await Packet.findById(id).populate('captureSessionId').lean();

    if (!packet) {
      return res.status(404).json({
        success: false,
        message: `Packet not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      packet,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get aggregated network statistics: counts by protocol, total bytes, packets/min
 * @access  Public
 */
router.get('/stats', async (req, res, next) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [protocolBreakdown, overallTotals, packetsPerMinute] = await Promise.all([
      // Group by Protocol
      Packet.aggregate([
        {
          $group: {
            _id: '$protocol',
            count: { $sum: 1 },
            totalBytes: { $sum: '$length' },
            avgLength: { $avg: '$length' },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Total count & total bytes
      Packet.aggregate([
        {
          $group: {
            _id: null,
            totalPackets: { $sum: 1 },
            totalBytes: { $sum: '$length' },
          },
        },
      ]),

      // Packets per minute over the last hour
      Packet.aggregate([
        {
          $match: {
            timestamp: { $gte: oneHourAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' },
              minute: { $minute: '$timestamp' },
            },
            count: { $sum: 1 },
            bytes: { $sum: '$length' },
            sampleTime: { $first: '$timestamp' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.minute': 1 } },
      ]),
    ]);

    const totalPackets = overallTotals[0]?.totalPackets || 0;
    const totalBytes = overallTotals[0]?.totalBytes || 0;

    const protocolStats = protocolBreakdown.map((p) => ({
      protocol: p._id,
      count: p.count,
      totalBytes: p.totalBytes,
      avgLength: Math.round(p.avgLength || 0),
      percentage: totalPackets > 0 ? ((p.count / totalPackets) * 100).toFixed(1) : '0',
    }));

    const timeline = packetsPerMinute.map((item) => ({
      time: item.sampleTime,
      minute: `${String(item._id.hour).padStart(2, '0')}:${String(item._id.minute).padStart(2, '0')}`,
      count: item.count,
      bytes: item.bytes,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalPackets,
        totalBytes,
        totalBytesFormatted: formatBytes(totalBytes),
        protocolStats,
        packetsPerMinute: timeline,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper to format byte counts into human-readable strings
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * @route   POST /api/capture/start
 * @desc    Start packet capture session
 * @access  Public
 */
router.post('/capture/start', async (req, res, next) => {
  try {
    const io = getIO(req);
    const session = await packetCaptureService.startCapture(io);

    return res.status(201).json({
      success: true,
      message: 'Packet capture started successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/capture/stop
 * @desc    Stop currently running packet capture session
 * @access  Public
 */
router.post('/capture/stop', async (req, res, next) => {
  try {
    const io = getIO(req);
    const session = await packetCaptureService.stopCapture(io);

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'No capture session is currently running',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Packet capture stopped successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/capture/status
 * @desc    Check whether packet capture is running and get active session
 * @access  Public
 */
router.get('/capture/status', (req, res, next) => {
  try {
    const status = packetCaptureService.getCaptureStatus();
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/sessions
 * @desc    List past and active capture sessions
 * @access  Public
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await CaptureSession.find().sort({ startTime: -1 }).limit(50).lean();
    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
