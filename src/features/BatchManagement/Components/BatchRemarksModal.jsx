import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MessageSquareText, FileText, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { addBatchRemark } from "@/Services/batchServices";
import { formatDate } from "@/utils/formatDate";

const BatchRemarksModal = ({
  isOpen = false,
  onClose,
  batch = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState("");

  const batchId = batch?.id || batch?._id;

  useEffect(() => {
    if (!isOpen) {
      setRemark("");
    }
  }, [isOpen]);

  if (!batch) return null;

  // Extract existing remarks if available on the batch
  const existingRemarks = Array.isArray(batch.remarks)
    ? batch.remarks
    : typeof batch.remarks === "string" && batch.remarks
    ? [{ remark: batch.remarks, createdAt: batch.updatedAt || batch.createdAt }]
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      toast.warning("Please type a remark to submit.");
      return;
    }

    setLoading(true);
    try {
      const payload = { remark: remark.trim() };
      const res = await addBatchRemark(batchId, payload);
      if (res?.status === 200 || res?.status === 201 || res?.data?.success) {
        toast.success(
          res?.data?.message || "Remark added successfully!"
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.data?.message || "Failed to add remark.");
      }
    } catch (err) {
      console.error("Add Remark Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add remark. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-2xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <MessageSquareText size={18} />
              </span>
              <span>Batch Remarks</span>
            </DialogTitle>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              Batch #{batch.batchNumber || batchId?.slice(0, 8)}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Add internal notes, operational updates, or log remarks for this batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* History of Remarks if available */}
          {existingRemarks.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Existing Remarks
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {existingRemarks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
                  >
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {item.remark || item.comment || JSON.stringify(item)}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(item.createdAt, "dd-MM-yyyy HH:mm")}
                        </span>
                      )}
                      {item.user?.name && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {item.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Remark Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-500" />
              <span>
                New Remark <span className="text-rose-500">*</span>
              </span>
            </label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter your remark or note here..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none"
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end gap-2.5">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs font-semibold px-4 cursor-pointer"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              loading={loading}
              disabled={loading || !remark.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 rounded-xl cursor-pointer"
            >
              Add Remark
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchRemarksModal;
