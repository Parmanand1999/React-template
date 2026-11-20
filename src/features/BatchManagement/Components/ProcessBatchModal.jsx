import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Server,
  Zap,
  Cpu,
  Layers,
  Building2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import SingleSelectInfiniteDropdown from "@/components/common/DropdownSelect/SingleSelectInfiniteDropdown";
import { dispatchBatch } from "@/Services/batchServices";
import { getMachinesList } from "@/Services/machineServices";

/**
 * ProcessBatchModal
 * Modal to dispatch/process a batch on a selected utility machine with priority configuration
 *
 * Endpoint: POST /api/v1/batches/{id}/dispatch
 * Payload: { machineId: string, priority: 0 | 1 }
 */
const ProcessBatchModal = ({
  isOpen = false,
  onClose,
  batch = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  // priority: false (0) or true (1)
  const [isHighPriority, setIsHighPriority] = useState(false);

  const batchId = batch?.id || batch?._id;

  // Reset form when modal closes
  const handleClose = () => {
    if (loading) return;
    setSelectedMachine(null);
    setIsHighPriority(false);
    if (onClose) onClose();
  };

  // Fetch machines with infinite scroll & search
  const fetchMachinesForDropdown = useCallback(
    async ({ page = 1, search = "", pageSize = 10 }) => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", pageSize);
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      params.append("isActive", "active");

      try {
        const response = await getMachinesList(params.toString());
        if (!response?.data?.success) {
          return { data: [], pagination: null };
        }

        const items = response.data.data?.items || [];
        const meta = response.data.data?.meta || {};

        const transformedData = items.map((machine) => ({
          ...machine,
          _id: machine.id,
          id: machine.id,
          name: `${machine.machineCode || "MC"} - ${machine.hostName || "Node"}`,
        }));

        return {
          data: transformedData,
          pagination: {
            currentPage: meta.currentPage || page,
            totalPages: meta.totalPages || 1,
            totalItems: meta.totalItems || items.length,
            hasNextPage:
              meta.currentPage && meta.totalPages
                ? meta.currentPage < meta.totalPages
                : items.length === pageSize,
            pageSize: meta.itemsPerPage || pageSize,
          },
        };
      } catch (err) {
        console.error("Failed to load machines in dropdown:", err);
        return { data: [], pagination: null };
      }
    },
    []
  );

  const handleDispatch = async (e) => {
    e.preventDefault();

    const machineId = selectedMachine?.id || selectedMachine?._id;
    if (!machineId) {
      toast.warning("Please select a machine to process this batch.");
      return;
    }

    if (!batchId) {
      toast.error("Invalid batch selected.");
      return;
    }

    setLoading(true);
    try {
      // priority: true -> 1, false -> 0
      const payload = {
        machineId: machineId,
        priority: isHighPriority ? 1 : 0,
      };

      const res = await dispatchBatch(batchId, payload);
      if (
        res?.status === 200 ||
        res?.status === 201 ||
        res?.data?.success !== false
      ) {
        toast.success(
          res?.data?.message || "Batch dispatched for processing successfully!"
        );
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.data?.message || "Failed to dispatch batch.");
      }
    } catch (err) {
      console.error("Failed to dispatch batch:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to dispatch batch for processing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-3xl p-6 bg-white shadow-2xl border border-slate-100 z-50 overflow-visible">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Process Batch (Dispatch)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Assign this batch to a utility machine worker node for execution.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleDispatch} className="space-y-5 pt-3">
          {/* Batch Summary Pill */}
          {batch && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Layers size={14} className="text-primary shrink-0" />
                <span className="font-bold text-slate-800">
                  Batch #{batch.batchNumber || batch.id?.slice(0, 8)}
                </span>
                {batch.client?.name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 truncate flex items-center gap-1">
                      <Building2 size={12} className="text-slate-400" />
                      {batch.client.name}
                    </span>
                  </>
                )}
              </div>
              <div className="shrink-0 font-semibold text-slate-500">
                {batch.totalData ? `${batch.totalData} records` : ""}
              </div>
            </div>
          )}

          {/* Machine Selection with Infinite Scroll & Search */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Select Machine <span className="text-rose-500">*</span>
            </label>
            <SingleSelectInfiniteDropdown
              placeholder="Search & select a worker machine..."
              selectedValue={selectedMachine}
              onSelectionChange={(machine) => setSelectedMachine(machine)}
              fetchOptions={fetchMachinesForDropdown}
              startIcon={<Server size={15} className="text-slate-400" />}
              getOptionLabel={(m) =>
                `${m.machineCode || "MC"} — ${m.hostName || "Node"}`
              }
              getOptionDescription={(m) =>
                `IP: ${m.ipAddress || "—"} • Modules: ${(
                  m.enabledModules || []
                ).join(", ") || "All"} • ${
                  m.isOnline ? "🟢 Online" : "⚪ Offline"
                }`
              }
              className="w-full"
            />
            {selectedMachine && (
              <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-500">
                <span>
                  Hardware ID:{" "}
                  <code className="text-slate-700 font-mono">
                    {selectedMachine.hardwareId?.slice(0, 16)}...
                  </code>
                </span>
                <span
                  className={
                    selectedMachine.isOnline
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {selectedMachine.isOnline ? "Node Online" : "Node Offline"}
                </span>
              </div>
            )}
          </div>

          {/* Priority Toggle Selection (True / False -> 1 / 0) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Execution Priority
              </label>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                priority: {isHighPriority ? "1 (true)" : "0 (false)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option: False / 0 (Normal Priority) */}
              <button
                type="button"
                onClick={() => setIsHighPriority(false)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !isHighPriority
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    Normal Priority
                  </span>
                  {!isHighPriority && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Value: <code className="font-semibold font-mono">0 (false)</code>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Processed in normal sequential queue.
                </p>
              </button>

              {/* Option: True / 1 (High Priority) */}
              <button
                type="button"
                onClick={() => setIsHighPriority(true)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isHighPriority
                    ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Zap size={13} className="text-amber-600 fill-amber-500" />
                    <span>High Priority</span>
                  </span>
                  {isHighPriority && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700">
                  Value: <code className="font-semibold font-mono">1 (true)</code>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pushed to the top of worker queue.
                </p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold h-10 px-4 cursor-pointer"
            >
              Cancel
            </CustomButton>

            <CustomButton
              type="submit"
              disabled={loading || !selectedMachine}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold h-10 px-5 gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Dispatch & Process</span>
                </>
              )}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessBatchModal;
