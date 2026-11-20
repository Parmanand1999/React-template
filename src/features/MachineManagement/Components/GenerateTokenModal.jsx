import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Key,
  Clock,
  Tag,
  Loader2,
  Copy,
  Check,
  CheckCircle,
  Calendar,
  ShieldAlert,
  Hash,
} from "lucide-react";
import { toast } from "react-toastify";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { createRegistrationToken } from "@/Services/machineServices";
import { TOKEN_EXPIRY_PRESETS } from "@/constants/machineConstants";
import { formatDate } from "@/utils/formatDate";

const GenerateTokenModal = ({ isOpen, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [createdTokenData, setCreatedTokenData] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "",
      expiresInHours: 24,
    },
    mode: "onTouched",
  });

  const selectedExpiresIn = watch("expiresInHours");

  const handleClose = () => {
    reset();
    setCreatedTokenData(null);
    setCopiedToken(false);
    onClose?.();
  };

  const handleCopy = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    toast.success("Registration token copied to clipboard!");
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const onSubmit = async (values) => {
    if (!values.label?.trim()) {
      toast.error("Machine code is required.");
      return;
    }

    const payload = {
      label: values.label.trim(),
      expiresInHours: Number(values.expiresInHours) || 24,
    };

    try {
      setSubmitting(true);
      const res = await createRegistrationToken(payload);
      if (res?.data?.success) {
        toast.success(res.data.message || "Registration token issued successfully!");
        setCreatedTokenData(res.data.data);
        onSuccess?.();
      } else {
        toast.error(res?.data?.message || "Failed to generate token.");
      }
    } catch (err) {
      console.error("Token generation failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "An error occurred while generating registration token.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-3xl p-6 bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl ${createdTokenData
                ? "bg-emerald-50 text-emerald-600"
                : "bg-indigo-50 text-indigo-600"
                }`}
            >
              {createdTokenData ? <CheckCircle size={20} /> : <Key size={20} />}
            </span>
            <span>
              {createdTokenData
                ? "Registration Token Issued Successfully"
                : "Generate Registration Token"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {createdTokenData
              ? "Use the issued token below to configure and connect your utility worker machine."
              : "Create an authorization token to register and connect a new worker utility node."}
          </DialogDescription>
        </DialogHeader>

        {!createdTokenData ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
            {/* Token Label */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Machine Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. machineTest or DEL-WORKER-01"
                  {...register("label", {
                    required: "Machine code is required",
                    minLength: {
                      value: 2,
                      message: "Machine code must be at least 2 characters",
                    },
                  })}
                  className={`w-full h-9 px-3 pl-9 rounded-lg border text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.label
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200 bg-white"
                    }`}
                />
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.label && (
                <p className="text-xs text-rose-500 mt-1">{errors.label.message}</p>
              )}
            </div>

            {/* Expiry Hours Preset Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>
                  Expiration Time (Hours) <span className="text-rose-500">*</span>
                </span>
                <span className="text-primary font-bold text-xs">
                  {selectedExpiresIn} Hours
                </span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {TOKEN_EXPIRY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setValue("expiresInHours", preset.value)}
                    className={`p-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${Number(selectedExpiresIn) === preset.value
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    {preset.value}h
                  </button>
                ))}
              </div>

              <div className="mt-2.5 relative">
                <input
                  type="number"
                  min="1"
                  max="720"
                  placeholder="Or enter custom hours..."
                  {...register("expiresInHours", {
                    required: "Expiry hours is required",
                    min: { value: 1, message: "Minimum 1 hour" },
                    max: { value: 24, message: "Maximum 24 hours (1 day)" },
                  })}
                  className="w-full h-8 px-3 pl-8 text-xs font-medium border border-slate-200 rounded-lg text-slate-800 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <Clock
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.expiresInHours && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.expiresInHours.message}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </CustomButton>

              <CustomButton
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white min-w-[140px] gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Key size={15} />
                    <span>Generate Token</span>
                  </>
                )}
              </CustomButton>
            </div>
          </form>
        ) : (
          /* Popup Displaying Issued Token Information */
          <div className="space-y-4 pt-3">
            {/* Primary Token Copy Box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={14} className="text-emerald-700" />
                  <span>Registration Token</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Ready
                </span>
              </div>

              <div className="flex items-center justify-center bg-white rounded-xl border border-emerald-300 shadow-2xs h-8">
                <span className="font-mono text-xl font-bold text-slate-900 tracking-wider leading-none translate-y-[3px] select-all">
                  ************
                </span>
              </div>


              <div className="pt-1">
                <CustomButton
                  type="button"
                  onClick={() =>
                    handleCopy(
                      createdTokenData.token ||
                      createdTokenData.registrationToken ||
                      createdTokenData.tokenValue
                    )
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs font-semibold gap-2 shadow-emerald-100 shadow-sm cursor-pointer"
                >
                  {copiedToken ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Registration Token</span>
                    </>
                  )}
                </CustomButton>
              </div>
            </div>

            {/* Issued Token Info Grid matching API response */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Machine Code
                </span>
                <span className="font-bold text-slate-800 truncate block">
                  {createdTokenData.label || "—"}
                </span>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Expires At
                </span>
                <span className="font-medium text-rose-600 text-[11px] block">
                  {createdTokenData.expiresAt
                    ? formatDate(createdTokenData.expiresAt, "dd-MM-yyyy HH:mm:ss")
                    : "—"}
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed">
              <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Please copy and save this registration token now. For security purposes, the complete token string will not be shown again.
              </span>
            </div>

            {/* Bottom Done Action */}
            <div className="flex justify-end pt-1">
              <CustomButton
                type="button"
                onClick={handleClose}
                variant="outline"
                className="rounded-xl px-6 text-xs font-semibold cursor-pointer h-9"
              >
                Done
              </CustomButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateTokenModal;
