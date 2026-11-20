import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Server,
  HardDrive,
  Cpu,
  Globe,
  Radio,
  Clock,
  KeyRound,
  Calendar,
  ActivitySquare,
  Trash,
  Copy,
  Check,
  RefreshCw,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { getMachineById } from "@/Services/machineServices";
import { toast } from "react-toastify";

const MachineViewModal = ({
  isOpen,
  onClose,
  machine,
  onToggleStatus,
  onDelete,
}) => {
  const [machineData, setMachineData] = useState(machine || null);
  const [loading, setLoading] = useState(false);
  const [copiedHwId, setCopiedHwId] = useState(false);

  useEffect(() => {
    if (!isOpen || !machine?.id) {
      setMachineData(machine || null);
      return;
    }

    setMachineData(machine);
    const fetchLatest = async () => {
      try {
        setLoading(true);
        const res = await getMachineById(machine.id);
        if (res?.data?.success && res.data.data) {
          setMachineData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch machine details by ID", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [isOpen, machine]);

  if (!machineData) return null;

  const isOnline = Boolean(machineData.isOnline);
  const isActive = machineData.isActive === "active";
  const modules = Array.isArray(machineData.enabledModules)
    ? machineData.enabledModules
    : [];

  const handleCopyHwId = () => {
    if (!machineData.hardwareId) return;
    navigator.clipboard.writeText(machineData.hardwareId);
    setCopiedHwId(true);
    toast.success("Hardware ID copied to clipboard!");
    setTimeout(() => setCopiedHwId(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl sm:max-h-[85vh] max-w-[95vw] rounded-3xl p-6 bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Server size={20} />
              </span>
              <span>Machine #{machineData.machineCode || machineData.id?.slice(0, 8)}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOnline
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isOnline
                      ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200"
                      : "bg-slate-400"
                  }`}
                />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="capitalize">{machineData.isActive || "inactive"}</span>
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Registered on{" "}
            {formatDate(machineData.createdAt, "dd MMM yyyy, hh:mm a")}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body Content */}
        <div className="space-y-4 pt-2 overflow-y-auto pr-1 flex-1">
          {/* Key Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Hostname
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm truncate">
                <Server size={14} className="text-indigo-500 shrink-0" />
                <span className="truncate">{machineData.hostName || "N/A"}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Reported State
              </span>
              <div className="font-semibold text-slate-800 text-sm capitalize">
                {machineData.reportedState || "idle"}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                IP Address
              </span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 text-xs truncate">
                <Globe size={13} className="text-blue-500 shrink-0" />
                <span className="truncate">{machineData.ipAddress || "—"}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                OS Platform
              </span>
              <div className="font-semibold text-slate-800 text-sm capitalize truncate">
                {machineData.osPlatform || "—"}{" "}
                {machineData.osVersion ? `(${machineData.osVersion})` : ""}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Utility Version
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                <Tag size={13} className="text-emerald-600 shrink-0" />
                <span>v{machineData.utilityVersion || "1.0.0"}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Last Heartbeat
              </span>
              <div className="flex items-center gap-1 text-slate-800 text-xs font-medium">
                <Clock size={13} className="text-amber-500 shrink-0" />
                <span>
                  {machineData.lastSeenAt
                    ? formatDate(machineData.lastSeenAt, "dd-MM-yyyy HH:mm")
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Fingerprint Card */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <HardDrive size={14} className="text-indigo-600" />
                Hardware ID Fingerprint
              </span>
              {machineData.hardwareId && (
                <button
                  type="button"
                  onClick={handleCopyHwId}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  {copiedHwId ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="font-mono text-xs text-slate-800 break-all bg-white p-2 rounded-lg border border-slate-200/60">
              {machineData.hardwareId || "No hardware fingerprint assigned"}
            </p>
          </div>

          {/* Enabled Modules */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Configured Scraper Modules
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {modules.length > 0 ? (
                modules.map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 capitalize shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{mod}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No modules enabled</span>
              )}
            </div>
          </div>

          {/* Timestamps & Security Details */}
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-500" />
                Secret Rotated At:
              </span>
              <span className="font-medium text-slate-700">
                {machineData.secretRotatedAt
                  ? formatDate(machineData.secretRotatedAt, "dd MMM yyyy, hh:mm a")
                  : "Not rotated yet"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Updated At:
              </span>
              <span className="font-medium text-slate-700">
                {formatDate(machineData.updatedAt, "dd MMM yyyy, hh:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {onToggleStatus && (
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => onToggleStatus(machineData)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer flex items-center gap-1.5"
              >
                <ActivitySquare size={13} />
                <span>{isActive ? "Deactivate" : "Activate"}</span>
              </CustomButton>
            )}

            {onDelete && (
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onDelete(machineData);
                }}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash size={13} />
                <span>Delete</span>
              </CustomButton>
            )}
          </div>

          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 text-xs font-semibold cursor-pointer h-8"
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MachineViewModal;
