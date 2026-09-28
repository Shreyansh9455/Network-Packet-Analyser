import axios from 'axios';

// Base API configuration (proxied in dev, or customizable via environment)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Health check
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/**
 * Fetch paginated & filtered packets
 */
export const fetchPackets = async (params = {}) => {
  const response = await apiClient.get('/packets', { params });
  return response.data;
};

/**
 * Fetch a single packet by its ID
 */
export const fetchPacketById = async (id) => {
  const response = await apiClient.get(`/packets/${id}`);
  return response.data;
};

/**
 * Fetch aggregated network stats
 */
export const fetchStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data;
};

/**
 * Fetch current capture status
 */
export const fetchCaptureStatus = async () => {
  const response = await apiClient.get('/capture/status');
  return response.data;
};

/**
 * Start packet capture session
 */
export const startCapture = async () => {
  const response = await apiClient.post('/capture/start');
  return response.data;
};

/**
 * Stop packet capture session
 */
export const stopCapture = async () => {
  const response = await apiClient.post('/capture/stop');
  return response.data;
};

/**
 * Fetch past capture sessions
 */
export const fetchSessions = async () => {
  const response = await apiClient.get('/sessions');
  return response.data;
};

export default apiClient;
