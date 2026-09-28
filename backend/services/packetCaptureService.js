const Packet = require('../models/Packet');
const CaptureSession = require('../models/CaptureSession');

/**
 * ============================================================================
 * PACKET CAPTURE SERVICE (Simulation & Extensibility Engine)
 * ============================================================================
 * 
 * NOTE ON REAL HARDWARE PACKET SNIFFING:
 * Real raw packet sniffing typically requires OS-level administrative privileges (e.g. WinPcap / Npcap on Windows,
 * or libpcap on Linux/macOS) and native Node bindings such as:
 *   - `cap` (https://www.npmjs.com/package/cap)
 *   - `pcap` / `node_pcap` (https://www.npmjs.com/package/pcap)
 * 
 * To plug in real interface sniffing:
 * 1. Install `cap` or `pcap` and ensure Npcap/libpcap is installed on the host.
 * 2. In `startCapture()`, instantiate the Cap instance, open the network adapter (e.g., \Device\NPF_{...}),
 *    and attach the 'packet' event listener.
 * 3. Decode the raw Ethernet/IP/TCP buffer headers and pass the parsed object to the same persistence logic below.
 * 
 * The current implementation provides a zero-dependency, cross-platform simulation engine
 * that generates realistic live packets across standard protocols (TCP, UDP, HTTP, HTTPS, DNS, ICMP, ARP).
 */

// State variables for the capture service
let activeSession = null;
let captureTimer = null;
let isCapturing = false;

// Realistic IP Address pools for simulation
const IP_POOLS = {
  local: ['192.168.1.10', '192.168.1.45', '192.168.1.105', '10.0.0.12', '10.0.0.88'],
  gateway: ['192.168.1.1', '10.0.0.1'],
  dns: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '9.9.9.9'],
  webServers: [
    '142.250.190.46',  // Google
    '151.101.1.140',   // Fastly CDN
    '104.244.42.1',    // Twitter / X
    '185.199.108.153', // GitHub
    '13.107.42.14',    // Microsoft
    '52.95.120.50'     // AWS Cloud
  ],
};

const PROTOCOL_CONFIGS = [
  { protocol: 'TCP', weight: 35, commonPorts: [80, 443, 22, 8080, 3000] },
  { protocol: 'HTTPS', weight: 25, commonPorts: [443, 8443] },
  { protocol: 'HTTP', weight: 15, commonPorts: [80, 8080] },
  { protocol: 'UDP', weight: 12, commonPorts: [53, 123, 67, 161] },
  { protocol: 'DNS', weight: 8, commonPorts: [53] },
  { protocol: 'ICMP', weight: 3, commonPorts: [] },
  { protocol: 'ARP', weight: 2, commonPorts: [] },
];

const TCP_FLAGS = ['SYN', 'ACK', 'SYN-ACK', 'PSH-ACK', 'FIN-ACK', 'RST'];

/**
 * Random selection helpers
 */
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Weighted protocol picker
 */
function pickWeightedProtocol() {
  const totalWeight = PROTOCOL_CONFIGS.reduce((acc, curr) => acc + curr.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of PROTOCOL_CONFIGS) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }
  return PROTOCOL_CONFIGS[0];
}

/**
 * Generates a realistic mock packet object
 */
