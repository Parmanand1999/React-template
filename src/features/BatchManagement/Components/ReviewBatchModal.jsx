import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, RotateCcw, ClipboardCheck, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { reviewBatch } from "@/Services/batchServices";

const DECISION_OPTIONS = [
  {
    value: "reviewed",
    title: "Approve / Reviewed",
    description: "Accept and finalize batch verification.",
    icon: CheckCircle2,
    activeColor:
      "border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20",
    iconColor: "text-emerald-600",
  },
  {
    value: "reopen",
    title: "Reopen Batch",
    description: "Reopen for further corrections or scraping.",
    icon: RotateCcw,
    activeColor:
      "border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20",
    iconColor: "text-amber-600",
  },
];

const ReviewBatchModal = ({
  isOpen = false,
  onClose,
  batch = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("reviewed");
  const [remark, setRemark] = useState("");

  const batchId = batch?.id || batch?._id;

  useEffect(() => {
    if (!isOpen) {
      setDecision("reviewed");
      setRemark("");
    }
  }, [isOpen]);

  if (!batch) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decision) {
      toast.warning("Please choose a review decision.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        decision,
        remark: remark.trim(),
      };
      const res = await reviewBatch(batchId, payload);
      if (res?.status === 200 || res?.status === 201 || res?.data?.success) {
        toast.success(
          res?.data?.message ||
            `Batch decision '${decision}' submitted successfully!`
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.data?.message || "Failed to submit batch review.");
      }
    } catch (err) {
      console.error("Review Batch Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit batch review. Please try again."
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
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <ClipboardCheck size={18} />
              </span>
              <span>Review Batch</span>
            </DialogTitle>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              Batch #{batch.batchNumber || batchId?.slice(0, 8)}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Submit supervisor decision to mark as reviewed or reopen for reprocessing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Decision Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Review Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DECISION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = decision === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecision(opt.value)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? opt.activeColor
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={18} className={opt.iconColor} />
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-slate-800 bg-slate-800"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-xs">{opt.title}</span>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remark Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-500" />
              <span>
                Reviewer Remark / Reason{" "}
                {decision === "reopen" ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(Optional)</span>
                )}
              </span>
            </label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={
                decision === "reopen"
                  ? "Specify why this batch is being reopened and what needs correction..."
                  : "Add any approval notes, feedback, or verification remarks..."
              }
              required={decision === "reopen"}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
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
              disabled={loading || (decision === "reopen" && !remark.trim())}
              className={`text-white font-semibold text-xs px-5 rounded-xl cursor-pointer ${
                decision === "reopen"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {decision === "reopen" ? "Reopen Batch" : "Mark as Reviewed"}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewBatchModal;
