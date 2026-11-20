import React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Circle,
  Clock,
  XCircle,
  Sparkles,
} from "lucide-react";

/**
 * Returns configuration (text, tailwind classes, icon) for any status badge across modules.
 */
export const getStatusBadgeConfig = (status) => {
  const s = (status || "").toLowerCase().trim();

  switch (s) {
    case "completed":
    case "success":
      return {
        text: s === "success" ? "Success" : "Completed",
        className: "bg-emerald-50 border border-emerald-300 text-emerald-700",
        icon: <CheckCircle size={12} className="text-emerald-600 shrink-0" />,
      };

    case "received":
      return {
        text: "Received",
        className: "bg-sky-50 border border-sky-300 text-sky-700",
        icon: <Sparkles size={12} className="text-sky-600 shrink-0" />,
      };

    case "ready_to_process":
      return {
        text: "Ready to Process",
        className: "bg-blue-50 border border-blue-300 text-blue-700",
        icon: <Sparkles size={12} className="text-blue-600 shrink-0" />,
      };

    case "checked":
      return {
        text: "Checked",
        className: "bg-emerald-50 border border-emerald-300 text-emerald-700",
        icon: <CheckCircle size={12} className="text-emerald-600 shrink-0" />,
      };

    case "started":
      return {
        text: "Started",
        className: "bg-indigo-50 border border-indigo-300 text-indigo-700",
        icon: <Clock size={12} className="text-indigo-600 animate-spin shrink-0" />,
      };

    case "in_queue":
      return {
        text: "In Queue",
        className: "bg-amber-50 border border-amber-300 text-amber-700",
        icon: <Clock size={12} className="text-amber-600 shrink-0" />,
      };

    case "processing":
      return {
        text: "Processing",
        className: "bg-purple-50 border border-purple-300 text-purple-700",
        icon: (
          <Clock size={12} className="text-purple-600 animate-spin shrink-0" />
        ),
      };

    case "pending":
    case "qc_pending":
      return {
        text: "Pending",
        className: "bg-yellow-100 border border-yellow-500 text-yellow-700",
        icon: <Clock size={12} className="shrink-0" />,
      };

    case "rejected":
    case "failed":
      return {
        text: s === "failed" ? "Failed" : "Rejected",
        className: "bg-rose-50 border border-rose-300 text-rose-700",
        icon: <AlertTriangle size={12} className="text-rose-600 shrink-0" />,
      };

    case "in_progress":
      return {
        text: "In Progress",
        className: "bg-yellow-100 border border-yellow-500 text-yellow-700",
        icon: <Clock size={12} className="shrink-0" />,
      };

    case "verified":
    case "qc_verified":
      return {
        text: "Verified",
        className: "bg-blue-100 border border-blue-500 text-blue-700",
        icon: <CheckCircle size={12} className="shrink-0" />,
      };

    case "reverify":
    case "qc_re_verify":
      return {
        text: "Re-Verify",
        className: "bg-yellow-100 border border-yellow-500 text-yellow-700",
        icon: <Clock size={12} className="shrink-0" />,
      };

    case "not_verified":
      return {
        text: "Not Verified",
        className: "bg-red-100 border border-red-500 text-red-700",
        icon: <AlertTriangle size={12} className="shrink-0" />,
      };

    case "active":
      return {
        text: "Active",
        className: "bg-emerald-50 border border-emerald-200 text-emerald-700",
        icon: <CheckCircle size={12} className="text-emerald-600 shrink-0" />,
      };

    case "inactive":
      return {
        text: "Inactive",
        className: "bg-rose-50 border border-rose-200 text-rose-700",
        icon: <Ban size={12} className="text-rose-600 shrink-0" />,
      };

    case "resolved":
      return {
        text: "Resolved",
        className: "bg-blue-100 border border-blue-500 text-blue-700",
        icon: <CheckCircle size={12} className="shrink-0" />,
      };

    case "closed":
      return {
        text: "Closed",
        className: "bg-gray-100 border border-gray-500 text-gray-700",
        icon: <XCircle size={12} className="shrink-0" />,
      };

    case "cancelled":
      return {
        text: "Cancelled",
        className: "bg-red-100 border border-red-500 text-red-700",
        icon: <XCircle size={12} className="shrink-0" />,
      };

    case "open":
      return {
        text: "Open",
        className: "bg-orange-100 border border-orange-400 text-orange-700",
        icon: <Circle size={10} className="fill-orange-500 text-orange-500 shrink-0" />,
      };

    default:
      return {
        text: status || "Unknown",
        className: "bg-slate-100 border border-slate-300 text-slate-700",
        icon: <Circle size={10} className="fill-slate-400 text-slate-400 shrink-0" />,
      };
  }
};

/**
 * Reusable StatusBadge component for table cells and modal headers.
 */
export const StatusBadge = ({ status, className = "" }) => {
  const config = getStatusBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

/**
 * Direct render helper function returning StatusBadge.
 */
export const getStatusBadge = (status, className = "") => (
  <StatusBadge status={status} className={className} />
);

/**
 * Standard interactive StatusToggle component for toggling active/inactive status across tables and modals.
 */
export const StatusToggle = ({
  isActive,
  onToggle,
  loading = false,
  disabled = false,
  size = "md",
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && !loading && onToggle) onToggle(e);
      }}
      disabled={disabled || loading}
      title={isActive ? "Click to Deactivate" : "Click to Activate"}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
      } ${className}`}
    >
      <span
        className={`rounded-full shrink-0 transition-all ${
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        } ${
          isActive
            ? "bg-emerald-500 ring-2 ring-emerald-200"
            : "bg-rose-500 ring-2 ring-rose-200"
        }`}
      />
      <span>{isActive ? "Active" : "Inactive"}</span>
    </button>
  );
};