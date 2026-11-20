import React, { useState } from "react";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { resetUserPassword } from "@/Services/userServices";

const EmployeeResetPasswordModal = ({
  isOpen = false,
  onClose,
  employee = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!employee) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const userId = employee.id || employee._id;
      const res = await resetUserPassword(userId);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(
          res?.data?.message ||
            "Password reset instructions processed successfully!"
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password. Only admins can perform this action."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Lock size={18} />
            </span>
            <span>Reset Employee Password</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Admin action to initiate password reset for this employee.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to reset the password for{" "}
            <strong className="text-slate-900 font-semibold">
              {employee.name || "this employee"}
            </strong>{" "}
            ({employee.email || "N/A"})?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
            <strong>Admin Privilege Notice:</strong> This action will send
            password reset instructions to the employee's registered email
            address.
          </div>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-3 flex justify-end gap-3">
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
            type="button"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 rounded-lg cursor-pointer"
          >
            Reset Password
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeResetPasswordModal;
