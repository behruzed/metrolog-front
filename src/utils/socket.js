import { io } from 'socket.io-client';

const getSocketURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return undefined;

  let apiUrl = envUrl;
  if (envUrl.startsWith('http://localhost') || envUrl.startsWith('https://localhost') || envUrl.startsWith('http://127.0.0.1')) {
    try {
      const url = new URL(envUrl);
      url.hostname = window.location.hostname;
      apiUrl = url.toString();
    } catch (e) {
      console.error('Failed to parse VITE_API_URL for socket, falling back to original:', e);
    }
  }
  return apiUrl.replace('/api', '');
};

const SOCKET_URL = getSocketURL();

export const socket = SOCKET_URL
  ? io(SOCKET_URL, { autoConnect: false })
  : io({ autoConnect: false });

