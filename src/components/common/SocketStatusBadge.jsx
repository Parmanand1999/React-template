import React from "react";
import { useSocket } from "@/hooks/useSocket";

/**
 * SocketStatusBadge
 * Displays real-time socket connection indicator (Live / Connecting)
 */
const SocketStatusBadge = ({
  liveLabel = "Live",
  connectingLabel = "Connecting",
  className = "",
}) => {
  const { isConnected } = useSocket();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-all duration-300 ${
        isConnected
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      } ${className}`}
      title={isConnected ? "Real-time socket connected" : "Connecting to socket server..."}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </span>
      <span>{isConnected ? liveLabel : connectingLabel}</span>
    </div>
  );
};

export default SocketStatusBadge;
