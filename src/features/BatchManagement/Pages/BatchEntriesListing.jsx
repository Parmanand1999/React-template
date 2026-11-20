import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  Ticket,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Send,
  ClipboardCheck,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import useDebounce from "@/hooks/useDebounceHook";
import { batchEntryColumns } from "@/components/common/TableComponents/TablefieldsColumns";
import { getBatchEntries, getBatchById } from "@/Services/batchServices";
import { StatusBadge } from "@/utils/statusUtils";
import { formatDate } from "@/utils/formatDate";
import { getMonthName } from "@/constants/batchConstants";

import AssignBatchModal from "../Components/AssignBatchModal";
import SendToReviewModal from "../Components/SendToReviewModal";
import ReviewBatchModal from "../Components/ReviewBatchModal";
import BatchRemarksModal from "../Components/BatchRemarksModal";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "received", label: "Received" },
  { value: "ready_to_process", label: "Ready to Process" },
  { value: "in_queue", label: "In Queue" },
  { value: "checked", label: "Checked" },
  { value: "failed", label: "Failed" },
];

const SCRAPING_STATUS_OPTIONS = [
  { value: "all", label: "All Scraping Status" },
  { value: "pending", label: "Pending" },
  { value: "started", label: "Started" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const PARSING_STATUS_OPTIONS = [
  { value: "all", label: "All Parsing Status" },
  { value: "pending", label: "Pending" },
  { value: "started", label: "Started" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];


const BatchEntriesListing = () => {
  const params = useParams();
  const batchId = params.batchId || params.id;
  const navigate = useNavigate();
  const location = useLocation();

  // Initial batch details if passed via location state
  const [batchInfo, setBatchInfo] = useState(location?.state?.batch || null);

  // Query filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scrapingStatusFilter, setScrapingStatusFilter] = useState("all");
  const [parsingStatusFilter, setParsingStatusFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
  });

  // Data & loading states
  const [entriesData, setEntriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search query
  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Action Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [sendToReviewModalOpen, setSendToReviewModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);

  const reloadBatchInfo = useCallback(() => {
    if (batchId) {
      getBatchById(batchId)
        .then((res) => {
          if (res?.data?.success) {
            setBatchInfo(res.data.data);
          }
        })
        .catch((err) => console.error("Failed to reload batch info:", err));
    }
  }, [batchId]);

  // Fetch batch details if not passed through router state
  useEffect(() => {
    if (!batchInfo && batchId) {
      reloadBatchInfo();
    }
  }, [batchId, batchInfo, reloadBatchInfo]);

  // Construct query string for /api/v1/batches/:batchId/entries
  const queryParams = useMemo(() => {
    const qp = new URLSearchParams();
    qp.append("page", pagination.pageIndex);
    qp.append("limit", pagination.pageSize);

    if (debouncedSearchTerm) {
      qp.append("search", debouncedSearchTerm);
    }
    if (statusFilter !== "all") {
      qp.append("status", statusFilter);
    }
    if (scrapingStatusFilter !== "all") {
      qp.append("scrapingStatus", scrapingStatusFilter);
    }
    if (parsingStatusFilter !== "all") {
      qp.append("parsingStatus", parsingStatusFilter);
    }

    return qp.toString();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    statusFilter,
    scrapingStatusFilter,
    parsingStatusFilter,
  ]);

  const isInitialMount = useRef(true);
  const inFlightRef = useRef(false);
  const prevQueryRef = useRef("");

  // Fetch batch entries from API
  const fetchEntries = useCallback(async () => {
    if (!batchId) return;

    if (inFlightRef.current && prevQueryRef.current === queryParams) {
      return;
    }

    try {
      inFlightRef.current = true;
      prevQueryRef.current = queryParams;
      setLoading(true);

      const res = await getBatchEntries(batchId, queryParams);
      if (res?.data?.success) {
        const { items, meta } = res.data.data;
        setEntriesData(items || []);
        setTotalCount(meta?.totalItems || 0);
      } else {
        setEntriesData([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch batch entries:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load batch entries."
      );
      setEntriesData([]);
      setTotalCount(0);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [batchId, queryParams]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Reset pageIndex to 1 when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPagination((prev) => {
      if (prev.pageIndex === 1) return prev;
      return { ...prev, pageIndex: 1 };
    });
  }, [
    debouncedSearchTerm,
    statusFilter,
    scrapingStatusFilter,
    parsingStatusFilter,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setScrapingStatusFilter("all");
    setParsingStatusFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    scrapingStatusFilter !== "all" ||
    parsingStatusFilter !== "all";

  // Table columns definition
  const columns = useMemo(
    () => batchEntryColumns(pagination.pageIndex, pagination.pageSize),
    [pagination.pageIndex, pagination.pageSize]
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => navigate("/batches")}
              className="hover:text-primary transition flex items-center gap-1 cursor-pointer"
            >
              <Layers size={13} />
              <span>Batches</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold">
              Batch #{batchInfo?.batchNumber || "—"}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-primary font-semibold">Entries</span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="text-primary w-6 h-6" />
              <span>Batch Entries</span>
            </h2>
            {batchInfo?.batchNumber && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Batch #{batchInfo.batchNumber}
              </span>
            )}
            {batchInfo?.status && <StatusBadge status={batchInfo.status} />}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            View, filter, and monitor ticket scraping and parsing statuses for this batch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => navigate("/batches")}
            className="!p-2.5 !h-auto rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={15} />
            <span>Back to Batches</span>
          </CustomButton>

          <CustomButton
            type="button"
            variant="outline"
            onClick={fetchEntries}
            disabled={loading}
            className="!p-2.5 !h-auto rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Refresh Entries"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin text-primary" : ""}
            />
          </CustomButton>

          {/* Batch Actions Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <CustomButton
                type="button"
                className="!p-2.5 !h-auto rounded-xl bg-primary hover:bg-primary/90 text-white shadow-2xs cursor-pointer text-xs flex items-center gap-1.5"
              >
                <span>Actions</span>
                <ChevronDown size={14} />
              </CustomButton>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-1 bg-white shadow-xl rounded-xl border border-slate-200 z-50"
            >
              <div className="flex flex-col gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <UserCheck size={14} className="text-blue-600" />
                  <span>Assign Batch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSendToReviewModalOpen(true)}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <Send size={14} className="text-indigo-600" />
                  <span>Send to Review</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <ClipboardCheck size={14} className="text-emerald-600" />
                  <span>Review Batch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRemarksModalOpen(true)}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <MessageSquareText size={14} className="text-purple-600" />
                  <span>Add Remark</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Batch Overview Card */}
      {batchInfo && (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Client
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
                <Building2 size={13} className="text-blue-500 shrink-0" />
                <span className="truncate">{batchInfo.client?.name || batchInfo.clientName || "—"}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Refund Type
              </span>
              <span className="font-semibold text-slate-800 uppercase">
                {batchInfo.refundType || "—"}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Provider / Airline
              </span>
              <span className="font-semibold text-slate-800 capitalize">
                {batchInfo.serviceProvider || "—"}
                {batchInfo.airline ? ` (${batchInfo.airline})` : ""}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Period
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Calendar size={13} className="text-indigo-500 shrink-0" />
                <span>
                  {getMonthName(batchInfo.batchMonth)} {batchInfo.batchYear || ""}
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Total Records
              </span>
              <span className="font-bold text-slate-900">
                {batchInfo.totalData ?? totalCount}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Uploaded On
              </span>
              <span className="text-slate-600 font-medium">
                {batchInfo.createdAt
                  ? formatDate(batchInfo.createdAt, "dd-MM-yyyy")
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input using CustomSearch component */}
          <div className="lg:col-span-2">
            <CustomSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search by ticket, airline, IATA..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scraping Status Filter */}
          <div>
            <select
              value={scrapingStatusFilter}
              onChange={(e) => setScrapingStatusFilter(e.target.value)}
              className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              {SCRAPING_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parsing Status Filter */}
          <div>
            <select
              value={parsingStatusFilter}
              onChange={(e) => setParsingStatusFilter(e.target.value)}
              className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              {PARSING_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button row when active */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="!h-8 !px-3 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-none"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </CustomButton>
          </div>
        )}
      </div>

      {/* Entries Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={entriesData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
        />
      </div>

      {/* Assign Batch Modal */}
      <AssignBatchModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        batch={batchInfo}
        onSuccess={() => {
          fetchEntries();
          reloadBatchInfo();
        }}
      />

      {/* Send to Review Modal */}
      <SendToReviewModal
        isOpen={sendToReviewModalOpen}
        onClose={() => setSendToReviewModalOpen(false)}
        batch={batchInfo}
        onSuccess={() => {
          fetchEntries();
          reloadBatchInfo();
        }}
      />

      {/* Review Batch Modal */}
      <ReviewBatchModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        batch={batchInfo}
        onSuccess={() => {
          fetchEntries();
          reloadBatchInfo();
        }}
      />

      {/* Batch Remarks Modal */}
      <BatchRemarksModal
        isOpen={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        batch={batchInfo}
        onSuccess={() => {
          fetchEntries();
          reloadBatchInfo();
        }}
      />
    </div>
  );
};

export default BatchEntriesListing;
