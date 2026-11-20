import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { UserCheck, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import SearchableSelect from "@/components/common/DropdownSelect/SearchableSelect";
import { assignBatch } from "@/Services/batchServices";
import { getUsersList } from "@/Services/userServices";

const AssignBatchModal = ({
  isOpen = false,
  onClose,
  batch = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const batchId = batch?.id || batch?._id;

  // Fetch active users when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setUsersLoading(true);
      getUsersList("limit=100&isActive=active")
        .then((res) => {
          if (isMounted) {
            const list =
              res?.data?.data?.items ||
              res?.data?.data?.users ||
              res?.data?.data ||
              [];
            setUsers(Array.isArray(list) ? list : []);
            // Set current assignee if exists
            const currentAssigneeId =
              batch?.assignedToUserId ||
              batch?.assignedTo?.id ||
              batch?.assignedTo?._id ||
              "";
            setSelectedUserId(currentAssigneeId || "");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch users for assignment:", err);
          toast.error("Failed to load users list");
        })
        .finally(() => {
          if (isMounted) setUsersLoading(false);
        });
    } else {
      setSelectedUserId("");
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, batch]);

  // Transform users into SearchableSelect options
  const userOptions = useMemo(() => {
    return users.map((u) => {
      const uId = u.id || u._id;
      const roleName =
        u.role?.displayName ||
        u.role?.name ||
        u.roleName ||
        (u.isSuperAdmin ? "Super Admin" : "Employee");
      return {
        label: `${u.name || "User"} (${roleName})`,
        value: uId,
        description: u.email || "",
      };
    });
  }, [users]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.warning("Please select a user to assign this batch.");
      return;
    }

    setLoading(true);
    try {
      const payload = { userId: selectedUserId };
      const res = await assignBatch(batchId, payload);
      if (res?.status === 200 || res?.status === 201 || res?.data?.success) {
        toast.success(
          res?.data?.message || "Batch has been assigned successfully!"
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(res?.data?.message || "Failed to assign batch.");
      }
    } catch (err) {
      console.error("Assign Batch Error:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to assign batch. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedUserObj = users.find(
    (u) => (u.id || u._id) === selectedUserId
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-2xl p-6 bg-white overflow-visible shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <UserCheck size={18} />
              </span>
              <span>Assign Batch</span>
            </DialogTitle>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              Batch #{batch?.batchNumber || batchId?.slice(0, 8)}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Assign this batch to an employee for scraping and refund verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4 pt-3">
          {/* Batch Context Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Client
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {batch?.client?.name || batch?.clientName || "—"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Refund Type
              </span>
              <span className="font-semibold text-slate-800 uppercase block">
                {batch?.refundType || "—"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Total Records
              </span>
              <span className="font-semibold text-slate-800">
                {batch?.totalData ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Current Assignee
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {batch?.assignedTo?.name ||
                  batch?.assignedToUserId ||
                  "Unassigned"}
              </span>
            </div>
          </div>

          {/* User Selection using SearchableSelect */}
          <div>
            <SearchableSelect
              label="Select Assignee"
              required
              placeholder={
                usersLoading
                  ? "Loading employees..."
                  : "Search & Select Employee"
              }
              options={userOptions}
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
              disabled={usersLoading}
            />
          </div>

          {/* Selected user preview card */}
          {selectedUserObj && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {selectedUserObj.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-xs truncate flex-1">
                <span className="font-bold text-slate-900 block truncate">
                  {selectedUserObj.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {selectedUserObj.email} •{" "}
                  {selectedUserObj.role?.displayName ||
                    selectedUserObj.role?.name ||
                    "Employee"}
                </span>
              </div>
            </div>
          )}

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
              disabled={loading || !selectedUserId}
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-5 rounded-xl cursor-pointer"
            >
              Assign Batch
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBatchModal;
