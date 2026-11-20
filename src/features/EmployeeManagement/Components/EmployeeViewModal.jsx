import React, { useEffect, useState } from "react";
import { User, Edit, Phone, Mail, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import { getUserById } from "@/Services/userServices";
import { StatusBadge } from "@/utils/statusUtils";

const EmployeeViewModal = ({
  isOpen = false,
  onClose,
  employee = null,
  onEdit,
}) => {
  const [detail, setDetail] = useState(employee);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      setDetail(employee);
      const fetchFresh = async () => {
        try {
          setLoading(true);
          const userId = employee.id || employee._id;
          const res = await getUserById(userId);
          if (res?.status === 200 || res?.status === 201) {
            setDetail(res?.data?.data || res?.data || employee);
          }
        } catch (err) {
          console.warn("Could not fetch user by ID, using existing row data:", err);
          setDetail(employee);
        } finally {
          setLoading(false);
        }
      };
      fetchFresh();
    }
  }, [isOpen, employee]);

  if (!detail) return null;

  const isActive = detail.isActive ?? detail.status === "active";
  const roleName =
    detail.role?.displayName ||
    detail.role?.name ||
    detail.roleName ||
    (detail.isSuperAdmin ? "Super Admin" : "Employee");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] flex flex-col rounded-2xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        {loading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1.5px] z-50 flex flex-col items-center justify-center gap-2 rounded-2xl">
            <CustomLoader className="relative" size={14} />
            <span className="text-xs font-semibold text-slate-600 animate-pulse">
              Loading employee profile...
            </span>
          </div>
        )}
        <DialogHeader className="border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <User size={18} />
              </span>
              <span>Employee Profile</span>
            </DialogTitle>
            <StatusBadge status={isActive ? "active" : "inactive"} />
          </div>
        </DialogHeader>

        <div className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1 my-2">
          {/* User Hero Badge */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
              {detail.name ? detail.name.charAt(0).toUpperCase() : "E"}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {detail.name || "N/A"}
              </h3>
              <p className="text-slate-500 truncate">{detail.email || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Assigned Role
              </span>
              <p className="font-semibold text-slate-800">{roleName}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Mobile Number
              </span>
              <p className="font-semibold text-slate-800">
                {detail.mobile || "N/A"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Gender
              </span>
              <p className="font-semibold text-slate-800 capitalize">
                {detail.gender || "N/A"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Refund Type
              </span>
              <p className="font-bold text-blue-600 uppercase">
                {Array.isArray(detail.refundType)
                  ? detail.refundType.join(" + ")
                  : detail.refundType || "N/A"}
              </p>
            </div>

            <div className="space-y-0.5 col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Status
              </span>
              <div>
                <StatusBadge status={isActive ? "active" : "inactive"} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between shrink-0">
          {onEdit ? (
            <CustomButton
              type="button"
              variant="ghost"
              onClick={() => {
                onClose();
                onEdit(detail);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer !p-0 !h-auto shadow-none"
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </CustomButton>
          ) : (
            <div />
          )}

          <CustomButton
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg px-4 cursor-pointer"
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeViewModal;
