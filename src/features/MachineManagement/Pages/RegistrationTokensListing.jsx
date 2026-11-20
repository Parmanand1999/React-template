import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Key,
  Plus,
  RefreshCw,
  ArrowLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import useDebounce from "@/hooks/useDebounceHook";
import { registrationTokenColumns } from "@/components/common/TableComponents/TablefieldsColumns";
import {
  getRegistrationTokens,
  deleteRegistrationToken,
} from "@/Services/machineServices";
import GenerateTokenModal from "../Components/GenerateTokenModal";
import { TOKEN_STATUS_OPTIONS } from "@/constants/machineConstants";

const RegistrationTokensListing = () => {
  const navigate = useNavigate();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
  });

  // Data & loading state
  const [tokensData, setTokensData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  // Delete Token State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState(null);
  const [deletingToken, setDeletingToken] = useState(false);

  // Debounced search query
  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Compile query string for GET /api/v1/machines/registration-tokens
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", pagination.pageIndex);
    params.append("limit", pagination.pageSize);

    if (debouncedSearchTerm) {
      params.append("search", debouncedSearchTerm);
    }
    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    return params.toString();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, statusFilter]);

  // Track in-flight queries
  const isInitialMount = useRef(true);
  const inFlightRef = useRef(false);
  const prevQueryRef = useRef("");

  // Fetch Tokens List
  const fetchTokens = useCallback(async () => {
    if (inFlightRef.current && prevQueryRef.current === queryParams) return;

    try {
      inFlightRef.current = true;
      prevQueryRef.current = queryParams;
      setLoading(true);

      const res = await getRegistrationTokens(queryParams);
      if (res?.data?.success) {
        const { items, meta } = res.data.data;
        setTokensData(items || []);
        setTotalCount(meta?.totalItems || 0);
      } else {
        setTokensData([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch registration tokens:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load registration tokens."
      );
      setTokensData([]);
      setTotalCount(0);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Reset pagination on filter change
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

  const handleCopyToken = useCallback((token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard!");
  }, []);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== "all";

  // Stat metrics
  const stats = useMemo(() => {
    const total = totalCount || tokensData.length;
    const pending = tokensData.filter((t) => t.status === "pending").length;
    const used = tokensData.filter((t) => t.status === "used").length;
    const expired = tokensData.filter(
      (t) => t.status === "expired" || t.status === "revoked"
    ).length;

    return { total, pending, used, expired };
  }, [totalCount, tokensData]);

  const handleOpenDelete = useCallback((token) => {
    setTokenToDelete(token);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!tokenToDelete) return;
    const id = tokenToDelete.id || tokenToDelete._id;
    if (!id) return;

    try {
      setDeletingToken(true);
      const res = await deleteRegistrationToken(id);
      if (res?.data?.success) {
        toast.success(
          res.data.message || "Registration token deleted successfully!"
        );
        setDeleteModalOpen(false);
        setTokenToDelete(null);
        fetchTokens();
      } else {
        toast.error(res?.data?.message || "Failed to delete registration token.");
      }
    } catch (err) {
      console.error("Failed to delete registration token:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete registration token."
      );
    } finally {
      setDeletingToken(false);
    }
  };

  const columns = useMemo(
    () =>
      registrationTokenColumns({
        onDelete: handleOpenDelete,
        onCopyToken: handleCopyToken,
      }),
    [handleOpenDelete, handleCopyToken]
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => navigate("/machines")}
              className="text-xs font-semibold text-slate-500 hover:text-primary transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Machines</span>
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="text-primary w-6 h-6" />
            <span>Registration Tokens</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate and manage temporary registration tokens for connecting utility worker nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={fetchTokens}
            disabled={loading}
            className="!p-2.5 !h-auto rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Refresh tokens list"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : ""}
            />
          </CustomButton>

          <CustomButton
            type="button"
            onClick={() => setGenerateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs gap-2 cursor-pointer font-semibold"
          >
            <Plus size={16} />
            <span>Generate Token</span>
          </CustomButton>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Tokens
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending Activation
            </p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Redeemed / Used
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {stats.used}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Expired / Revoked
            </p>
            <p className="text-xl font-bold text-slate-700 mt-0.5">
              {stats.expired}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar matching dropdown in user screenshot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <CustomSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by label..."
              className="w-full"
            />
          </div>

          {/* Status Dropdown matching user screenshot (-- / pending / used / expired / revoked) */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            >
              {TOKEN_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtered by token parameters</span>
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
          data={tokensData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
        />
      </div>

      {/* Generate Token Modal */}
      <GenerateTokenModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onSuccess={fetchTokens}
      />

      {/* Delete Token Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteModalOpen}
        handleCancel={() => {
          if (!deletingToken) {
            setDeleteModalOpen(false);
            setTokenToDelete(null);
          }
        }}
        handleConfirmation={handleConfirmDelete}
        loading={deletingToken}
        type="error"
        buttonText="Yes, Delete Token"
        descText="delete this registration token"
        fullDescTex={
          tokenToDelete
            ? `Are you sure you want to delete registration token for "${tokenToDelete.label || tokenToDelete.id}"? This action cannot be undone.`
            : "Are you sure you want to delete this registration token?"
        }
      />
    </div>
  );
};

export default RegistrationTokensListing;
