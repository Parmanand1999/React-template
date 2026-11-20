import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/Services/socketService";

/**
 * Hook to access the shared socket instance and connection status
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(() => {
    const socket = getSocket();
    return Boolean(socket?.connected);
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Initial check
    setIsConnected(Boolean(socket.connected));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: getSocket(), isConnected };
};

/**
 * Hook to listen to socket events with automatic cleanup on unmount
 * Supports single event name string or array of event names.
 * Uses a ref for callback to avoid stale closure issues.
 *
 * @param {string | string[]} eventName - Socket event name or array of event names
 * @param {(data: any) => void} callback - Handler function when event fires
 */
export const useSocketEvent = (eventName, callback) => {
  const savedCallback = useRef(callback);

  // Keep latest callback reference
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !eventName) return;

    const eventList = Array.isArray(eventName) ? eventName : [eventName];

    const handler = (data) => {
      if (typeof savedCallback.current === "function") {
        savedCallback.current(data);
      }
    };

    // Attach listener to each event in list
    eventList.forEach((ev) => socket.on(ev, handler));

    // Cleanup listeners on unmount or when event list changes
    return () => {
      eventList.forEach((ev) => socket.off(ev, handler));
    };
  }, [Array.isArray(eventName) ? eventName.join(",") : eventName]);
};

export default useSocket;
