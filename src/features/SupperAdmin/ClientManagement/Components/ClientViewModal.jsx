import React, { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Users,
  MapPin,
  Receipt,
  Edit,
  Sparkles,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import { getClientById } from "@/Services/clientServices";
import { StatusBadge } from "@/utils/statusUtils";
import { formatNumberWithCommas, formatCurrencyAmount } from "@/utils/numberFormat";

const ClientViewModal = ({
  isOpen = false,
  onClose,
  client = null,
  onEdit,
}) => {
  const [clientDetail, setClientDetail] = useState(client);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setClientDetail(client);
      const fetchFreshClient = async () => {
        try {
          setLoading(true);
          const clientId = client.id || client._id;
          const res = await getClientById(clientId);
          if (res?.status === 200 || res?.status === 201) {
            setClientDetail(res?.data?.data || res?.data || client);
          }
        } catch (error) {
          console.warn("Error fetching client by ID for view:", error);
          setClientDetail(client);
        } finally {
          setLoading(false);
        }
      };

      fetchFreshClient();
    }
  }, [isOpen, client]);

  if (!clientDetail && !client) return null;

  const activeClient = clientDetail || client;
  const isActive =
    activeClient?.isActive ??
    (activeClient?.status === "active" || activeClient?.status === "Active");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] max-h-[85vh] flex flex-col rounded-3xl p-6 bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1.5px] z-50 flex flex-col items-center justify-center gap-2 rounded-3xl">
            <CustomLoader className="relative" size={14} />
            <span className="text-xs font-semibold text-slate-600 animate-pulse">
              Loading travel agent details...
            </span>
          </div>
        )}
        <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {activeClient?.clientName || activeClient?.name || "Travel Agent Details"}
                </DialogTitle>
                {/* <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Travel Agent ID:{" "}
                  <span className="font-mono text-slate-700">
                    {activeClient?.id || activeClient?._id || "N/A"}
                  </span>
                </DialogDescription> */}
              </div>
            </div>

            {/* Status and GSA Badges */}
            <div className="flex flex-col items-end gap-1.5 pt-1 mr-5">
              <StatusBadge status={isActive ? "active" : "inactive"} />

              {activeClient?.isGsaConsultant && (
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  GSA Consultant
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {activeClient && (
          <div className="space-y-4 overflow-y-auto pr-1 text-xs flex-1 my-2">
            {/* Quick Contact & Action Buttons */}
            {activeClient.websiteUrl && <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {/* {activeClient.pocEmail && (
                <a
                  href={`mailto:${activeClient.pocEmail}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:text-blue-600 hover:border-blue-300 transition"
                >
                  <Mail size={13} className="text-slate-400" />
                  <span>Email POC</span>
                </a>
              )} */}
              {/* {activeClient.pocMobile && (
                <a
                  href={`tel:${activeClient.pocMobile}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:text-emerald-600 hover:border-emerald-300 transition"
                >
                  <Phone size={13} className="text-slate-400" />
                  <span>Call POC</span>
                </a>
              )} */}
              {activeClient.websiteUrl && (
                <a
                  href={
                    activeClient.websiteUrl.startsWith("http")
                      ? activeClient.websiteUrl
                      : `https://${activeClient.websiteUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:text-primary hover:border-primary/40 transition"
                >
                  <Globe size={13} className="text-slate-400" />
                  <span>Visit Website</span>
                  <ExternalLink size={11} className="text-slate-400" />
                </a>
              )}
            </div>}

            {/* Point of Contact Section */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                <Users size={14} className="text-emerald-600" />
                Point of Contact
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Contact Name
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {activeClient.pocName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Official Email
                  </span>
                  <span className="font-medium text-slate-800 break-all">
                    {activeClient.pocEmail || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Mobile Number
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.pocMobile || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Billing Currency
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                    {(activeClient.currency || "INR").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Address & Location Section */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                <MapPin size={14} className="text-amber-600" />
                Office Location & Address
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Country
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.country || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    State / Province
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.state || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    City
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.city || "N/A"}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Full Street Address
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Taxation & Business Rules */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                <Receipt size={14} className="text-purple-600" />
                Taxation & Regulatory
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Taxable Client
                  </span>
                  <span
                    className={`font-semibold ${activeClient.isTaxable
                      ? "text-emerald-600"
                      : "text-slate-500"
                      }`}
                  >
                    {activeClient.isTaxable ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Tax Regime / Name
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeClient.taxName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Tax ID / GSTIN
                  </span>
                  <span className="font-mono text-slate-800">
                    {activeClient.taxIdNo || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational & Processing Statistics */}
            {activeClient.stats && (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <Database size={14} className="text-blue-600" />
                  Operational Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Total Data
                    </span>
                    <span className="font-bold text-slate-800 text-sm font-mono">
                      {formatNumberWithCommas(activeClient.stats.totalData)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Checked
                    </span>
                    <span className="font-bold text-blue-600 text-sm font-mono">
                      {formatNumberWithCommas(activeClient.stats.totalChecked)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Refunded
                    </span>
                    <span className="font-bold text-emerald-600 text-sm font-mono">
                      {formatNumberWithCommas(activeClient.stats.totalRefunded)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Amount Refunded
                    </span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {formatCurrencyAmount(
                        activeClient.stats.totalAmountRefunded,
                        activeClient.currency
                      )}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Rejected
                    </span>
                    <span className="font-bold text-rose-600 text-sm font-mono">
                      {formatNumberWithCommas(activeClient.stats.totalDataRejected)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* System Audit Information */}
            {(activeClient.createdAt || activeClient.updatedAt) && (
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 px-1">
                {activeClient.createdAt && (
                  <span>
                    Created: {new Date(activeClient.createdAt).toLocaleString()}
                  </span>
                )}
                {activeClient.updatedAt && (
                  <span>
                    Updated: {new Date(activeClient.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between shrink-0">
          {onEdit ? (
            <CustomButton
              variant="outline"
              onClick={() => {
                const clientToEdit = activeClient;
                onClose();
                if (clientToEdit) onEdit(clientToEdit);
              }}
              className="gap-1.5"
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </CustomButton>
          ) : (
            <div />
          )}

          <CustomButton
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientViewModal;