function generateRealisticPacket(sessionId) {
  const protoConfig = pickWeightedProtocol();
  const protocol = protoConfig.protocol;

  let srcIP, dstIP, srcPort, dstPort, flags = '';

  const isOutgoing = Math.random() > 0.4; // 60% client outbound, 40% inbound

  if (protocol === 'DNS') {
    srcIP = isOutgoing ? getRandomElement(IP_POOLS.local) : getRandomElement(IP_POOLS.dns);
    dstIP = isOutgoing ? getRandomElement(IP_POOLS.dns) : getRandomElement(IP_POOLS.local);
    srcPort = isOutgoing ? getRandomInt(49152, 65535) : 53;
    dstPort = isOutgoing ? 53 : getRandomInt(49152, 65535);
  } else if (protocol === 'ICMP') {
    srcIP = isOutgoing ? getRandomElement(IP_POOLS.local) : getRandomElement(IP_POOLS.gateway);
    dstIP = isOutgoing ? getRandomElement(IP_POOLS.webServers) : getRandomElement(IP_POOLS.local);
    srcPort = null;
    dstPort = null;
  } else if (protocol === 'ARP') {
    srcIP = getRandomElement(IP_POOLS.local);
    dstIP = getRandomElement(IP_POOLS.gateway);
    srcPort = null;
    dstPort = null;
  } else {
    // TCP, UDP, HTTP, HTTPS
    const webServer = getRandomElement(IP_POOLS.webServers);
    const localHost = getRandomElement(IP_POOLS.local);

    if (isOutgoing) {
      srcIP = localHost;
      dstIP = webServer;
      srcPort = getRandomInt(49152, 65535);
      dstPort = protoConfig.commonPorts.length > 0 ? getRandomElement(protoConfig.commonPorts) : 80;
    } else {
      srcIP = webServer;
      dstIP = localHost;
      srcPort = protoConfig.commonPorts.length > 0 ? getRandomElement(protoConfig.commonPorts) : 80;
      dstPort = getRandomInt(49152, 65535);
    }

    if (['TCP', 'HTTP', 'HTTPS'].includes(protocol)) {
      flags = getRandomElement(TCP_FLAGS);
    }
  }

  // Realistic packet length (Ethernet frames 40 to 1500 bytes MTU)
  let length = getRandomInt(40, 1500);
  if (protocol === 'DNS') length = getRandomInt(64, 512);
  if (protocol === 'ARP' || protocol === 'ICMP') length = getRandomInt(42, 98);

  return {
    timestamp: new Date(),
    srcIP,
    dstIP,
    protocol,
    srcPort,
    dstPort,
    length,
    flags,
    captureSessionId: sessionId,
  };
}

/**
 * Recursive scheduler to generate packets at randomized 300ms - 800ms intervals
 */
function scheduleNextPacket(io) {
  if (!isCapturing || !activeSession) return;

  const nextDelay = getRandomInt(300, 800); // 300ms to 800ms simulation interval

  captureTimer = setTimeout(async () => {
    if (!isCapturing || !activeSession) return;

    try {
      const packetData = generateRealisticPacket(activeSession._id);
      const packetDoc = await Packet.create(packetData);

      // Increment total packets on the session document
      await CaptureSession.findByIdAndUpdate(activeSession._id, {
        $inc: { totalPackets: 1 },
      });
      activeSession.totalPackets += 1;

      // Real-time streaming to connected Socket.IO clients (Day 5 requirement)
      if (io) {
        io.emit('new-packet', packetDoc);
      }
    } catch (err) {
      console.error('⚠️ Error capturing packet in simulation:', err.message);
    }

    // Schedule the subsequent packet
    scheduleNextPacket(io);
  }, nextDelay);
}

/**
 * Start Packet Capture
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} The active CaptureSession
 */
async function startCapture(io = null) {
  if (isCapturing && activeSession) {
    console.log(`⚠️ Packet capture is already running on session: ${activeSession._id}`);
    return activeSession;
  }

  // Create new active session in DB
  activeSession = await CaptureSession.create({
    startTime: new Date(),
    networkInterface: 'eth0 (simulated stream)',
    totalPackets: 0,
    status: 'running',
  });

  isCapturing = true;
  console.log(`🚀 [PacketCapture] Started capture session: ${activeSession._id}`);

  // Emit capture status change via Socket.IO
  if (io) {
    io.emit('capture-status', {
      isRunning: true,
      session: activeSession,
    });
  }

  // Begin packet generation loop
  scheduleNextPacket(io);

  return activeSession;
}

/**
 * Stop Packet Capture
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} The stopped CaptureSession
 */
async function stopCapture(io = null) {
  if (!isCapturing || !activeSession) {
    console.log('⚠️ No packet capture is currently running.');
    return activeSession;
  }

  // Clear running timeout
  if (captureTimer) {
    clearTimeout(captureTimer);
    captureTimer = null;
  }

  isCapturing = false;

  // Finalize session in DB
  const stoppedSession = await CaptureSession.findByIdAndUpdate(
    activeSession._id,
    {
      endTime: new Date(),
      status: 'stopped',
    },
    { new: true }
  );

  console.log(`🛑 [PacketCapture] Stopped capture session: ${activeSession._id}. Total packets: ${stoppedSession?.totalPackets || 0}`);

  activeSession = null;

  // Emit capture status change via Socket.IO
  if (io) {
    io.emit('capture-status', {
      isRunning: false,
      session: stoppedSession,
    });
  }

  return stoppedSession;
}

/**
 * Get current capture status and active session info
 */
function getCaptureStatus() {
  return {
    isRunning: isCapturing,
    activeSession: activeSession || null,
  };
}

module.exports = {
  startCapture,
  stopCapture,
  getCaptureStatus,
};
