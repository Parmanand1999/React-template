import {
  Badge,
  ChevronRight,
  Delete,
  Eye,
  UserMinus,
  LockIcon,
  MoreVertical,
  Navigation,
  History,
  Pencil,
  PenIcon,
  Phone,
  PhoneCall,
  Trash,
  Trash2,
  UnlockIcon,
  UserPlus,
  UserRound,
  Edit,
  ActivitySquare,
  Globe,
  ExternalLink,
  MapPin,
  KeyRound,
  Building2,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Layers,
  UserCheck,
  Send,
  ClipboardCheck,
  MessageSquareText,
  Server,
  Cpu,
  Monitor,
  Radio,
  Copy,
  Check,
  Key,
} from "lucide-react";
import CustomButton from "../Buttons/CustomButton";
import { Tooltip } from "../Tooltip";
import { getStatusBadgeConfig, StatusBadge } from "@/utils/statusUtils";
import { getMonthName } from "@/constants/batchConstants";
import { formatDate } from "@/utils/formatDate";

// import { Eye, Edit, Trash2, UserPlus,  } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { MdResetTv } from "react-icons/md";
import { convertMinutes } from "@/utils/convertMinutes";
import { formatNumberWithCommas, formatCurrencyAmount } from "@/utils/numberFormat";


export const DashboardColumn = () => [
  {
    accessorKey: "caseId",
    header: "CASE ID",
    cell: ({ row }) => (
      <span className="text-blue-600 font-medium cursor-pointer">
        {row.original.caseId}
      </span>
    ),
  },

  {
    accessorKey: "clientName",
    header: "CLIENT NAME",
  },

  {
    accessorKey: "verificationType",
    header: "VERIFICATION TYPE",
  },

  {
    accessorKey: "aging",
    header: "AGING (DAYS)",
    cell: ({ row }) => {
      const value = row.original.aging;

      // dynamic color
      let color = "bg-gray-200 text-gray-700";
      if (value <= 3) color = "bg-yellow-100 text-yellow-700";
      if (value >= 4) color = "bg-red-100 text-red-600";

      return (
        <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
          {value} Days
        </span>
      );
    },
  },

  {
    accessorKey: "assignedTo",
    header: "ASSIGNED TO",
  },

  {
    id: "action",
    header: "ACTION",
    cell: () => (
      <ChevronRight className="cursor-pointer text-gray-400" size={18} />
    ),
  },
];

