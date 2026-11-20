import React, { useEffect, useState, useCallback } from "react";
import {
  History,
  UploadCloud,
  UserCheck,
  FileCheck,
  MessageSquareText,
  Send,
  Activity,
  User,
  Clock,
  Cpu,
  Layers,
  FileText,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomLoader from "@/components/common/CustomLoader";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { getBatchAuditLogs } from "@/Services/batchServices";
import { format } from "date-fns";

// Helper to format action titles, icons, and badge colors
const ACTION_CONFIG = {
  "batch.uploaded": {
    label: "Batch Uploaded",
    icon: UploadCloud,
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    dotBg: "bg-blue-600 text-white ring-4 ring-blue-100",
  },
  "batch.assigned": {
    label: "Batch Assigned",
    icon: UserCheck,
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    dotBg: "bg-purple-600 text-white ring-4 ring-purple-100",
  },
  "batch.sent_to_review": {
    label: "Sent to Review",
    icon: FileCheck,
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    dotBg: "bg-amber-500 text-white ring-4 ring-amber-100",
  },
  "batch.remark_added": {
    label: "Remark Added",
    icon: MessageSquareText,
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotBg: "bg-indigo-600 text-white ring-4 ring-indigo-100",
  },
  "batch.dispatched": {
    label: "Dispatched to Machine",
    icon: Send,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotBg: "bg-emerald-600 text-white ring-4 ring-emerald-100",
  },
};

const getActionConfig = (actionKey) => {
  return (
    ACTION_CONFIG[actionKey] || {
      label: actionKey?.replace(/[\._]/g, " ")?.toUpperCase() || "Activity Log",
      icon: Activity,
      badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
      dotBg: "bg-slate-600 text-white ring-4 ring-slate-100",
    }
  );
};

const formatDateSafe = (isoString) => {
  if (!isoString) return "—";
  try {
    return format(new Date(isoString), "dd MMM yyyy, hh:mm a");
  } catch (err) {
    return isoString;
  }
};

const BatchAuditLogsModal = ({
  isOpen = false,
  onClose,
  batchId = null,
  batchData = null,
}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!batchId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getBatchAuditLogs(batchId);
      if (res?.status === 200 || res?.status === 201) {
        const items = res?.data?.data?.items
        setLogs(Array.isArray(items) ? items : []);
      } else {
        setError("Failed to load activity logs.");
      }
    } catch (err) {
      console.error("Error fetching batch audit logs:", err);
      setError(err?.response?.data?.message || "Error fetching audit logs.");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (isOpen && batchId) {
      fetchLogs();
    } else if (!isOpen) {
      setLogs([]);
      setError(null);
    }
  }, [isOpen, batchId, fetchLogs]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] rounded-3xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50 flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                <History size={20} />
              </span>
              <div>
                <h2>Batch Activity Audit Log</h2>
                {batchData?.batchNo && (
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Batch No: <span className="text-primary font-bold">{batchData.batchNo}</span>
                  </p>
                )}
              </div>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Complete chronological audit trail and operational events for this batch.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body - Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center">
              <CustomLoader />
              <p className="text-xs text-slate-400 mt-2 font-medium">Fetching activity timeline...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center bg-rose-50/60 rounded-2xl border border-rose-100 p-4">
              <p className="text-xs font-semibold text-rose-600">{error}</p>
              <CustomButton
                type="button"
                variant="outline"
                onClick={fetchLogs}
                className="mt-3 text-xs"
              >
                Retry
              </CustomButton>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Activity size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">No activity logs recorded yet</p>
              <p className="text-xs text-slate-400">Events will appear here as this batch is processed.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {logs.map((log) => {
                const config = getActionConfig(log.action);
                const IconComponent = config.icon;
                const meta = log.meta || {};

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Icon Circle */}
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${config.dotBg}`}
                    >
                      <IconComponent size={13} />
                    </div>

                    {/* Activity Card */}
                    <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-2xs space-y-2.5 ml-2">
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badgeBg}`}
                        >
                          <IconComponent size={13} />
                          {config.label}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <Clock size={12} />
                          <span>{formatDateSafe(log.createdAt)}</span>
                        </div>
                      </div>

                      {/* Performed By User Info */}
                      {log.performedBy && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pt-1">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            <User size={11} />
                          </div>
                          <span>
                            Executed by:{" "}
                            <strong className="text-slate-900 font-bold">
                              {log.performedBy.name || "System"}
                            </strong>
                          </span>
                        </div>
                      )}

                      {/* Meta Information Cards */}
                      {Object.keys(meta).length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                          {meta.machineCode && (
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
                              <Cpu size={14} className="text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Machine</span>
                                <span className="font-bold text-slate-800 text-xs">{meta.machineCode}</span>
                              </div>
                            </div>
                          )}

                          {meta.module && (
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
                              <Layers size={14} className="text-blue-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Module</span>
                                <span className="font-bold text-slate-800 text-xs uppercase">{meta.module}</span>
                              </div>
                            </div>
                          )}

                          {meta.entryCount !== undefined && (
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
                              <FileText size={14} className="text-amber-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Entry Count</span>
                                <span className="font-bold text-slate-800 text-xs">{meta.entryCount} entries</span>
                              </div>
                            </div>
                          )}

                          {meta.totalData !== undefined && (
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-2">
                              <FileText size={14} className="text-purple-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Records</span>
                                <span className="font-bold text-slate-800 text-xs">{meta.totalData}</span>
                              </div>
                            </div>
                          )}

                          {/* {meta.jobId && (
                            <div className="col-span-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Job ID</span>
                              <span className="font-mono text-[11px] text-slate-700 truncate block">{meta.jobId}</span>
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold px-4 cursor-pointer"
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchAuditLogsModal;
