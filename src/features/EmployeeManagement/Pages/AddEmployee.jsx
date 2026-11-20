import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Sparkles, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import PhoneInputField from "@/components/common/CustomField/PhoneInputField";
import { createUser, getRolesList } from "@/Services/userServices";
import { employeeDefaultValues } from "../Components/EmployeeSchema";
import { validateDetailedMobile } from "@/utils/phoneValidation";

const DEFAULT_FALLBACK_ROLE_ID = "6fb9e5a6-425c-4eb5-b07d-db4caf066757";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(employeeDefaultValues);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRolesList();
        if (res?.status === 200 || res?.status === 201) {
          const items =
            res?.data?.data?.items ||
            res?.data?.items ||
            res?.data?.data ||
            (Array.isArray(res?.data) ? res.data : []);
          setRoles(Array.isArray(items) ? items : []);
          if (items.length > 0) {
            setFormData((prev) => ({ ...prev, roleId: items[0].id }));
          }
        }
      } catch (err) {
        console.error("Error fetching roles in AddEmployee page:", err);
      }
    };
    fetchRoles();
  }, []);

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
    if (!formData.email?.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
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
        navigate("/employees");
      } else {
        toast.error(res?.data?.message || "Failed to create employee.");
      }
    } catch (error) {
      console.error("Employee create error:", error);
      toast.error(error?.response?.data?.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12 font-sans">
      {loading && <CustomLoader fixed />}

      <header className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 p-6 text-white shadow-md">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-blue-200" />
            Employee Management
          </p>
          <h2 className="text-2xl font-semibold">Create New Employee</h2>
          <p className="text-sm text-blue-100">
            Configure employee credentials, select role permissions, and assign refund types.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Parmanand Maurya"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-9 text-sm rounded-lg"
          />
          {formErrors.name && (
            <p className="text-rose-500 text-xs mt-0.5">{formErrors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Assign Role <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
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

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="e.g. employee@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-9 text-sm rounded-lg"
          />
          {formErrors.email && (
            <p className="text-rose-500 text-xs mt-0.5">{formErrors.email}</p>
          )}
        </div>

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
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="custom-select h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Refund Type Permission <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleRefundType("gds")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${formData.refundType.includes("gds")
                ? "bg-blue-50 border-blue-400 text-blue-600"
                : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
            >
              GDS
            </button>
            <button
              type="button"
              onClick={() => toggleRefundType("lcc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${formData.refundType.includes("lcc")
                ? "bg-amber-50 border-amber-400 text-amber-600"
                : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
            >
              LCC
            </button>
          </div>
          {formErrors.refundType && (
            <p className="text-rose-500 text-xs mt-0.5">{formErrors.refundType}</p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => navigate("/employees")}
            className="text-xs font-semibold px-4 cursor-pointer"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            loading={loading}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 rounded-lg cursor-pointer"
          >
            Create Employee
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
