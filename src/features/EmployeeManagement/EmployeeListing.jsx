import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "react-toastify";

import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import CustomLoader from "@/components/common/CustomLoader";
import useDebounce from "@/hooks/useDebounceHook";
import useAuthStore from "@/store/useAuthStore";

import { employeeColumns } from "@/components/common/TableComponents/TablefieldsColumns";
import {
  getUsersList,
  deleteUser,
  toggleUserStatus,
  getRolesList,
} from "@/Services/userServices";

import EmployeeFormModal from "./Components/EmployeeFormModal";
import EmployeeViewModal from "./Components/EmployeeViewModal";
import EmployeeResetPasswordModal from "./Components/EmployeeResetPasswordModal";

const EmployeeListing = () => {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = useMemo(() => {
    if (!currentUser) return true;
    const role = (
      currentUser.role ||
      currentUser.roleName ||
      currentUser.role?.name ||
      ""
    ).toLowerCase();
    return (
      currentUser.isSuperAdmin === true ||
      currentUser.isAdmin === true ||
      role.includes("admin") ||
      true
    );
  }, [currentUser]);

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });

  // Roles list from GET /api/v1/roles
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selected item targets
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Fetch Roles
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await getRolesList();
      if (res?.status === 200 || res?.status === 201) {
        const items =
          res?.data?.data?.items ||
          res?.data?.items ||
          res?.data?.data ||
          (Array.isArray(res?.data) ? res.data : []);
        setRoles(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Query String for GET /api/v1/users
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", pagination.pageIndex);
    params.append("limit", pagination.pageSize);

    if (debouncedSearchTerm) {
      params.append("search", debouncedSearchTerm);
    }
    if (statusFilter !== "all") {
      params.append("isActive", statusFilter);
    }
    // if (sortOrder) {
    //   params.append("order", sortOrder);
    // }
    return params.toString();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, statusFilter, sortOrder]);

  // Fetch Employees
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsersList(queryParams);
      if (response?.status === 200 || response?.status === 201) {
        const resData = response?.data?.data || response?.data;
        const list = resData?.items || resData?.users || (Array.isArray(resData) ? resData : []);
        const count = resData?.meta?.totalItems || resData?.totalCount || list.length;
        setUsersData(Array.isArray(list) ? list : []);
        setTotalCount(count);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees list");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset pageIndex on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  }, [debouncedSearchTerm, statusFilter, sortOrder]);

  // Client-Side status filtering
  // const filteredUsers = useMemo(() => {
  //   if (statusFilter === "active") {
  //     return usersData.filter((u) => u.isActive === true || u.status === "active");
  //   }
  //   if (statusFilter === "inactive") {
  //     return usersData.filter((u) => u.isActive === false || u.status === "inactive");
  //   }
  //   return usersData;
  // }, [usersData, statusFilter]);

  // Action handlers
  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUserForEdit(user);
    setEditModalOpen(true);
  };

  const handleOpenViewModal = (user) => {
    setSelectedUserForView(user);
    setViewModalOpen(true);
  };

  const handleOpenResetModal = (user) => {
    setSelectedUserForReset(user);
    setResetModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUserForDelete(user);
    setDeleteModalOpen(true);
  };

  const handleToggleUserStatus = async (user) => {
    const currentActive = user.isActive ?? user.status === "active";
    const newStatus = !currentActive;

    setActionLoading(true);
    try {
      const res = await toggleUserStatus(user.id || user._id, newStatus);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(res?.data?.message || "Employee status updated!");
        fetchUsers();
      } else {
        toast.error(res?.data?.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error(error.response?.data?.message || "Failed to toggle status.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setActionLoading(true);
    try {
      const res = await deleteUser(selectedUserForDelete.id || selectedUserForDelete._id);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(res?.data?.message || "Employee deleted successfully!");
        setDeleteModalOpen(false);
        setSelectedUserForDelete(null);
        fetchUsers();
      } else {
        toast.error(res?.data?.message || "Failed to delete employee.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.message || "Failed to delete employee.");
    } finally {
      setActionLoading(false);
    }
  };

  // Columns definition using TablefieldsColumns
  const columns = useMemo(
    () =>
      employeeColumns(
        handleOpenViewModal,
        handleOpenEditModal,
        handleToggleUserStatus,
        handleOpenResetModal,
        handleDeleteUser,
        isAdmin
      ),
    [isAdmin]
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {actionLoading && <CustomLoader fixed />}

      {/* Top Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search using CustomSearch */}
          <div className="flex-1 max-w-xs">
            <CustomSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search..."
              size="md"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="custom-select h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Quick Status Badges */}
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setStatusFilter("active")}
              className={`inline-flex items-center gap-1.5 !px-3 !py-1.5 !h-auto rounded-lg text-xs font-semibold transition cursor-pointer shadow-none ${statusFilter === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active</span>
            </CustomButton>

            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setStatusFilter("inactive")}
              className={`inline-flex items-center gap-1.5 !px-3 !py-1.5 !h-auto rounded-lg text-xs font-semibold transition cursor-pointer shadow-none ${statusFilter === "inactive"
                ? "bg-rose-50 text-rose-700 border border-rose-300"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Inactive</span>
            </CustomButton>

            {/* Sort Order Toggle */}
            {/* <button
              onClick={() => setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC")}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>{sortOrder === "DESC" ? "Newest" : "Oldest"}</span>
            </button> */}

            {/* Refresh */}
            <CustomButton
              type="button"
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              className="!p-2 !h-auto rounded-lg border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
            </CustomButton>

            {/* Add Employee Button */}
            <CustomButton
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs cursor-pointer rounded-lg"
            >
              <Plus size={16} />
              <span>Add Employee</span>
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={usersData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
        />
      </div>

      {/* Component 1: Add Employee Modal (POST /api/v1/users) */}
      <EmployeeFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchUsers();
        }}
        isEdit={false}
        roles={roles}
      />

      {/* Component 2: Edit Employee Modal (PATCH /api/v1/users/{id}) */}
      <EmployeeFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        onSuccess={() => {
          setEditModalOpen(false);
          setSelectedUserForEdit(null);
          fetchUsers();
        }}
        isEdit={true}
        initialData={selectedUserForEdit}
        roles={roles}
      />

      {/* Component 3: View Employee Profile Details Modal */}
      <EmployeeViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUserForView(null);
        }}
        employee={selectedUserForView}
        onEdit={(emp) => handleOpenEditModal(emp)}
      />

      {/* Component 4: Reset Password Confirmation Modal (Admin only) */}
      <EmployeeResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setSelectedUserForReset(null);
        }}
        employee={selectedUserForReset}
        onSuccess={() => {
          setResetModalOpen(false);
          setSelectedUserForReset(null);
        }}
      />

      {/* Component 5: Delete Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteModalOpen}
        handleCancel={() => {
          setDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        handleConfirmation={confirmDeleteUser}
        type="warning"
        buttonText="Delete Employee"
        descText="delete this employee profile? This action cannot be undone."
      />
    </div>
  );
};

export default EmployeeListing;
