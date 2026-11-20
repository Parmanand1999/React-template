import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";
import PhoneInputField from "@/components/common/CustomField/PhoneInputField";
import { createUser, updateUser } from "@/Services/userServices";
import { employeeDefaultValues } from "./EmployeeSchema";
import { validateDetailedMobile } from "@/utils/phoneValidation";

const DEFAULT_FALLBACK_ROLE_ID = "6fb9e5a6-425c-4eb5-b07d-db4caf066757";

const EmployeeFormModal = ({
  isOpen = false,
  onClose,
  onSuccess,
  isEdit = false,
  initialData = null,
  roles = [],
}) => {
  const [formData, setFormData] = useState(employeeDefaultValues);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      const userRefund = Array.isArray(initialData.refundType)
        ? initialData.refundType
        : [initialData.refundType || "gds"];

      setFormData({
        name: initialData.name || "",
        roleId:
          initialData.roleId ||
          initialData.role?.id ||
          (roles.length > 0 ? roles[0].id : DEFAULT_FALLBACK_ROLE_ID),
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        gender: initialData.gender || "male",
        refundType: userRefund,
      });
      setFormErrors({});
    } else if (!isEdit && isOpen) {
      setFormData({
        name: "",
        roleId: roles.length > 0 ? roles[0].id : DEFAULT_FALLBACK_ROLE_ID,
        email: "",
        mobile: "",
        gender: "male",
        refundType: ["gds"],
      });
      setFormErrors({});
    }
  }, [isEdit, initialData, isOpen, roles]);

  const toggleRefundType = (type) => {
    setFormData((prev) => {
      const exists = prev.refundType.includes(type);
      if (exists) {
        if (prev.refundType.length === 1) return prev;
        return {
          ...prev,
          refundType: prev.refundType.filter((t) => t !== type),
        };
      }
      return {
        ...prev,
        refundType: [...prev.refundType, type],
      };
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Full name is required";
    if (!formData.roleId) errors.roleId = "Role is required";

    if (!isEdit) {
      if (!formData.email?.trim()) {
        errors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
        errors.email = "Enter a valid email address";
      }
    }

    if (!formData.mobile?.trim()) {
      errors.mobile = "Mobile number is required";
    } else {
      const res = validateDetailedMobile(formData.mobile);
      if (!res.isValid) {
        errors.mobile = res.message;
      }
    }

    if (!formData.refundType || formData.refundType.length === 0) {
      errors.refundType = "Select at least one refund type";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          name: formData.name.trim(),
          roleId: formData.roleId,
          mobile: formData.mobile.trim(),
          gender: formData.gender,
          refundType: formData.refundType,
        };
        const userId = initialData?.id || initialData?._id;
        const res = await updateUser(userId, payload);
        if (res?.status === 200 || res?.status === 201) {
          toast.success(res?.data?.message || "Employee updated successfully!");
          if (onSuccess) onSuccess();
        } else {
          toast.error(res?.data?.message || "Failed to update employee.");
        }
      } else {
        const payload = {
          name: formData.name.trim(),
          roleId: formData.roleId,
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          gender: formData.gender,
          refundType: formData.refundType,
        };
        const res = await createUser(payload);
        if (res?.status === 200 || res?.status === 201) {
          toast.success(res?.data?.message || "Employee created successfully!");
          if (onSuccess) onSuccess();
        } else {
          toast.error(res?.data?.message || "Failed to create employee.");
        }
      }
    } catch (error) {
      console.error("Employee submit error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${isEdit ? "update" : "create"} employee.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span
              className={`p-2 rounded-xl ${
                isEdit
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {isEdit ? <Edit size={18} /> : <Plus size={18} />}
            </span>
            <span>{isEdit ? "Edit Employee Details" : "Add New Employee"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {isEdit
              ? "Update name, assigned role, phone number, gender, or refund permissions."
              : "Fill in basic credentials, role, and permissions to invite a new employee."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-9 text-sm rounded-lg"
            />
            {formErrors.name && (
              <p className="text-rose-500 text-xs mt-0.5">{formErrors.name}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Assign Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: e.target.value })
              }
              className={`custom-select h-9 w-full rounded-lg border bg-white px-3 text-xs font-medium text-slate-800 outline-none transition cursor-pointer ${
                formErrors.roleId
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            >
              {roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.displayName || r.name}
                  </option>
                ))
              ) : (
                <option value={DEFAULT_FALLBACK_ROLE_ID}>Administrator</option>
              )}
            </select>
            {formErrors.roleId && (
              <p className="text-rose-500 text-xs mt-0.5">{formErrors.roleId}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Email Address{" "}
              {isEdit ? (
                <span className="text-slate-400 font-normal">(Read-only)</span>
              ) : (
                <span className="text-rose-500">*</span>
              )}
            </label>
            <Input
              type="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              disabled={isEdit}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`h-9 text-sm rounded-lg ${
                isEdit
                  ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
                  : ""
              }`}
            />
            {formErrors.email && (
              <p className="text-rose-500 text-xs mt-0.5">{formErrors.email}</p>
            )}
          </div>

          {/* Mobile & Gender Row */}
          <div className="grid grid-cols-2 gap-3">
            <PhoneInputField
              label="Mobile Number"
              required
              value={formData.mobile}
              onChange={(val) => setFormData({ ...formData, mobile: val })}
              error={formErrors.mobile}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="custom-select h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Refund Type Badges */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Refund Type Permission <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleRefundType("gds")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  formData.refundType.includes("gds")
                    ? "bg-blue-50 border-blue-400 text-blue-600"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                GDS
              </button>
              <button
                type="button"
                onClick={() => toggleRefundType("lcc")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  formData.refundType.includes("lcc")
                    ? "bg-amber-50 border-amber-400 text-amber-600"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                LCC
              </button>
            </div>
            {formErrors.refundType && (
              <p className="text-rose-500 text-xs mt-0.5">
                {formErrors.refundType}
              </p>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold px-4 cursor-pointer"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              loading={loading}
              disabled={loading}
              className={`text-white font-semibold text-xs px-5 rounded-lg cursor-pointer ${
                isEdit
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isEdit ? "Save Changes" : "Create Employee"}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormModal;
