import { io } from "socket.io-client";
import useAuthStore from "@/store/useAuthStore";

/**
 * Socket.IO Server URL
 * Falls back to VITE_SOCKET_URL -> VITE_API_BASE_URL -> window.location.origin
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";


let socketInstance = null;

/**
 * Initialize or retrieve the shared socket.io instance
 * Can be reused across any module (Machines, Batches, Notifications, etc.)
 */
export const getSocket = () => {
  if (!socketInstance) {
    const token = useAuthStore.getState()?.accessToken;

    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
      auth: {
        token: token ? `Bearer ${token}` : "",
      },
    });

    socketInstance.on("connect", () => {
      if (import.meta.env.DEV) {
        console.log("🟢 [Socket.io] Connected with ID:", socketInstance.id);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      if (import.meta.env.DEV) {
        console.log("🔴 [Socket.io] Disconnected:", reason);
      }
    });

    socketInstance.on("connect_error", (error) => {
      if (import.meta.env.DEV) {
        console.warn("⚠️ [Socket.io] Connection Error:", error?.message);
      }
    });
  }

  return socketInstance;
};

/**
 * Manually connect socket (e.g. after login or token change)
 */
export const connectSocket = () => {
  const socket = getSocket();
  const token = useAuthStore.getState()?.accessToken;

  if (socket) {
    if (token) {
      socket.auth = { token: `Bearer ${token}` };
    }
    if (!socket.connected) {
      socket.connect();
    }
  }
  return socket;
};

/**
 * Manually disconnect socket (e.g. on logout)
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const emitSocket = (event, data) => {
  const socket = getSocket();
  if (socket?.connected) socket.emit(event, data);
};

export default getSocket;
