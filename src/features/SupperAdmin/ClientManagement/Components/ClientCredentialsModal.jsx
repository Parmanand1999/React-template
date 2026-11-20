import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  KeyRound,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import AddEditCredentialModal from "./AddEditCredentialModal";
import { PROVIDER_MAP } from "./credentialConstants";
import { StatusToggle } from "@/utils/statusUtils";
import {
  getClientCredentials,
  getClientCredentialById,
  getClientCredentialSecrets,
  toggleClientCredentialStatus,
  deleteClientCredential,
} from "@/Services/clientServices";

const ClientCredentialsModal = ({
  isOpen = false,
  onClose,
  client = null,
}) => {
  const clientId = client?.id || client?._id;
  const clientName = client?.clientName || client?.name || "Travel Agent";

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  // Ref cache to prevent re-render loops and eliminate duplicate API calls
  const credentialDetailsRef = useRef({});
  const inFlightListRef = useRef(false);
  const inFlightDetailsRef = useRef(new Set());
  const prevIsOpenRef = useRef(false);
  const prevClientIdRef = useRef(null);

  const [credentialDetails, setCredentialDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Secrets cache & loading state (for on-demand password/tPin via GET /api/v1/client-credentials/{id}/secrets)
  const credentialSecretsRef = useRef({});
  const [credentialSecrets, setCredentialSecrets] = useState({});
  const [loadingSecrets, setLoadingSecrets] = useState({});

  // Sub-modal states
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);

  // Delete modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch individual credential details by ID (called once per item when expanded)
  const fetchSingleCredentialDetails = useCallback(async (id, force = false) => {
    if (!id) return;
    // Skip if already cached unless forced
    if (!force && credentialDetailsRef.current[id]) {
      return;
    }
    // Skip if request for this ID is already in flight
    if (inFlightDetailsRef.current.has(id)) {
      return;
    }

    inFlightDetailsRef.current.add(id);
    setLoadingDetails((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await getClientCredentialById(id);
      if (res?.data?.success && res?.data?.data) {
        credentialDetailsRef.current[id] = res.data.data;
        setCredentialDetails((prev) => ({
          ...prev,
          [id]: res.data.data,
        }));
      }
    } catch (error) {
      console.error(`Fetch details error for credential ${id}:`, error);
      toast.error(
        error?.response?.data?.message || "Failed to load credential details."
      );
    } finally {
      inFlightDetailsRef.current.delete(id);
      setLoadingDetails((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  // Fetch credentials list for this client (1st API call on open)
  const fetchCredentials = useCallback(async (forceFirstDetail = false) => {
    if (!clientId) return;
    if (inFlightListRef.current) return;
    inFlightListRef.current = true;
    setLoading(true);
    try {
      const res = await getClientCredentials(clientId);
      if (res?.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setCredentials(list);
        if (list.length > 0) {
          const firstId = list[0].id;
          setExpandedId(firstId);
          // 2nd API call: fetch details for the 1st credential immediately
          fetchSingleCredentialDetails(firstId, forceFirstDetail);
        } else {
          setExpandedId(null);
        }
      } else {
        toast.error(res?.data?.message || "Failed to load client credentials.");
      }
    } catch (error) {
      console.error("Fetch client credentials error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to load credentials for this client."
      );
    } finally {
      inFlightListRef.current = false;
      setLoading(false);
    }
  }, [clientId, fetchSingleCredentialDetails]);

  // Open modal session tracker - triggers exactly once per modal open
  useEffect(() => {
    if (isOpen && clientId) {
      const isNewlyOpened = !prevIsOpenRef.current || prevClientIdRef.current !== clientId;
      if (isNewlyOpened) {
        prevIsOpenRef.current = true;
        prevClientIdRef.current = clientId;
        credentialDetailsRef.current = {};
        credentialSecretsRef.current = {};
        inFlightDetailsRef.current.clear();
        setCredentialDetails({});
        setCredentialSecrets({});
        setLoadingSecrets({});
        setShowPasswords({});
        fetchCredentials();
      }
    } else if (!isOpen) {
      prevIsOpenRef.current = false;
      prevClientIdRef.current = null;
      credentialDetailsRef.current = {};
      credentialSecretsRef.current = {};
      inFlightDetailsRef.current.clear();
      setCredentials([]);
      setExpandedId(null);
      setCredentialDetails({});
      setCredentialSecrets({});
      setLoadingSecrets({});
      setLoadingDetails({});
      setShowPasswords({});
    }
  }, [isOpen, clientId, fetchCredentials]);

  // Toggle single accordion item: fetches details for that item only once on open
  const handleToggleAccordion = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchSingleCredentialDetails(id);
    }
  };

  // Toggle password or T-PIN visibility with on-demand secrets API call (GET /api/v1/client-credentials/{id}/secrets)
  const togglePasswordVisibility = async (id, fieldKey) => {
    const key = `${id}_${fieldKey}`;
    const isCurrentlyShown = Boolean(showPasswords[key]);

    if (isCurrentlyShown) {
      // Hide password immediately (no API call required)
      setShowPasswords((prev) => ({
        ...prev,
        [key]: false,
      }));
      return;
    }

    // If secrets already cached for this credential, simply reveal without calling API again
    if (credentialSecretsRef.current[id]) {
      setShowPasswords((prev) => ({
        ...prev,
        [key]: true,
      }));
      return;
    }

    // Call GET /api/v1/client-credentials/{id}/secrets
    setLoadingSecrets((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await getClientCredentialSecrets(id);
      if (res?.data?.success && res?.data?.data) {
        const secretsData = res.data.data;
        credentialSecretsRef.current[id] = secretsData;
        setCredentialSecrets((prev) => ({
          ...prev,
          [id]: secretsData,
        }));
        setShowPasswords((prev) => ({
          ...prev,
          [key]: true,
        }));
      } else {
        toast.error(res?.data?.message || "Failed to retrieve credential secrets.");
      }
    } catch (error) {
      console.error(`Error fetching secrets for credential ${id}:`, error);
      toast.error(
        error?.response?.data?.message || "Failed to retrieve password. Please try again."
      );
    } finally {
      setLoadingSecrets((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (e, cred) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      const newStatus = !cred.isActive;
      const res = await toggleClientCredentialStatus(cred.id, newStatus);
      if (res?.data?.success) {
        toast.success(
          res.data.message ||
          `Credential status changed to ${newStatus ? "Active" : "Inactive"}.`
        );
        fetchCredentials();
        fetchSingleCredentialDetails(cred.id, true);
      } else {
        toast.error(res?.data?.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update credential status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (e, cred) => {
    e.stopPropagation();
    const credToEdit = credentialDetails[cred.id] || cred;
    setEditingCredential(credToEdit);
    setAddEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    if (credentials.length >= 3) {
      toast.info("Maximum limit reached. All 3 GDS providers are already configured.");
      return;
    }
    setEditingCredential(null);
    setAddEditModalOpen(true);
  };

  // Delete Prompt
  const handleDeletePrompt = (e, cred) => {
    e.stopPropagation();
    setCredentialToDelete(cred);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!credentialToDelete) return;
    const credId = credentialToDelete.id;
    try {
      setActionLoading(true);
      const res = await deleteClientCredential(credId);
      if (res?.data?.success) {
        toast.success(res.data.message || "Credential deleted successfully.");
        setDeleteConfirmOpen(false);
        setCredentialToDelete(null);
        delete credentialDetailsRef.current[credId];
        delete credentialSecretsRef.current[credId];
        setCredentialDetails((prev) => {
          const copy = { ...prev };
          delete copy[credId];
          return copy;
        });
        setCredentialSecrets((prev) => {
          const copy = { ...prev };
          delete copy[credId];
          return copy;
        });
        fetchCredentials();
      } else {
        toast.error(res?.data?.message || "Failed to delete credential.");
      }
    } catch (error) {
      console.error("Delete credential error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete credential."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isMaxReached = credentials.length >= 3;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  <KeyRound size={20} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Travel Agent GDS Credentials
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400" />
                    <span>Agency:</span>
                    <strong className="text-slate-700 font-semibold">
                      {clientName}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Refresh button */}
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => {
                  credentialDetailsRef.current = {};
                  credentialSecretsRef.current = {};
                  inFlightDetailsRef.current.clear();
                  setCredentialDetails({});
                  setCredentialSecrets({});
                  setLoadingSecrets({});
                  fetchCredentials(true);
                }}
                disabled={loading}
                className="self-start sm:self-auto !p-1.5 !h-auto rounded-lg border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-none cursor-pointer"
                title="Refresh credentials"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin text-primary" : ""}
                />
              </CustomButton>
            </div>
          </DialogHeader>

          {/* Top Status & Action Bar */}
          <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                Configured Providers:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isMaxReached
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
              >
                {isMaxReached ? (
                  <CheckCircle2 size={12} className="text-emerald-600" />
                ) : (
                  <Layers size={12} className="text-blue-600" />
                )}
                {credentials.length} / 3 GDS Providers
              </span>
              {isMaxReached && (
                <span className="text-[11px] font-medium text-emerald-600 hidden sm:inline-block">
                  (All GDS providers configured)
                </span>
              )}
            </div>

            {/* Conditionally Render Add Credential Button */}
            {!isMaxReached ? (
              <CustomButton
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenAdd}
                className="text-xs py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={14} />
                <span>Add Credential</span>
              </CustomButton>
            ) : (
              <div className="text-xs text-slate-400 font-medium italic">
                Max 3 providers reached
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <CustomLoader />
                <p className="text-xs text-slate-500 font-medium">
                  Loading client credentials...
                </p>
              </div>
            ) : credentials.length === 0 ? (
              /* Empty State */
              <div className="py-14 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/40">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3.5 shadow-2xs">
                  <KeyRound size={26} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  No Credentials Configured
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                  No GDS API credentials (Amadeus, Galileo, Sabre) have been
                  set up for this client yet.
                </p>
                <CustomButton
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  className="text-xs py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Configure First GDS Provider</span>
                </CustomButton>
              </div>
            ) : (
              /* Accordion List */
              credentials.map((cred) => {
                const providerKey = cred.serviceProvider?.toLowerCase();
                const providerInfo =
                  PROVIDER_MAP[providerKey] || {
                    label: cred.serviceProvider || "Unknown",
                    shortName: cred.serviceProvider || "GDS",
                    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
                    themeColor: "text-slate-600",
                    bgColor: "bg-slate-50",
                    borderClass: "border-slate-200",
                    headerBg: "bg-slate-50",
                  };

                const isExpanded = expandedId === cred.id;
                const detail = credentialDetails[cred.id] || cred;
                const isDetailLoading = Boolean(loadingDetails[cred.id]);

                // Amadeus nested/flat getters
                const amadeusUserId =
                  detail.amadeus?.userId || detail.amadeusUserId;
                const amadeusDefaultOfficeId =
                  detail.amadeus?.defaultOfficeId || detail.amadeusDefaultOfficeId;
                const amadeusOfficeIds =
                  detail.amadeus?.officeIds || detail.amadeusOfficeIds || [];

                // Galileo nested/flat getters
                const galileoSignOn =
                  detail.galileo?.signOn || detail.galileoSignOn;
                const galileoPcc =
                  detail.galileo?.pcc || detail.galileoPcc;

                // Sabre nested/flat getters
                const sabreAgentId =
                  detail.sabre?.agentId || detail.sabreAgentId;
                const sabrePcc =
                  detail.sabre?.pcc || detail.sabrePcc;

                return (
                  <div
                    key={cred.id}
                    className={`border rounded-xl transition-all shadow-2xs bg-white overflow-hidden ${isExpanded
                      ? "border-slate-300 ring-1 ring-slate-200/80"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {/* Accordion Header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggleAccordion(cred.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggleAccordion(cred.id);
                        }
                      }}
                      className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 transition-colors select-none cursor-pointer ${isExpanded ? providerInfo.headerBg : "hover:bg-slate-50/80"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${providerInfo.badgeClass}`}
                        >
                          {providerInfo.shortName.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {providerInfo.label}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {detail.refundType || cred.refundType || "GDS"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                            {cred.createdAt && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} className="text-slate-400" />
                                {new Date(cred.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status badge / toggle */}
                        <StatusToggle
                          isActive={cred.isActive}
                          onToggle={(e) => handleToggleStatus(e, cred)}
                          disabled={actionLoading}
                        />

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(e, cred)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Edit Credential"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeletePrompt(e, cred)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Credential"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Expand/Collapse Chevron */}
                        <div className="p-1 text-slate-400">
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="px-5 py-4 border-t border-slate-100 bg-white space-y-4">
                        {isDetailLoading && !credentialDetails[cred.id] ? (
                          <div className="py-8 flex flex-col items-center justify-center gap-2">
                            <CustomLoader size="sm" />
                            <p className="text-xs text-slate-500 font-medium">
                              Loading {providerInfo.label} details...
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Amadeus Details */}
                            {providerKey === "amadeus" && (
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {/* User ID */}
                                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                      User ID
                                    </label>
                                    <div className="text-xs font-mono font-bold text-slate-800 break-all">
                                      {amadeusUserId || (
                                        <span className="text-slate-400 font-sans italic">
                                          Not set
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Password */}
                                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                      Password
                                    </label>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-mono font-bold text-slate-800">
                                        {showPasswords[`${cred.id}_amadeusPassword`]
                                          ? credentialSecrets[cred.id]?.password || detail.amadeusPassword || "—"
                                          : "••••••••••••"}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          togglePasswordVisibility(
                                            cred.id,
                                            "amadeusPassword"
                                          )
                                        }
                                        disabled={loadingSecrets[`${cred.id}_amadeusPassword`]}
                                        className="text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
                                        title={showPasswords[`${cred.id}_amadeusPassword`] ? "Hide Password" : "View Password"}
                                      >
                                        {loadingSecrets[`${cred.id}_amadeusPassword`] ? (
                                          <RefreshCw size={14} className="animate-spin text-blue-600" />
                                        ) : showPasswords[`${cred.id}_amadeusPassword`] ? (
                                          <EyeOff size={14} />
                                        ) : (
                                          <Eye size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Default Office ID */}
                                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 md:col-span-2">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                      Default Office ID
                                    </label>
                                    <div className="text-xs font-mono font-bold text-blue-700">
                                      {amadeusDefaultOfficeId || (
                                        <span className="text-slate-400 font-sans italic">
                                          Not set
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Office IDs List */}
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                    Associated Office IDs (
                                    {amadeusOfficeIds?.length || 0})
                                  </label>
                                  {Array.isArray(amadeusOfficeIds) &&
                                    amadeusOfficeIds.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {amadeusOfficeIds.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-500">
                                              IATA:
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px] uppercase tracking-wide">
                                              {item.iata || "N/A"}
                                            </span>

                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-500">
                                              Office ID:
                                            </span>
                                            <span className="font-mono font-semibold text-slate-800">
                                              {item.officeId || "—"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                                      No additional office IDs configured.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Galileo Details */}
                            {providerKey === "galileo" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Sign On */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    Sign-On
                                  </label>
                                  <div className="text-xs font-mono font-bold text-slate-800">
                                    {galileoSignOn || (
                                      <span className="text-slate-400 font-sans italic">
                                        Not set
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* PCC */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    PCC (Pseudo City Code)
                                  </label>
                                  <div className="text-xs font-mono font-bold text-amber-700">
                                    {galileoPcc || (
                                      <span className="text-slate-400 font-sans italic">
                                        Not set
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Password */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    Password
                                  </label>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-800">
                                      {showPasswords[`${cred.id}_galileoPassword`]
                                        ? credentialSecrets[cred.id]?.password || detail.galileoPassword || "—"
                                        : "••••••••••••"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        togglePasswordVisibility(
                                          cred.id,
                                          "galileoPassword"
                                        )
                                      }
                                      disabled={loadingSecrets[`${cred.id}_galileoPassword`]}
                                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
                                      title={showPasswords[`${cred.id}_galileoPassword`] ? "Hide Password" : "View Password"}
                                    >
                                      {loadingSecrets[`${cred.id}_galileoPassword`] ? (
                                        <RefreshCw size={14} className="animate-spin text-amber-600" />
                                      ) : showPasswords[
                                        `${cred.id}_galileoPassword`
                                      ] ? (
                                        <EyeOff size={14} />
                                      ) : (
                                        <Eye size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* T-PIN */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    T-PIN
                                  </label>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-800">
                                      {showPasswords[`${cred.id}_galileoTPin`]
                                        ? credentialSecrets[cred.id]?.tPin || detail.galileoTPin || "—"
                                        : "••••"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        togglePasswordVisibility(
                                          cred.id,
                                          "galileoTPin"
                                        )
                                      }
                                      disabled={loadingSecrets[`${cred.id}_galileoTPin`]}
                                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
                                      title={showPasswords[`${cred.id}_galileoTPin`] ? "Hide T-PIN" : "View T-PIN"}
                                    >
                                      {loadingSecrets[`${cred.id}_galileoTPin`] ? (
                                        <RefreshCw size={14} className="animate-spin text-amber-600" />
                                      ) : showPasswords[`${cred.id}_galileoTPin`] ? (
                                        <EyeOff size={14} />
                                      ) : (
                                        <Eye size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Sabre Details */}
                            {providerKey === "sabre" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Agent ID */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    Agent ID
                                  </label>
                                  <div className="text-xs font-mono font-bold text-slate-800">
                                    {sabreAgentId || (
                                      <span className="text-slate-400 font-sans italic">
                                        Not set
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Sabre PCC */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    Sabre PCC
                                  </label>
                                  <div className="text-xs font-mono font-bold text-rose-700">
                                    {sabrePcc || (
                                      <span className="text-slate-400 font-sans italic">
                                        Not set
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Sabre Password */}
                                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                    Sabre Password
                                  </label>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-800">
                                      {showPasswords[`${cred.id}_sabrePassword`]
                                        ? credentialSecrets[cred.id]?.password || detail.sabrePassword || "—"
                                        : "••••••••••••"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        togglePasswordVisibility(
                                          cred.id,
                                          "sabrePassword"
                                        )
                                      }
                                      disabled={loadingSecrets[`${cred.id}_sabrePassword`]}
                                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
                                      title={showPasswords[`${cred.id}_sabrePassword`] ? "Hide Password" : "View Password"}
                                    >
                                      {loadingSecrets[`${cred.id}_sabrePassword`] ? (
                                        <RefreshCw size={14} className="animate-spin text-rose-600" />
                                      ) : showPasswords[`${cred.id}_sabrePassword`] ? (
                                        <EyeOff size={14} />
                                      ) : (
                                        <Eye size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Provider support: Amadeus, Galileo (Travelport), Sabre
            </div>
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs px-4 rounded-lg"
            >
              Close
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Sub-Modal */}
      <AddEditCredentialModal
        isOpen={addEditModalOpen}
        onClose={() => {
          setAddEditModalOpen(false);
          setEditingCredential(null);
        }}
        clientId={clientId}
        clientName={clientName}
        existingCredentials={credentials}
        editingCredential={editingCredential}
        onSuccess={() => {
          credentialDetailsRef.current = {};
          credentialSecretsRef.current = {};
          inFlightDetailsRef.current.clear();
          setCredentialDetails({});
          setCredentialSecrets({});
          setLoadingSecrets({});
          fetchCredentials(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        openConfirmModal={deleteConfirmOpen}
        handleCancel={() => {
          setDeleteConfirmOpen(false);
          setCredentialToDelete(null);
        }}
        handleConfirmation={handleConfirmDelete}
        loading={actionLoading}
        type="warning"
        buttonText="Delete Credential"
        descText={`delete ${credentialToDelete?.serviceProvider?.toUpperCase() || "this"
          } GDS credentials? Applications relying on this service provider will lose integration access.`}
      />
    </>
  );
};

export default ClientCredentialsModal;
