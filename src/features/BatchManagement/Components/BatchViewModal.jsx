import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  FileSpreadsheet,
  Building2,
  User,
  Calendar,
  DollarSign,
  Database,
  UserCheck,
  Send,
  ClipboardCheck,
  MessageSquareText,
  Trash,
  Cpu,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { getMonthName } from "@/constants/batchConstants";
import { StatusBadge } from "@/utils/statusUtils";
import CustomButton from "@/components/common/Buttons/CustomButton";

import AssignBatchModal from "./AssignBatchModal";
import SendToReviewModal from "./SendToReviewModal";
import ReviewBatchModal from "./ReviewBatchModal";
import BatchRemarksModal from "./BatchRemarksModal";
import ProcessBatchModal from "./ProcessBatchModal";

const BatchViewModal = ({ isOpen, onClose, batch, onUpdate, onDelete }) => {
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [sendReviewOpen, setSendReviewOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [remarksOpen, setRemarksOpen] = React.useState(false);
  const [processOpen, setProcessOpen] = React.useState(false);

  if (!batch) return null;

  const monthName = getMonthName(batch.batchMonth) || "N/A";
  const period = `${monthName} ${batch.batchYear || ""}`.trim();

  const total = Number(batch.totalData) || 0;
  const checked = Number(batch.dataChecked) || 0;
  const refunded = Number(batch.dataRefunded) || 0;
  const rejected = Number(batch.dataRejected) || 0;
  const checkedPercent = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl sm:max-h-[85vh] max-w-[95vw] rounded-3xl p-6 bg-white  shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Layers size={20} />
              </span>
              <span>Batch #{batch.batchNumber || batch.id?.slice(0, 8)}</span>
            </DialogTitle>
            <div>
              <StatusBadge status={batch.status} />
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Uploaded on {formatDate(batch.createdAt, "dd MMM yyyy, hh:mm a")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          <div className="space-y-5 pt-2  pr-1">
            {/* Key Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Client
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm truncate">
                  <Building2 size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">{batch.client?.name || "N/A"}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Refund Type
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={`capitalize text-xs font-semibold px-2 py-0.5 ${batch.refundType?.toLowerCase() === "gds"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      }`}
                  >
                    {batch.refundType?.toUpperCase() || "N/A"}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Period
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                  <Calendar size={14} className="text-indigo-500 shrink-0" />
                  <span>{period}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Provider / Airline
                </span>
                <div className="font-semibold text-slate-800 text-sm capitalize truncate">
                  {batch.serviceProvider || "N/A"}
                  {batch.airline ? ` • ${batch.airline}` : ""}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Assignment
                </span>
                <div className="font-semibold text-slate-800 text-sm capitalize">
                  {batch.assignmentStatus || "Unassigned"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Amount Refunded
                </span>
                <div className="flex items-center gap-1 font-bold text-emerald-600 text-sm">
                  <DollarSign size={14} />
                  <span>{batch.amountRefunded || "0.00"}</span>
                </div>
              </div>
            </div>

            {/* Progress / Stats Breakdown */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Database size={14} className="text-slate-500" />
                  Records Progress
                </span>
                <span className="text-slate-500">{checkedPercent}% Checked</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${checkedPercent}%` }}
                  className="bg-indigo-600 rounded-full transition-all duration-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {total}
                  </span>
                </div>
                <div className="p-2 bg-blue-50/60 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">
                    Checked
                  </span>
                  <span className="text-base font-bold text-blue-700">
                    {checked}
                  </span>
                </div>
                <div className="p-2 bg-emerald-50/60 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                    Refunded
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {refunded}
                  </span>
                </div>
                <div className="p-2 bg-rose-50/60 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">
                    Rejected
                  </span>
                  <span className="text-base font-bold text-rose-700">
                    {rejected}
                  </span>
                </div>
              </div>
            </div>

            {/* Original File & Uploader Details */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  Original File:
                </span>
                <span className="font-semibold text-slate-800 break-all">
                  {batch.originalFileName || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  Uploaded By:
                </span>
                <span className="font-medium text-slate-700">
                  {batch.uploadedBy?.name || "Super Admin"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls & Close */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setProcessOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-1.5"
              >
                <Cpu size={13} />
                <span>Process</span>
              </CustomButton>

              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck size={13} />
                <span>Assign</span>
              </CustomButton>

              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setSendReviewOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Send to Review</span>
              </CustomButton>

              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setReviewOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
              >
                <ClipboardCheck size={13} />
                <span>Review</span>
              </CustomButton>

              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setRemarksOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 h-8 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquareText size={13} />
                <span>Remarks</span>
              </CustomButton>

              {onDelete && (
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onDelete(batch);
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
        </div>


        {/* Sub-modals */}
        <AssignBatchModal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          batch={batch}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />

        <SendToReviewModal
          isOpen={sendReviewOpen}
          onClose={() => setSendReviewOpen(false)}
          batch={batch}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />

        <ReviewBatchModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          batch={batch}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />

        <BatchRemarksModal
          isOpen={remarksOpen}
          onClose={() => setRemarksOpen(false)}
          batch={batch}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />

        <ProcessBatchModal
          isOpen={processOpen}
          onClose={() => setProcessOpen(false)}
          batch={batch}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BatchViewModal;
