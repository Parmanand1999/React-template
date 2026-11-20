import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Send, FileText, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { sendBatchToReview } from "@/Services/batchServices";

const SendToReviewModal = ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      toast.warning("Please provide a remark before sending to review.");
      return;
    }

    setLoading(true);
    try {
      const payload = { remark: remark.trim() };
      const res = await sendBatchToReview(batchId, payload);
      if (res?.status === 200 || res?.status === 201 || res?.data?.success) {
        toast.success(
          res?.data?.message || "Batch sent for review successfully!"
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.data?.message || "Failed to send batch to review.");
      }
    } catch (err) {
      console.error("Send to Review Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send batch to review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Send size={18} />
              </span>
              <span>Send Batch to Review</span>
            </DialogTitle>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              Batch #{batch.batchNumber || batchId?.slice(0, 8)}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Submit this batch for supervisor or QA review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Informational banner */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-indigo-900 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Sending this batch to review notifies supervisors to verify the
              scraped tickets and refund calculations.
            </div>
          </div>

          {/* Remark Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-500" />
              <span>
                Review Remark / Notes <span className="text-rose-500">*</span>
              </span>
            </label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter notes, observations, or instructions for the reviewer..."
              required
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-none"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 rounded-xl cursor-pointer"
            >
              Send to Review
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendToReviewModal;
