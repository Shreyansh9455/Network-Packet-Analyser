import axiosInstance from './axiosInstance';

/**
 * Fetch paginated and filterable packets
 * @param {Object} params - { page, limit, protocol, srcIP, dstIP, startDate, endDate, sessionId }
 */
export const getPackets = async (params = {}) => {
  const response = await axiosInstance.get('/packets', { params });
  return response.data;
};

/**
 * Fetch a single packet by its MongoDB ID
 * @param {string} id
 */
export const getPacketById = async (id) => {
  const response = await axiosInstance.get(`/packets/${id}`);
  return response.data;
};

/**
 * Fetch aggregated statistics (total count, protocol breakdown, bytes, packets/min)
 */
export const getPacketStats = async () => {
  const response = await axiosInstance.get('/stats');
  return response.data;
};

/**
 * Fetch current packet capture engine status
 */
export const getCaptureStatus = async () => {
  const response = await axiosInstance.get('/capture/status');
  return response.data;
};

/**
 * Start a new packet capture session
 */
export const startCapture = async () => {
  const response = await axiosInstance.post('/capture/start');
  return response.data;
};

/**
 * Stop the active packet capture session
 */
export const stopCapture = async () => {
  const response = await axiosInstance.post('/capture/stop');
  return response.data;
};

/**
 * Fetch list of past and active capture sessions
 */
export const getSessions = async () => {
  const response = await axiosInstance.get('/sessions');
  return response.data;
};

/**
 * Backend health check
 */
export const getHealth = async () => {
  const response = await axiosInstance.get('/health');
  return response.data;
};

export default {
  getPackets,
  getPacketById,
  getPacketStats,
  getCaptureStatus,
  startCapture,
  stopCapture,
  getSessions,
  getHealth,
};