// Employee Management Columns matching backend GET /api/v1/users response
export const employeeColumns = (onView, onEdit, onToggleStatus, onResetPassword, onDelete, isAdmin = true) => [
  {
    accessorKey: "name",
    header: "EMPLOYEE NAME",
    cell: ({ row }) => {
      const isActive =
        row.original.isActive === "active"
      return (
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive
              ? "bg-emerald-500 ring-2 ring-emerald-100"
              : "bg-rose-500 ring-2 ring-rose-100"
              }`}
            title={isActive ? "Active" : "Inactive"}
          />
          <span className="font-semibold text-slate-800 text-sm">
            {row.original.name || "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "roleId",
    header: "ROLE",
    cell: ({ row }) => {
      const roleName =
        row.original.role?.displayName ||
        row.original.role?.name ||
        row.original.roleName ||
        (row.original.isSuperAdmin ? "Super Admin" : "Employee");
      return (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {roleName}
        </span>
      );
    },
  },
  {
    accessorKey: "refundType",
    header: "REFUND TYPE",
    cell: ({ row }) => {
      const types = Array.isArray(row.original.refundType)
        ? row.original.refundType
        : [row.original.refundType || "gds"];

      const hasGds = types.some((t) => t?.toLowerCase() === "gds");
      const hasLcc = types.some((t) => t?.toLowerCase() === "lcc");

      return (
        <div className="flex items-center gap-1.5 font-bold text-xs">
          {hasGds && <span className="text-blue-600">GDS</span>}
          {hasGds && hasLcc && <span className="text-slate-400">+</span>}
          {hasLcc && <span className="text-amber-500">LCC</span>}
          {!hasGds && !hasLcc && (
            <span className="text-slate-400">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "LAST LOGIN",
    cell: ({ row }) => {
      const lastLogin = row.original.lastLoginAt;
      return (
        <span className="text-xs text-slate-600 font-medium">
          {lastLogin ? new Date(lastLogin).toLocaleDateString() : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "addedBy",
    header: "ADDED BY",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600 font-normal truncate max-w-[120px] block">
        {row?.original?.addedBy?.name || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "addedOn",
    header: "ADDED ON",
    cell: ({ row }) => {
      const added = row.original.addedOn || row.original.createdAt;
      return (
        <span className="text-xs text-slate-600 font-normal">
          {added ? new Date(added).toLocaleDateString() : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "ACTION",
    cell: function ActionCell({ row }) {
      const [isPopoverOpen, setIsPopoverOpen] = useState(false);
      const isActive =
        row.original.isActive ??
        (row.original.status === "active" || row.original.status === "Active");

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView && onView(row.original)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
          >
            View Details
          </button>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-1 bg-white shadow-xl rounded-xl border border-slate-200 z-50"
            >
              <div className="flex flex-col gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onView && onView(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <Eye size={14} className="text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onEdit && onEdit(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <Edit size={14} className="text-slate-500" />
                  <span>Edit Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onToggleStatus && onToggleStatus(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <ActivitySquare size={14} className="text-slate-500" />
                  <span>{isActive ? "Deactivate" : "Activate"}</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      onResetPassword && onResetPassword(row.original);
                    }}
                    className="flex items-center gap-2 text-left font-medium text-amber-700 hover:bg-amber-50 p-2 rounded-lg transition cursor-pointer"
                  >
                    <LockIcon size={14} className="text-amber-500" />
                    <span>Reset Password</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 my-0.5" />

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onDelete && onDelete(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                >
                  <Trash size={14} className="text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

// Client Management Columns for GET /api/v1/clients response
export const clientColumns = (onView, onEdit, onToggleStatus, onDelete, onManageCredentials) => [
  {
    accessorKey: "clientName",
    header: "AGENCY NAME",
    cell: ({ row }) => {
      const isActive =
        row.original.isActive ??
        (row.original.status === "active" || row.original.status === "Active");
      const clientName =
        row.original.clientName || row.original.name || "Unnamed Agency";
      const createdAt =
        row.original.stats?.createdAt || row.original.createdAt;

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive === "active" || isActive === "Active"
                ? "bg-emerald-500 ring-2 ring-emerald-100"
                : "bg-rose-500 ring-2 ring-rose-100"
                }`}
              title={isActive === "active" ? "active" : "inactive"}
            />
            <button
              type="button"
              onClick={() => onView && onView(row.original)}
              className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors text-left truncate max-w-[220px] cursor-pointer"
            >
              {clientName}
            </button>
          </div>
          {createdAt && (
            <span className="text-[11px] text-slate-400 pl-4.5">
              Registered:{" "}
              {new Date(createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalData",
    header: "TOTAL DATA",
    cell: ({ row }) => {
      const val = row.original.stats?.totalData ?? 0;
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/60 font-mono">
          {formatNumberWithCommas(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "totalChecked",
    header: "CHECKED DATA",
    cell: ({ row }) => {
      const val = row.original.stats?.totalChecked ?? 0;
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
          {formatNumberWithCommas(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "totalRefunded",
    header: "REFUNDED DATA",
    cell: ({ row }) => {
      const val = row.original.stats?.totalRefunded ?? 0;
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
          {formatNumberWithCommas(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "totalAmountRefunded",
    header: "AMOUNT REFUNDED",
    cell: ({ row }) => {
      const raw = row.original.stats?.totalAmountRefunded ?? "0.00";
      const currency = row.original.currency;
      return (
        <span className="font-bold text-slate-800 text-xs font-mono">
          {formatCurrencyAmount(raw, currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "totalDataRejected",
    header: "REJECTED DATA",
    cell: ({ row }) => {
      const val = row.original.stats?.totalDataRejected ?? 0;
      const numVal = Number(val) || 0;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono ${numVal > 0
            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
            : "bg-slate-50 text-slate-500 border border-slate-200/60"
            }`}
        >
          {formatNumberWithCommas(val)}
        </span>
      );
    },
  },
  // {
  //   accessorKey: "isActive",
  //   header: "STATUS",
  //   cell: ({ row }) => {
  //     const isActive =
  //       row.original.isActive ??
  //       (row.original.status === "active" || row.original.status === "Active");
  //     return (
  //       <span
  //         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
  //           isActive
  //             ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
  //             : "bg-rose-50 text-rose-700 border border-rose-200"
  //         }`}
  //       >
  //         <span
  //           className={`w-1.5 h-1.5 rounded-full ${
  //             isActive ? "bg-emerald-500" : "bg-rose-500"
  //           }`}
  //         />
  //         {isActive ? "Active" : "Inactive"}
  //       </span>
  //     );
  //   },
  // },
  {
    id: "actions",
    header: "ACTION",
    cell: function ActionCell({ row }) {
      const [isPopoverOpen, setIsPopoverOpen] = useState(false);
      const isActive =
        row.original.isActive ??
        (row.original.status === "active" || row.original.status === "Active");

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView && onView(row.original)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
          >
            View Details
          </button>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-44 p-1 bg-white shadow-xl rounded-xl border border-slate-200 z-50"
            >
              <div className="flex flex-col gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onView && onView(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <Eye size={14} className="text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onEdit && onEdit(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <Edit size={14} className="text-slate-500" />
                  <span>Edit Travel Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onToggleStatus && onToggleStatus(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <ActivitySquare size={14} className="text-slate-500" />
                  <span>{isActive ? "Deactivate" : "Activate"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onManageCredentials && onManageCredentials(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                >
                  <KeyRound size={14} className="text-amber-500" />
                  <span>Manage Credentials</span>
                </button>

                <div className="h-px bg-slate-100 my-0.5" />

                <button
                  type="button"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onDelete && onDelete(row.original);
                  }}
                  className="flex items-center gap-2 text-left font-medium text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                >
                  <Trash size={14} className="text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

// Batch Management Columns for GET /api/v1/batches response
export const batchColumns = (
  onViewOrHandlers,
  onViewEntriesArg,
  onAssignArg,
  onSendToReviewArg,
  onReviewArg,
  onAddRemarkArg,
  onDeleteArg,
  onProcessArg
) => {
  const handlers =
    typeof onViewOrHandlers === "object" && onViewOrHandlers !== null
      ? onViewOrHandlers
      : {
        onView: onViewOrHandlers,
        onViewEntries: onViewEntriesArg,
        onAssign: onAssignArg,
        onSendToReview: onSendToReviewArg,
        onReview: onReviewArg,
        onAddRemark: onAddRemarkArg,
        onDelete: onDeleteArg,
        onProcess: onProcessArg,
      };

  const {
    onView,
    onViewEntries,
    onAssign,
    onSendToReview,
    onReview,
    onAddRemark,
    onDelete,
    onProcess,
    onDispatch,
    onViewAuditLogs,
    onAuditLogs,
  } = handlers;

  const handleProcess = onProcess || onDispatch;
  const handleAuditLogs = onViewAuditLogs || onAuditLogs;

  return [
    {
      accessorKey: "batchNumber",
      header: "BATCH #",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView && onView(row.original)}
            className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold text-xs shrink-0 transition cursor-pointer w-[120px]"
            title="Click to view batch details"
          >
            {row.original.batchNumber || row.index + 1}
          </button>
        </div>
      ),
    },
    {
      accessorKey: "client.name",
      header: "CLIENT",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-blue-500 shrink-0" />
          <span className="font-semibold text-xs text-slate-900 truncate max-w-[130px]">
            {row.original.client?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "refundType",
      header: "REFUND TYPE",
      cell: ({ row }) => {
        console.log(row.original.refundType);
        const type = (row.original.refundType || "").toLowerCase();
        const isGds = type === "gds";
        return (
          <>
            {/* <Badge
            className={`text-[11px] font-bold px-2 py-0.5 uppercase ${isGds
              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              }`}
          >

          </Badge> */}
            <span className="font-semibold text-xs text-slate-900 truncate max-w-[130px]">
              {row.original.refundType || "N/A"}
            </span >
          </>

        );
      },
    },
    {
      accessorKey: "serviceProvider",
      header: "PROVIDER / AIRLINE",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 capitalize">
            {row.original.serviceProvider || "—"}
          </span>
          {row.original.airline && (
            <span className="block text-[11px] text-slate-400 capitalize">
              {row.original.airline}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "period",
      header: "PERIOD",
      cell: ({ row }) => {
        const m = getMonthName(row.original.batchMonth);
        const y = row.original.batchYear || "";
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Calendar size={13} className="text-indigo-500 shrink-0" />
            <span>
              {m} {y}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "originalFileName",
    //   header: "FILE",
    //   cell: ({ row }) => (
    //     <div
    //       className="flex items-center gap-1.5 text-xs text-slate-700 max-w-[150px] truncate"
    //       title={row.original.originalFileName}
    //     >
    //       <FileSpreadsheet size={15} className="text-emerald-600 shrink-0" />
    //       <span className="truncate">{row.original.originalFileName || "—"}</span>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "records",
      header: "RECORDS PROGRESS",
      cell: ({ row }) => {
        const tot = Number(row.original.totalData) || 0;
        const chk = Number(row.original.dataChecked) || 0;
        const ref = Number(row.original.dataRefunded) || 0;
        const rej = Number(row.original.dataRejected) || 0;

        const chkPct = tot > 0 ? Math.round((chk / tot) * 100) : 0;
        const refPct = tot > 0 ? Math.round((ref / tot) * 100) : 0;
        const rejPct = tot > 0 ? Math.round((rej / tot) * 100) : 0;

        const tooltipTitle = `Total Data: ${tot.toLocaleString()}\nChecked: ${chk.toLocaleString()} (${chkPct}%)\nRefunded: ${ref.toLocaleString()} (${refPct}%)\nRejected: ${rej.toLocaleString()} (${rejPct}%)`;

        return (
          <div className="space-y-1.5 py-0.5 cursor-help min-w-[170px]" title={tooltipTitle}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                {chkPct}% chk
              </span>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                {refPct}% ref
              </span>
              {rejPct > 0 && (
                <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                  {rejPct}% rej
                </span>
              )}
            </div>

            {/* Segmented multi-color progress bar */}
            {tot > 0 ? (
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-2xs">
                <div
                  style={{ width: `${chkPct}%` }}
                  className="bg-blue-500 transition-all duration-300"
                  title={`Checked: ${chk.toLocaleString()} (${chkPct}%)`}
                />
                <div
                  style={{ width: `${refPct}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`Refunded: ${ref.toLocaleString()} (${refPct}%)`}
                />
                <div
                  style={{ width: `${rejPct}%` }}
                  className="bg-rose-500 transition-all duration-300"
                  title={`Rejected: ${rej.toLocaleString()} (${rejPct}%)`}
                />
              </div>
            ) : (
              <div className="h-1.5 w-full rounded-full bg-slate-100" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amountRefunded",
      header: "AMOUNT REFUNDED",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
          <DollarSign size={13} />
          <span>{row.original.amountRefunded || "0.00"}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "assignmentStatus",
      header: "ASSIGNMENT",
      cell: ({ row }) => (
        <span className="text-[11px] font-semibold text-slate-600 capitalize px-2 py-0.5 bg-slate-100 rounded-md">
          {row.original.assignmentStatus || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "UPLOADED",
      cell: ({ row }) => (
        <div className="text-xs text-slate-600">
          <span className="block font-medium">
            {formatDate(row.original.createdAt, "dd-MM-yyyy")}
          </span>
          <span className="text-[10px] text-slate-400">
            by {row.original.uploadedBy?.name || "Admin"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: function BatchActionCell({ row }) {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (onViewEntries) {
                  onViewEntries(row.original);
                } else if (onView) {
                  onView(row.original);
                }
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer flex items-center gap-1"
            >
              <span>View Entries</span>
              <ChevronRight size={13} />
            </button>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="More options"
                  title="Batch Actions"
                >
                  <MoreVertical size={15} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 p-1 bg-white shadow-xl rounded-xl border border-slate-200 z-50"
              >
                <div className="flex flex-col gap-0.5 text-xs">
                  {/* {onView && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      onView(row.original);
                    }}
                    className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                  >
                    <Eye size={14} className="text-slate-500" />
                    <span>View Details</span>
                  </button>
                )} */}

                  {handleProcess && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        handleProcess(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition cursor-pointer"
                    >
                      <Cpu size={14} className="text-indigo-600" />
                      <span>Process Batch</span>
                    </button>
                  )}

                  {onAssign && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onAssign(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <UserCheck size={14} className="text-blue-600" />
                      <span>Assign Batch</span>
                    </button>
                  )}

                  {onSendToReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onSendToReview(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <Send size={14} className="text-indigo-600" />
                      <span>Send to Review</span>
                    </button>
                  )}

                  {onReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onReview(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <ClipboardCheck size={14} className="text-emerald-600" />
                      <span>Review Batch</span>
                    </button>
                  )}

                  {onAddRemark && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onAddRemark(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <MessageSquareText size={14} className="text-purple-600" />
                      <span>Add Remark</span>
                    </button>
                  )}

                  {handleAuditLogs && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        handleAuditLogs(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <History size={14} className="text-amber-600" />
                      <span>Audit Logs</span>
                    </button>
                  )}

                  {onDelete && (
                    <>
                      <div className="h-px bg-slate-100 my-0.5" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          onDelete(row.original);
                        }}
                        className="flex items-center gap-2 text-left font-medium text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                      >
                        <Trash size={14} className="text-rose-500" />
                        <span>Delete Batch</span>
                      </button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];
};

// Batch Entries Columns for GET /api/v1/batches/:batchId/entries
export const batchEntryColumns = (pageIndex = 1, pageSize = 20) => [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500">
        {(pageIndex - 1) * pageSize + row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "ticket",
    header: "TICKET",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-xs text-slate-900 font-mono tracking-tight">
          {row.original.ticket || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "airlineCode",
    header: "AIRLINE CODE",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
        {row.original.airlineCode || "—"}
      </span>
    ),
  },
  {
    accessorKey: "iata",
    header: "IATA",
    cell: ({ row }) => (
      <span className="text-xs text-slate-700 font-medium">
        {row.original.iata || "—"}
      </span>
    ),
  },
  {
    accessorKey: "officeId",
    header: "OFFICE ID",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">
        {row.original.officeId || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "scrapingStatus",
    header: "SCRAPING STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.scrapingStatus} />,
  },
  {
    accessorKey: "parsingStatus",
    header: "PARSING STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.parsingStatus} />,
  },
  {
    accessorKey: "refundCheckedOn",
    header: "REFUND CHECKED ON",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">
        {row.original.refundCheckedOn
          ? formatDate(row.original.refundCheckedOn, "dd-MM-yyyy HH:mm")
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "assignedTo",
    header: "ASSIGNED TO",
    cell: ({ row }) => {
      const assigned =
        row.original.assignedTo?.name ||
        row.original.assignedTo ||
        row.original.assignedToUserId;
      return (
        <span className="text-xs text-slate-600">
          {assigned || "Unassigned"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "CREATED AT",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600 font-medium">
        {row.original.createdAt
          ? formatDate(row.original.createdAt, "dd-MM-yyyy HH:mm")
          : "—"}
      </span>
    ),
  },
];

// Utility Machine Columns for GET /api/v1/machines response
export const machineColumns = (
  onView,
  onToggleStatus,
  onDelete
) => [
    {
      accessorKey: "machineCode",
      header: "MACHINE CODE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView && onView(row.original)}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 transition cursor-pointer border border-indigo-200/60"
            title="Click to view machine details"
          >
            {row.original.machineCode || "N/A"}
          </button>
        </div>
      ),
    },
    {
      accessorKey: "hostName",
      header: "HOSTNAME",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Server size={14} />
          </div>
          <div className="min-w-0">
            <span
              className="font-semibold text-xs text-slate-900 truncate block max-w-[140px]"
              title={row.original.hostName}
            >
              {row.original.hostName || "—"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {row.original.ipAddress || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isOnline",
      header: "CONNECTIVITY",
      cell: ({ row }) => {
        const isOnline = Boolean(row.original.isOnline);
        const state = row.original.reportedState || "idle";
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOnline
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isOnline
                  ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200"
                  : "bg-slate-400"
                  }`}
              />
              <span>{isOnline ? "Online" : "Offline"}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium capitalize">
              {state}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "enabledModules",
      header: "ENABLED MODULES",
      cell: ({ row }) => {
        const modules = Array.isArray(row.original.enabledModules)
          ? row.original.enabledModules
          : [];
        if (modules.length === 0) {
          return <span className="text-slate-400 text-xs italic">None</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
            {modules.map((mod) => (
              <span
                key={mod}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${mod?.toLowerCase() === "amadeus"
                  ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                  : mod?.toLowerCase() === "indigo"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                    : "bg-purple-50 text-purple-700 border border-purple-200/80"
                  }`}
              >
                {mod}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "osPlatform",
      header: "OS & UTILITY",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block capitalize">
            {row.original.osPlatform || "—"}{" "}
            {row.original.osVersion ? `(${row.original.osVersion})` : ""}
          </span>
          <span className="text-[11px] text-slate-400 block font-medium">
            v{row.original.utilityVersion || "1.0.0"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "hardwareId",
      header: "HARDWARE ID",
      cell: ({ row }) => {
        const hwId = row.original.hardwareId || "—";
        return (
          <span
            className="font-mono text-xs text-slate-600 truncate block max-w-[130px]"
            title={hwId}
          >
            {hwId}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "STATUS",
      cell: ({ row }) => {
        const isActive = row.original.isActive === "active";
        return (
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(row.original)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition ${isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              }`}
            title="Click to toggle status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
            />
            <span className="capitalize">{row.original.isActive || "inactive"}</span>
          </button>
        );
      },
    },
    {
      accessorKey: "lastSeenAt",
      header: "LAST SEEN",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 block">
          {row.original.lastSeenAt
            ? formatDate(row.original.lastSeenAt, "dd-MM-yyyy HH:mm")
            : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: function MachineActionCell({ row }) {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const isActive = row.original.isActive === "active";

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onView && onView(row.original)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer flex items-center gap-1"
            >
              <span>View Details</span>
              <ChevronRight size={13} />
            </button>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="More options"
                  title="Machine Actions"
                >
                  <MoreVertical size={15} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 p-1 bg-white shadow-xl rounded-xl border border-slate-200 z-50"
              >
                <div className="flex flex-col gap-0.5 text-xs">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onView(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <Eye size={14} className="text-slate-500" />
                      <span>View Details</span>
                    </button>
                  )}

                  {onToggleStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        onToggleStatus(row.original);
                      }}
                      className="flex items-center gap-2 text-left font-medium text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition cursor-pointer"
                    >
                      <ActivitySquare size={14} className="text-amber-500" />
                      <span>
                        {isActive ? "Deactivate Machine" : "Activate Machine"}
                      </span>
                    </button>
                  )}

                  {onDelete && (
                    <>
                      <div className="h-px bg-slate-100 my-0.5" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          onDelete(row.original);
                        }}
                        className="flex items-center gap-2 text-left font-medium text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                      >
                        <Trash size={14} className="text-rose-500" />
                        <span>Delete Machine</span>
                      </button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
  ];

// Registration Tokens Columns for GET /api/v1/machines/registration-tokens
export const registrationTokenColumns = (onDeleteOrHandlers, onCopyTokenArg) => {
  const handlers =
    typeof onDeleteOrHandlers === "object" && onDeleteOrHandlers !== null
      ? onDeleteOrHandlers
      : {
          onDelete: onDeleteOrHandlers,
          onCopyToken: onCopyTokenArg,
        };

  const { onDelete } = handlers;

  return [
    {
      accessorKey: "label",
      header: "LABEL",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Key size={14} />
          </div>
          <span className="font-bold text-xs text-slate-900 truncate max-w-[160px]">
            {row.original.label || "Unnamed Token"}
          </span>
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const s = (row.original.status || "pending").toLowerCase();
        let badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
        if (s === "used") {
          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        } else if (s === "expired") {
          badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
        } else if (s === "revoked") {
          badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${badgeClass}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: "EXPIRES AT",
      cell: ({ row }) => {
        const exp = row.original.expiresAt;
        const isPast = exp ? new Date(exp) < new Date() : false;
        return (
          <div className="text-xs">
            <span
              className={`block font-medium ${
                isPast ? "text-rose-500" : "text-slate-700"
              }`}
            >
              {exp ? formatDate(exp, "dd-MM-yyyy HH:mm") : "—"}
            </span>
            {row.original.expiresInHours && (
              <span className="text-[10px] text-slate-400">
                ({row.original.expiresInHours} hrs duration)
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "ISSUED ON",
      cell: ({ row }) => (
        <div className="text-xs text-slate-600">
          <span className="block font-medium">
            {formatDate(row.original.createdAt, "dd-MM-yyyy HH:mm")}
          </span>
          <span className="text-[10px] text-slate-400">
            by {row.original.createdBy?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "usedBy",
      header: "USED BY / MACHINE",
      cell: ({ row }) => {
        const usedByMachine =
          row.original.machine?.hostName ||
          row.original.usedByMachine ||
          row.original.usedBy?.name ||
          (row.original.usedAt ? formatDate(row.original.usedAt, "dd-MM-yyyy HH:mm") : null);
        return (
          <span className="text-xs text-slate-600">
            {usedByMachine ? (
              <span className="font-medium text-slate-800">
                {usedByMachine}
              </span>
            ) : (
              <span className="text-slate-400 italic">Not redeemed yet</span>
            )}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "ACTION",
      cell: function TokenActionCell({ row }) {
        return (
          <div className="flex items-center gap-1.5">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(row.original)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 rounded-lg transition cursor-pointer"
                title="Delete registration token"
              >
                <Trash size={13} className="text-rose-500" />
                <span>Delete</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];
};




