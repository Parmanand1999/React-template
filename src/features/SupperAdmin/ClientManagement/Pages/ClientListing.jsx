import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Building2,
  Users,
  ShieldCheck,
  Receipt,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Database,
  Edit,
  ArrowUpDown,
  Filter,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";

import DataTable from "@/components/common/TableComponents/DataTable";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomSearch from "@/components/common/CustomSearch";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import CustomLoader from "@/components/common/CustomLoader";
import useDebounce from "@/hooks/useDebounceHook";

import { clientColumns } from "@/components/common/TableComponents/TablefieldsColumns";

import {
  getClientsList,
  getClientById,
  deleteClient,
  toggleClientStatus,
} from "@/Services/clientServices";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ClientFormModal from "../Components/ClientFormModal";
import ClientViewModal from "../Components/ClientViewModal";
import ClientCredentialsModal from "../Components/ClientCredentialsModal";

const ClientListing = () => {
  // Filters & Pagination state (matching EmployeeListing query params pattern)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  const [sortOrder, setSortOrder] = useState("DESC"); // "ASC" or "DESC"

  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });

  // Modal States
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Client Credentials Modal State
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [selectedClientForCredentials, setSelectedClientForCredentials] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Debounced search query
  const debouncedSearchTerm = useDebounce(searchQuery?.trim(), 400);

  // Compile Query String for GET /api/v1/clients (matching employee listing)
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
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, debouncedSearchTerm, sortOrder]);

  // Fetch Clients List
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClientsList(queryParams);
      if (response?.status === 200 || response?.status === 201) {
        const resData = response?.data?.data || response?.data;
        const list =
          resData?.items ||
          resData?.clients ||
          resData?.clientList ||
          (Array.isArray(resData) ? resData : []);
        const count =
          resData?.meta?.totalItems ||
          resData?.totalCount ||
          resData?.totalElement ||
          resData?.total ||
          list.length;

        setClientsData(Array.isArray(list) ? list : []);
        setTotalCount(count);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch clients list"
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Reset pageIndex on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  }, [debouncedSearchTerm, statusFilter, sortOrder]);

  // Client-Side status filtering if needed
  // const filteredClients = useMemo(() => {
  //   if (statusFilter === "active") {
  //     return clientsData.filter(
  //       (c) =>
  //         c.isActive === true ||
  //         c.status === "active" ||
  //         c.status === "Active"
  //     );
  //   }
  //   if (statusFilter === "inactive") {
  //     return clientsData.filter(
  //       (c) =>
  //         c.isActive === false ||
  //         c.status === "inactive" ||
  //         c.status === "Inactive"
  //     );
  //   }
  //   return clientsData;
  // }, [clientsData, statusFilter]);

  // Metric summaries based on API response stats
  const metrics = useMemo(() => {
    const total = totalCount || clientsData.length;
    const active = clientsData.filter(
      (c) =>
        c.isActive === true ||
        c.status === "active" ||
        c.status === "Active"
    ).length;
    const totalData = clientsData.reduce(
      (acc, c) => acc + (Number(c.stats?.totalData) || 0),
      0
    );
    const totalRefunded = clientsData.reduce(
      (acc, c) => acc + (Number(c.stats?.totalRefunded) || 0),
      0
    );
    const totalAmountRefunded = clientsData.reduce(
      (acc, c) => acc + (Number(c.stats?.totalAmountRefunded) || 0),
      0
    );
    return { total, active, totalData, totalRefunded, totalAmountRefunded };
  }, [clientsData, totalCount]);

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingClient(null);
    setAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = async (client) => {
    const clientId = client?.id || client?._id;
    setEditingClient(client);
    setAddEditModalOpen(true);

    // Fetch freshest data by ID
    if (clientId) {
      try {
        const res = await getClientById(clientId);
        if (res?.status === 200 || res?.status === 201) {
          const freshData = res?.data?.data || res?.data;
          if (freshData) {
            setEditingClient(freshData);
          }
        }
      } catch (error) {
        console.warn("Could not fetch latest client details, using row data:", error);
      }
    }
  };

  // Open View Details Modal
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };

  // Toggle Client Status (PATCH /api/v1/clients/{id}/status)
  const handleToggleStatus = async (client) => {
    const clientId = client.id || client._id;
    const currentActive =
      client.isActive === "active" ? "inactive" : "active"


    setActionLoading(true);
    try {
      const res = await toggleClientStatus(clientId, currentActive);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(
          res?.data?.message ||
          `Travel Agent ${currentActive === "active" ? "activated" : "deactivated"} successfully!`
        );
        fetchClients();
      } else {
        toast.error(res?.data?.message || "Failed to update travel agent status.");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to toggle status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Client Handler
  const handleDeletePrompt = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    const clientId = clientToDelete.id || clientToDelete._id;

    setActionLoading(true);
    try {
      const res = await deleteClient(clientId);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(
          res?.data?.message || "Travel Agent deleted successfully!"
        );
        setDeleteModalOpen(false);
        setClientToDelete(null);
        fetchClients();
      } else {
        toast.error(res?.data?.message || "Failed to delete travel agent.");
      }
    } catch (error) {
      console.error("Delete travel agent error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete travel agent."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Credentials Modal Handler
  const handleManageCredentials = useCallback((client) => {
    setSelectedClientForCredentials(client);
    setCredentialsModalOpen(true);
  }, []);

  // Define Table Columns
  const columns = useMemo(
    () =>
      clientColumns(
        handleViewDetails,
        handleOpenEditModal,
        handleToggleStatus,
        handleDeletePrompt,
        handleManageCredentials
      ),
    [fetchClients, handleManageCredentials]
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {actionLoading && <CustomLoader fixed />}

      {/* Metric Cards Banner */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Clients
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.total}
            </h3>
          </div>
        </div>

       
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Status
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {metrics.active}
            </h3>
          </div>
        </div>

      
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Data
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5">
              {metrics.totalData.toLocaleString()}
            </h3>
          </div>
        </div>

        
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Amount Refunded
            </p>
            <h3 className="text-2xl font-bold text-purple-600 mt-0.5">
              {metrics.totalAmountRefunded.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>
      </div> */}

      {/* Main Top Filter Controls Bar matching Employee Management */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input Box using CustomSearch */}
          <div className="flex-1 max-w-sm">
            <CustomSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search by agency name, POC, or email..."
              size="md"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select Filter */}
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

            {/* Quick Status Pills */}
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
                ? "bg-rose-50 text-rose-700 border-rose-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Inactive</span>
            </CustomButton>

            {/* Refresh Button */}
            <CustomButton
              type="button"
              variant="outline"
              onClick={fetchClients}
              disabled={loading}
              className="!p-2 !h-auto rounded-lg border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none cursor-pointer"
              title="Refresh table"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-primary" : ""}
              />
            </CustomButton>

            {/* Add Travel Agent Button */}
            <CustomButton
              type="button"
              onClick={handleOpenAddModal}
              className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Travel Agent</span>
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={clientsData}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          loading={loading}
        />
      </div>

      {/* Add / Edit Client Modal */}
      <Dialog open={addEditModalOpen} onOpenChange={setAddEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] rounded-3xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span
                className={`p-2 rounded-xl ${editingClient
                  ? "bg-amber-50 text-amber-600"
                  : "bg-primary/10 text-primary"
                  }`}
              >
                {editingClient ? <Edit size={20} /> : <UserPlus size={20} />}
              </span>
              <span>{editingClient ? "Edit Travel Agent" : "Add New Travel Agent"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {editingClient
                ? `Update company credentials and configurations for ${editingClient.clientName || editingClient.name || "travel agent"
                }.`
                : "Fill in the company details, contact information, taxation status, and consultant preferences."}
            </DialogDescription>
          </DialogHeader>

          <ClientFormModal
            clientId={editingClient?.id || editingClient?._id}
            initialData={editingClient}
            isEdit={Boolean(editingClient)}
            isModal={true}
            onSuccess={() => {
              setAddEditModalOpen(false);
              setEditingClient(null);
              fetchClients();
            }}
            onCancel={() => {
              setAddEditModalOpen(false);
              setEditingClient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Client Details Modal */}
      <ClientViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={(client) => handleOpenEditModal(client)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteModalOpen}
        handleCancel={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        handleConfirmation={confirmDeleteClient}
        type="warning"
        buttonText="Delete Travel Agent"
        descText={`delete travel agent "${clientToDelete?.clientName || clientToDelete?.name || "this travel agent"
          }"? All associated configurations will be affected.`}
      />

      {/* Client GDS Credentials Modal */}
      <ClientCredentialsModal
        isOpen={credentialsModalOpen}
        onClose={() => {
          setCredentialsModalOpen(false);
          setSelectedClientForCredentials(null);
        }}
        client={selectedClientForCredentials}
      />
    </div>
  );
};

export default ClientListing;
