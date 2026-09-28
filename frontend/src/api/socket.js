import { io } from 'socket.io-client';

// Determine Socket.IO backend connection URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    // If VITE_API_URL is e.g. "http://localhost:5000/api", extract "http://localhost:5000"
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  // Default to relative origin (proxied in Vite dev server)
  return window.location.origin;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
});

export default socket;
