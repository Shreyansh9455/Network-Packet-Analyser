const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Packet = require('../models/Packet');
const CaptureSession = require('../models/CaptureSession');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/network_packet_analyser';

// Realistic mock pools for randomized packet generation
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP', 'ARP'];

const SAMPLE_IPS = [
  '192.168.1.1',
  '192.168.1.45',
  '192.168.1.102',
  '10.0.0.15',
  '10.0.0.24',
  '172.16.0.4',
  '8.8.8.8',       // Google DNS
  '1.1.1.1',       // Cloudflare DNS
  '142.250.190.46', // Google web
  '151.101.1.140',  // CDN / Fastly
  '104.244.42.1',   // Twitter / X
  '185.199.108.153' // GitHub
];

const COMMON_PORTS = [80, 443, 53, 22, 8080, 3000, 5000, 8443];
const TCP_FLAGS = ['SYN', 'ACK', 'SYN-ACK', 'PSH-ACK', 'FIN-ACK', 'RST'];

/**
 * Helper to pick a random item from an array
 */
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Helper to generate a random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seed script to populate sample capture session and 50 packets
 */
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB at:', MONGO_URI);

    // 1. Create a sample CaptureSession
    const session = await CaptureSession.create({
      startTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      endTime: new Date(),
      networkInterface: 'eth0 (seeded)',
      totalPackets: 50,
      status: 'stopped',
    });

    console.log(` Created sample CaptureSession ID: ${session._id}`);

    // 2. Generate 50 realistic mock packets
    const packets = [];
    const now = Date.now();

    for (let i = 0; i < 50; i++) {
      const protocol = getRandomItem(PROTOCOLS);
      const isICMPorARP = protocol === 'ICMP' || protocol === 'ARP';

      // Pick source and destination IPs that are distinct
      const srcIP = getRandomItem(SAMPLE_IPS);
      let dstIP = getRandomItem(SAMPLE_IPS);
      while (dstIP === srcIP) {
        dstIP = getRandomItem(SAMPLE_IPS);
      }

      // Time distributed over the past hour
      const packetTime = new Date(now - (50 - i) * 60 * 1000 + getRandomInt(0, 30000));

      const packet = {
        timestamp: packetTime,
        srcIP: srcIP,
        dstIP: dstIP,
        protocol: protocol,
        srcPort: isICMPorARP ? null : (Math.random() > 0.5 ? getRandomItem(COMMON_PORTS) : getRandomInt(49152, 65535)),
        dstPort: isICMPorARP ? null : (Math.random() > 0.5 ? getRandomItem(COMMON_PORTS) : getRandomInt(49152, 65535)),
        length: getRandomInt(40, 1500), // Ethernet MTU standard range
        flags: ['TCP', 'HTTP', 'HTTPS'].includes(protocol) ? getRandomItem(TCP_FLAGS) : '',
        captureSessionId: session._id,
      };

      packets.push(packet);
    }

    // 3. Bulk insert packets into MongoDB
    const inserted = await Packet.insertMany(packets);
    console.log(` Successfully inserted ${inserted.length} sample packets!`);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();
