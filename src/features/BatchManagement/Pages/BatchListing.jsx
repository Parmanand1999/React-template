import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  UploadCloud,
  RefreshCw,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";

import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import useDebounce from "@/hooks/useDebounceHook";
import { batchColumns } from "@/components/common/TableComponents/TablefieldsColumns";
import { getBatchesList, deleteBatch } from "@/Services/batchServices";
import { getClientsList } from "@/Services/clientServices";
import UploadBatchModal from "../Components/UploadBatchModal";
import BatchViewModal from "../Components/BatchViewModal";
import AssignBatchModal from "../Components/AssignBatchModal";
import SendToReviewModal from "../Components/SendToReviewModal";
import ReviewBatchModal from "../Components/ReviewBatchModal";
import BatchRemarksModal from "../Components/BatchRemarksModal";
import ProcessBatchModal from "../Components/ProcessBatchModal";
import BatchAuditLogsModal from "../Components/BatchAuditLogsModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import SingleSelectInfiniteDropdown from "@/components/common/DropdownSelect/SingleSelectInfiniteDropdown";

import {
  AIRLINE_OPTIONS,
  REFUND_TYPE_OPTIONS,
  SERVICE_PROVIDER_OPTIONS,
  BATCH_STATUS_OPTIONS,
} from "@/constants/batchConstants";

