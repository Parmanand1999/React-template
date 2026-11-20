import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, CheckCircle2, AlertCircle, Mail, KeyRound, User } from "lucide-react";
import { toast } from "react-toastify";
import CustomButton from "@/components/common/Buttons/CustomButton";

const ResetPasswordModal = ({ isOpen, onClose, data }) => {
  console.log(data, ">>>>>>>>>>>>>>>>>>>>>");

  const handleCopy = async (text, label) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied successfully`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <KeyRound size={22} />
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Password Reset Successfully
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Share these login credentials with the user.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <InfoRow
            icon={User}
            label="Username"
            value={data?.username}
            onCopy={() => handleCopy(data?.username, "Username")}
          />

          <InfoRow
            icon={KeyRound}
            label="Temporary Password"
            value={data?.temporaryPassword}
            isPassword
            onCopy={() =>
              handleCopy(data?.temporaryPassword, "Temporary password")
            }
          />

          {/* <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              data?.emailSent
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-orange-200 bg-orange-50 text-orange-700"
            }`}
          >
            {data?.emailSent ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}

            <Mail size={16} />

            <span className="font-medium">
              {data?.emailSent
                ? "Credentials email sent successfully"
                : "Email was not sent. Please copy and share manually."}
            </span>
          </div> */}
        </div>

        <DialogFooter>
          <CustomButton variant="outline" onClick={onClose}>
            Close
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ icon: Icon, label, value, onCopy, isPassword }) => {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon size={14} />
        {label}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-sm font-semibold text-slate-900">
          {value || "-"}
        </p>

        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="h-8 px-2"
          disabled={!value}
        >
          <Copy size={14} className="mr-1" />
          Copy
        </CustomButton>
      </div>
    </div>
  );
};

export default ResetPasswordModal;