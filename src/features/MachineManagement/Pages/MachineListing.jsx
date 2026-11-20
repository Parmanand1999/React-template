import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Server,
  Plus,
  RefreshCw,
  Search,
  Key,
  HardDrive,
  Cpu,
  CheckCircle,
  XCircle,
  ActivitySquare,
  Globe,
  RotateCcw,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import useDebounce from "@/hooks/useDebounceHook";
import { machineColumns } from "@/components/common/TableComponents/TablefieldsColumns";

import {
  getMachinesList,
  updateMachineStatus,
  deleteMachine,
} from "@/Services/machineServices";

import MachineViewModal from "../Components/MachineViewModal";
import GenerateTokenModal from "../Components/GenerateTokenModal";
import { useSocketEvent } from "@/hooks/useSocket";
import SocketStatusBadge from "@/components/common/SocketStatusBadge";

import {
  MACHINE_STATUS_OPTIONS,
} from "@/constants/machineConstants";


const MachineListing = () => {
  const navigate = useNavigate();

  // Query Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
  });

  // Data & Loading state
  const [machinesData, setMachinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [generateTokenModalOpen, setGenerateTokenModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [deletingMachine, setDeletingMachine] = useState(false);

  // Status Toggle Confirmation Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [machineToToggle, setMachineToToggle] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Debounced search query
  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Compile query string for GET /api/v1/machines
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

    return params.toString();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, statusFilter]);

  // Track in-flight queries
  const isInitialMount = useRef(true);
  const inFlightRef = useRef(false);
  const prevQueryRef = useRef("");

  // Fetch Machines List
  const fetchMachines = useCallback(async () => {
    if (inFlightRef.current && prevQueryRef.current === queryParams) return;

    try {
      inFlightRef.current = true;
      prevQueryRef.current = queryParams;
      setLoading(true);

      const res = await getMachinesList(queryParams);
      if (res?.data?.success) {
        const { items, meta } = res.data.data;
        setMachinesData(items || []);
        setTotalCount(meta?.totalItems || 0);
      } else {
        setMachinesData([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch machines:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load utility machines."
      );
      setMachinesData([]);
      setTotalCount(0);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Reset pageIndex on filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPagination((prev) => {
      if (prev.pageIndex === 1) return prev;
      return { ...prev, pageIndex: 1 };
    });
  }, [debouncedSearchTerm, statusFilter]);

  // Real-Time Socket Updates: update machine status dynamically
  useSocketEvent("heartbeat", (updatedData) => {
    console.log("updatedData", updatedData);

    if (!updatedData) return;

    const updatedMachine = updatedData?.machine || updatedData;
    const targetId = updatedMachine.id || updatedMachine._id;
    const targetCode = updatedMachine.machineCode;
    const targetHwId = updatedMachine.hardwareId;

    if (!targetId && !targetCode && !targetHwId) return;

    setMachinesData((prevList) => {
      let matched = false;
      const nextList = prevList.map((item) => {
        const isMatch =
          (targetId && (item.id === targetId || item._id === targetId)) ||
          (targetCode && item.machineCode === targetCode) ||
          (targetHwId && item.hardwareId === targetHwId);

        if (isMatch) {
          matched = true;
          return {
            ...item,
            ...updatedMachine,
            isOnline:
              updatedMachine.isOnline !== undefined
                ? Boolean(updatedMachine.isOnline)
                : item.isOnline,
            reportedState:
              updatedMachine.reportedState || item.reportedState,
            lastSeenAt: updatedMachine.lastSeenAt || item.lastSeenAt,
            isActive: updatedMachine.isActive || item.isActive,
          };
        }
        return item;
      });

      // Also sync selectedMachine if view modal is currently open
      setSelectedMachine((curr) => {
        if (!curr) return curr;
        const isSelectedMatch =
          (targetId && (curr.id === targetId || curr._id === targetId)) ||
          (targetCode && curr.machineCode === targetCode);
        return isSelectedMatch ? { ...curr, ...updatedMachine } : curr;
      });

      // If the machine wasn't in the current page list, refresh list
      if (!matched) {
        fetchMachines();
        return prevList;
      }

      return nextList;
    });
  });

  // Handlers for Modals & Actions
  const handleView = useCallback((machine) => {
    setSelectedMachine(machine);
    setViewModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((machine) => {
    setMachineToDelete(machine);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!machineToDelete) return;
    const id = machineToDelete.id || machineToDelete._id;
    if (!id) return;

    try {
      setDeletingMachine(true);
      const res = await deleteMachine(id);
      if (res?.data?.success) {
        toast.success(res.data.message || "Machine deleted successfully!");
        setDeleteModalOpen(false);
        setMachineToDelete(null);
        fetchMachines();
      } else {
        toast.error(res?.data?.message || "Failed to delete machine.");
      }
    } catch (err) {
      console.error("Failed to delete machine:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete machine."
      );
    } finally {
      setDeletingMachine(false);
    }
  };

  const handleOpenToggleStatus = useCallback((machine) => {
    setMachineToToggle(machine);
    setStatusModalOpen(true);
  }, []);

  const handleConfirmToggleStatus = async () => {
    if (!machineToToggle) return;
    const id = machineToToggle.id || machineToToggle._id;
    if (!id) return;

    const newStatus =
      machineToToggle.isActive === "active" ? "inactive" : "active";

    try {
      setTogglingStatus(true);
      const res = await updateMachineStatus(id, newStatus);
      if (res?.data?.success) {
        toast.success(
          res.data.message || `Machine marked as ${newStatus} successfully!`
        );
        setStatusModalOpen(false);
        setMachineToToggle(null);
        fetchMachines();
      } else {
        toast.error(res?.data?.message || "Failed to update machine status.");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update machine status."
      );
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all";

  // Compute stat metrics
  const stats = useMemo(() => {
    const total = totalCount || machinesData.length;
    const online = machinesData.filter((m) => m.isOnline).length;
    const active = machinesData.filter((m) => m.isActive === "active").length;
    const offline = total - online;

    return { total, online, offline: Math.max(0, offline), active };
  }, [totalCount, machinesData]);

  // Column definitions
  const columns = useMemo(
    () =>
      machineColumns(
        handleView,
        handleOpenToggleStatus,
        handleOpenDelete
      ),
    [
      handleView,
      handleOpenToggleStatus,
      handleOpenDelete,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Server className="text-primary w-6 h-6" />
            <span>Manage Utility Machines</span>
            <SocketStatusBadge liveLabel="Live" connectingLabel="Connecting" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor registered scraper worker nodes, connectivity heartbeats, enabled modules, and hardware fingerprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={fetchMachines}
            disabled={loading}
            className="!p-2.5 !h-auto rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Refresh machines list"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : ""}
            />
          </CustomButton>

          <CustomButton
            type="button"
            variant="outline"
            onClick={() => navigate("/machines/registration-tokens")}
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs gap-2 cursor-pointer font-semibold"
            title="View Registration Tokens"
          >
            <Key size={16} className="text-indigo-600" />
            <span>View Reg. Tokens</span>
          </CustomButton>

          <CustomButton
            type="button"
            onClick={() => setGenerateTokenModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs gap-2 cursor-pointer font-semibold"
          >
            <Plus size={16} />
            <span>Generate Token</span>
          </CustomButton>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Server size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Machines
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Online Workers
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {stats.online}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Cpu size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Offline Nodes
            </p>
            <p className="text-xl font-bold text-slate-700 mt-0.5">
              {stats.offline}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ActivitySquare size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Status
            </p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">
              {stats.active}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <CustomSearch
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hostname, machine code, IP address, hardware ID..."
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              {MACHINE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filters applied to machine list</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <DataTable
          columns={columns}
          data={machinesData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
          stickyActionColumn={true}
        />
      </div>

      {/* Generate Token Modal */}
      <GenerateTokenModal
        isOpen={generateTokenModalOpen}
        onClose={() => setGenerateTokenModalOpen(false)}
        onSuccess={fetchMachines}
      />

      {/* View Machine Details Modal */}
      <MachineViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedMachine(null);
        }}
        machine={selectedMachine}
        onToggleStatus={(machine) => {
          handleOpenToggleStatus(machine);
        }}
        onDelete={(machine) => {
          handleOpenDelete(machine);
        }}
      />

      {/* Delete Machine Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteModalOpen}
        handleCancel={() => {
          if (!deletingMachine) {
            setDeleteModalOpen(false);
            setMachineToDelete(null);
          }
        }}
        handleConfirmation={handleConfirmDelete}
        loading={deletingMachine}
        type="error"
        buttonText="Yes, Delete Machine"
        descText="delete this utility machine"
        fullDescTex={
          machineToDelete
            ? `Are you sure you want to delete Machine #${machineToDelete.machineCode || machineToDelete.id} (${machineToDelete.hostName})? This action will permanently remove the worker node.`
            : "Are you sure you want to delete this machine?"
        }
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={statusModalOpen}
        handleCancel={() => {
          if (!togglingStatus) {
            setStatusModalOpen(false);
            setMachineToToggle(null);
          }
        }}
        handleConfirmation={handleConfirmToggleStatus}
        loading={togglingStatus}
        type={machineToToggle?.isActive === "active" ? "warning" : "info"}
        buttonText={
          machineToToggle?.isActive === "active"
            ? "Yes, Deactivate"
            : "Yes, Activate"
        }
        descText="change machine status"
        fullDescTex={
          machineToToggle
            ? `Are you sure you want to ${machineToToggle.isActive === "active" ? "deactivate" : "activate"
            } Machine #${machineToToggle.machineCode || machineToToggle.id} (${machineToToggle.hostName})?`
            : "Are you sure you want to update this machine's status?"
        }
        confButtonCassName={
          machineToToggle?.isActive === "active"
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-emerald-600 hover:bg-emerald-700"
        }
      />
    </div>
  );
};

export default MachineListing;