const BatchListing = () => {
  // Query Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [clientIdFilter, setClientIdFilter] = useState("all");
  const [refundTypeFilter, setRefundTypeFilter] = useState("all");
  const [serviceProviderFilter, setServiceProviderFilter] = useState("all");
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchMonthFilter, setBatchMonthFilter] = useState("all");
  const [batchYearFilter, setBatchYearFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
  });

  // Data & Loading state
  const [batchesData, setBatchesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBatchForAssign, setSelectedBatchForAssign] = useState(null);

  const [sendToReviewModalOpen, setSendToReviewModalOpen] = useState(false);
  const [selectedBatchForSendToReview, setSelectedBatchForSendToReview] =
    useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBatchForReview, setSelectedBatchForReview] = useState(null);

  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [selectedBatchForRemarks, setSelectedBatchForRemarks] = useState(null);

  // Process / Dispatch Batch Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedBatchForProcess, setSelectedBatchForProcess] = useState(null);

  // Batch Audit Logs Modal State
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [selectedBatchForAuditLogs, setSelectedBatchForAuditLogs] = useState(null);

  // Delete Batch Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBatchForDelete, setSelectedBatchForDelete] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(false);

  // Debounced search query
  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Clients filter state with infinite scroll & search
  const [selectedClientOption, setSelectedClientOption] = useState(null);

  // Fetch clients for dropdown with infinite scroll & search
  const fetchClientsForDropdown = useCallback(
    async ({ page = 1, search = "", pageSize = 10 }) => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", pageSize);
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      params.append("isActive", "active");

      try {
        const response = await getClientsList(params.toString());
        if (!response?.data?.success) {
          return { data: [], pagination: null };
        }

        const items = response.data.data?.items || [];
        const meta = response.data.data?.meta || {};

        const transformedData = items.map((client) => ({
          ...client,
          _id: client.id,
          id: client.id,
          name: client.clientName || client.name || "Client",
        }));

        return {
          data: transformedData,
          pagination: {
            currentPage: meta.currentPage || page,
            totalPages: meta.totalPages || 1,
            totalItems: meta.totalItems || items.length,
            hasNextPage:
              meta.currentPage && meta.totalPages
                ? meta.currentPage < meta.totalPages
                : items.length === pageSize,
            pageSize: meta.itemsPerPage || pageSize,
          },
        };
      } catch (err) {
        console.error("Failed to load clients in dropdown", err);
        return { data: [], pagination: null };
      }
    },
    []
  );

  const handleClientChange = useCallback((client) => {
    setSelectedClientOption(client);
    setClientIdFilter(client?.id || client?._id || "all");
  }, []);

  const getClientOptionLabel = useCallback((client) => {
    return client?.clientName || client?.name || "Client";
  }, []);

  const getClientOptionDescription = useCallback((client) => {
    if (client?.organization?.organizationName || client?.organization?.name) {
      return client.organization.organizationName || client.organization.name;
    }
    return client?.email || "";
  }, []);

  // Construct query string based on backend specifications
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", pagination.pageIndex);
    params.append("limit", pagination.pageSize);

    if (debouncedSearchTerm) {
      params.append("search", debouncedSearchTerm);
    }
    if (clientIdFilter !== "all") {
      params.append("clientId", clientIdFilter);
    }
    if (refundTypeFilter !== "all") {
      params.append("refundType", refundTypeFilter);
    }
    if (serviceProviderFilter !== "all") {
      params.append("serviceProvider", serviceProviderFilter);
    }
    if (airlineFilter !== "all") {
      params.append("airline", airlineFilter);
    }
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    if (batchMonthFilter !== "all") {
      params.append("batchMonth", batchMonthFilter);
    }
    if (batchYearFilter !== "all") {
      params.append("batchYear", batchYearFilter);
    }

    return params.toString();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    clientIdFilter,
    refundTypeFilter,
    serviceProviderFilter,
    airlineFilter,
    statusFilter,
    batchMonthFilter,
    batchYearFilter,
  ]);

  const isInitialMount = useRef(true);
  const inFlightRef = useRef(false);
  const prevQueryRef = useRef("");

  // Fetch batches from API (prevents duplicate in-flight requests)
  const fetchBatches = useCallback(async () => {
    if (inFlightRef.current && prevQueryRef.current === queryParams) {
      return;
    }

    try {
      inFlightRef.current = true;
      prevQueryRef.current = queryParams;
      setLoading(true);
      const res = await getBatchesList(queryParams);
      if (res?.data?.success) {
        const { items, meta } = res.data.data;
        setBatchesData(items || []);
        setTotalCount(meta?.totalItems || 0);
      } else {
        setBatchesData([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load batches list."
      );
      setBatchesData([]);
      setTotalCount(0);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Reset pageIndex to 1 on filter changes (skipped on initial mount to prevent duplicate fetch)
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
    clientIdFilter,
    refundTypeFilter,
    serviceProviderFilter,
    airlineFilter,
    statusFilter,
    batchMonthFilter,
    batchYearFilter,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedClientOption(null);
    setClientIdFilter("all");
    setRefundTypeFilter("all");
    setServiceProviderFilter("all");
    setAirlineFilter("all");
    setStatusFilter("all");
    setBatchMonthFilter("all");
    setBatchYearFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    clientIdFilter !== "all" ||
    refundTypeFilter !== "all" ||
    serviceProviderFilter !== "all" ||
    airlineFilter !== "all" ||
    statusFilter !== "all" ||
    batchMonthFilter !== "all" ||
    batchYearFilter !== "all";


  const navigate = useNavigate();

  const handleOpenViewModal = useCallback((batch) => {
    setSelectedBatch(batch);
    setViewModalOpen(true);
  }, []);

  const handleViewEntries = useCallback(
    (batch) => {
      const id = batch?.id || batch?._id;
      if (id) {
        navigate(`/batches/${id}/entries`, { state: { batch } });
      }
    },
    [navigate]
  );

  const handleOpenAssignModal = useCallback((batch) => {
    setSelectedBatchForAssign(batch);
    setAssignModalOpen(true);
  }, []);

  const handleOpenSendToReviewModal = useCallback((batch) => {
    setSelectedBatchForSendToReview(batch);
    setSendToReviewModalOpen(true);
  }, []);

  const handleOpenReviewModal = useCallback((batch) => {
    setSelectedBatchForReview(batch);
    setReviewModalOpen(true);
  }, []);

  const handleOpenRemarksModal = useCallback((batch) => {
    setSelectedBatchForRemarks(batch);
    setRemarksModalOpen(true);
  }, []);

  const handleOpenProcessModal = useCallback((batch) => {
    setSelectedBatchForProcess(batch);
    setProcessModalOpen(true);
  }, []);

  const handleOpenAuditLogsModal = useCallback((batch) => {
    setSelectedBatchForAuditLogs(batch);
    setAuditLogsModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback((batch) => {
    setSelectedBatchForDelete(batch);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedBatchForDelete) return;
    const batchId = selectedBatchForDelete.id || selectedBatchForDelete._id;
    if (!batchId) return;

    try {
      setDeletingBatch(true);
      const res = await deleteBatch(batchId);
      if (res?.data?.success) {
        toast.success(res.data.message || "Batch deleted successfully!");
        setDeleteModalOpen(false);
        setSelectedBatchForDelete(null);
        fetchBatches();
      } else {
        toast.error(res?.data?.message || "Failed to delete batch.");
      }
    } catch (err) {
      console.error("Failed to delete batch:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete batch."
      );
    } finally {
      setDeletingBatch(false);
    }
  };

  const columns = useMemo(
    () =>
      batchColumns({
        onView: handleOpenViewModal,
        onViewEntries: handleViewEntries,
        onAssign: handleOpenAssignModal,
        onSendToReview: handleOpenSendToReviewModal,
        onReview: handleOpenReviewModal,
        onAddRemark: handleOpenRemarksModal,
        onDelete: handleOpenDeleteModal,
        onProcess: handleOpenProcessModal,
        onViewAuditLogs: handleOpenAuditLogsModal,
      }),
    [
      handleOpenViewModal,
      handleViewEntries,
      handleOpenAssignModal,
      handleOpenSendToReviewModal,
      handleOpenReviewModal,
      handleOpenRemarksModal,
      handleOpenDeleteModal,
      handleOpenProcessModal,
      handleOpenAuditLogsModal,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-primary w-6 h-6" />
            <span>Batch Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor, upload, and process client GDS and LCC refund spreadsheet batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={fetchBatches}
            disabled={loading}
            className="!p-2.5 !h-auto rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Refresh Batches"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : ""}
            />
          </CustomButton>

          <CustomButton
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs cursor-pointer text-xs px-4 py-2.5 rounded-xl"
          >
            <UploadCloud size={16} />
            <span>Upload Batch</span>
          </CustomButton>
        </div>
      </div>


      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input using CustomSearch component */}
          <div>
            <CustomSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search by file or batch #..."
            />
          </div>

          {/* Client Filter with Infinite Scroll & Search */}
          <div>
            <SingleSelectInfiniteDropdown
              placeholder="All Clients"
              selectedValue={selectedClientOption}
              onSelectionChange={handleClientChange}
              fetchOptions={fetchClientsForDropdown}
              getOptionLabel={getClientOptionLabel}
              getOptionDescription={getClientOptionDescription}
              pageSize={10}
              buttonClassName="!h-9 !text-xs !px-3 !py-0 !rounded-lg !border-slate-200 hover:!border-slate-300 focus:!border-primary focus:!ring-2 focus:!ring-primary/20 !bg-white !text-slate-800 !font-medium shadow-none"
              dropdownClassName="text-xs"
            />
          </div>

          {/* Refund Type Filter */}
          <div>
            <select
              value={refundTypeFilter}
              onChange={(e) => setRefundTypeFilter(e.target.value)}
              className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition uppercase cursor-pointer"
            >
              <option value="all">All Refund Types</option>
              {REFUND_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          {refundTypeFilter === "gds" && <div>
            <select
              value={serviceProviderFilter}
              onChange={(e) => {
                setServiceProviderFilter(e.target.value)
                setAirlineFilter("all")
              }}
              className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition capitalize cursor-pointer"
            >
              <option value="all">All Providers</option>
              {SERVICE_PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>}
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1 border-t border-slate-100">
          {refundTypeFilter !== "gds" && <div>
            <select
              value={airlineFilter}
              onChange={(e) => {
                setAirlineFilter(e.target.value)
                setServiceProviderFilter("all")
              }}
              className="custom-select w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition capitalize cursor-pointer"
            >
              <option value="all">All Airlines</option>
              {AIRLINE_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>}

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {BATCH_STATUS_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar Month & Year Filter */}
          <div className="relative">
            <input
              type="month"
              value={
                batchYearFilter !== "all" && batchMonthFilter !== "all"
                  ? `${batchYearFilter}-${String(batchMonthFilter).padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const [y, m] = val.split("-");
                  setBatchYearFilter(y);
                  setBatchMonthFilter(String(parseInt(m, 10)));
                } else {
                  setBatchYearFilter("all");
                  setBatchMonthFilter("all");
                }
              }}
              title="Pick Month & Year from Calendar"
              className="w-full h-8 px-2.5 pl-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            />
            <Calendar
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
            />
          </div>


          {hasActiveFilters && (
            <div>
              <CustomButton
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="w-full !h-8 !px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer shadow-none"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* Batches Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={batchesData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
          stickyActionColumn={true}
        />
      </div>

      {/* Upload Batch Modal */}
      <UploadBatchModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          fetchBatches();
        }}
      />

      {/* View Batch Details Modal */}
      <BatchViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        onDelete={handleOpenDeleteModal}
      />

      {/* Assign Batch Modal */}
      <AssignBatchModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedBatchForAssign(null);
        }}
        batch={selectedBatchForAssign}
        onSuccess={fetchBatches}
      />

      {/* Send to Review Modal */}
      <SendToReviewModal
        isOpen={sendToReviewModalOpen}
        onClose={() => {
          setSendToReviewModalOpen(false);
          setSelectedBatchForSendToReview(null);
        }}
        batch={selectedBatchForSendToReview}
        onSuccess={fetchBatches}
      />

      {/* Review Batch Modal */}
      <ReviewBatchModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedBatchForReview(null);
        }}
        batch={selectedBatchForReview}
        onSuccess={fetchBatches}
      />

      {/* Batch Remarks Modal */}
      <BatchRemarksModal
        isOpen={remarksModalOpen}
        onClose={() => {
          setRemarksModalOpen(false);
          setSelectedBatchForRemarks(null);
        }}
        batch={selectedBatchForRemarks}
        onSuccess={fetchBatches}
      />

      {/* Process / Dispatch Batch Modal */}
      <ProcessBatchModal
        isOpen={processModalOpen}
        onClose={() => {
          setProcessModalOpen(false);
          setSelectedBatchForProcess(null);
        }}
        batch={selectedBatchForProcess}
        onSuccess={fetchBatches}
      />

      {/* Batch Audit Logs Modal */}
      <BatchAuditLogsModal
        isOpen={auditLogsModalOpen}
        onClose={() => {
          setAuditLogsModalOpen(false);
          setSelectedBatchForAuditLogs(null);
        }}
        batchId={selectedBatchForAuditLogs?.id || selectedBatchForAuditLogs?._id}
        batchData={selectedBatchForAuditLogs}
      />

      {/* Delete Batch Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteModalOpen}
        handleCancel={() => {
          if (!deletingBatch) {
            setDeleteModalOpen(false);
            setSelectedBatchForDelete(null);
          }
        }}
        handleConfirmation={handleConfirmDelete}
        loading={deletingBatch}
        type="error"
        buttonText="Yes, Delete Batch"
        descText="delete this batch"
        fullDescTex={
          selectedBatchForDelete
            ? `Are you sure you want to delete Batch #${selectedBatchForDelete.batchNumber || selectedBatchForDelete.id}? This action will permanently remove the batch and all its associated entries.`
            : "Are you sure you want to delete this batch?"
        }
      />
    </div>
  );
};

export default BatchListing;
