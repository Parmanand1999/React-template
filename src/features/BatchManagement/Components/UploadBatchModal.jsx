import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Loader2,
  Calendar,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import CustomButton from "@/components/common/Buttons/CustomButton";
import SearchableSelect from "@/components/common/DropdownSelect/SearchableSelect";
import { getClientsList } from "@/Services/clientServices";
import { uploadBatch } from "@/Services/batchServices";

import {
  AIRLINE_OPTIONS,
  REFUND_TYPE_OPTIONS,
  SERVICE_PROVIDER_OPTIONS,
  getMonthName,
} from "@/constants/batchConstants";

import {
  uploadBatchSchema,
  defaultUploadBatchValues,
} from "./uploadBatchSchema";

const UploadBatchModal = ({ isOpen, onClose, onSuccess }) => {
  // UI States
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // react-hook-form integration with Zod resolver
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadBatchSchema),
    defaultValues: defaultUploadBatchValues,
    mode: "onTouched",
  });

  const refundType = watch("refundType");
  const batchMonth = watch("batchMonth");
  const batchYear = watch("batchYear");
  const selectedFile = watch("file");

  // Fetch Clients for Searchable Dropdown
  useEffect(() => {
    if (!isOpen) return;
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const res = await getClientsList("limit=100&isActive=active");
        if (res?.data?.success) {
          const clientItems = res.data.data?.items || [];
          setClients(
            clientItems.map((c) => ({
              label: c.clientName || c.name || "Client",
              value: c.id,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch clients for batch upload", err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [isOpen]);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      reset(defaultUploadBatchValues);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, reset]);

  // Validate and set Excel File (.xlsx only)
  const handleValidateAndSetFile = (file) => {
    if (!file) return;

    const fileName = file.name || "";
    const isXlsxExt = fileName.toLowerCase().endsWith(".xlsx");

    if (!isXlsxExt) {
      toast.error("Invalid file format! Only .xlsx files are allowed.");
      setError("file", {
        type: "manual",
        message: "Only Excel (.xlsx) files are supported.",
      });
      return;
    }

    clearErrors("file");
    setValue("file", file, { shouldValidate: true });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateAndSetFile(file);
    }
    // reset input so same file can be re-selected if removed
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    setValue("file", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleRefundTypeChange = (e) => {
    const val = e.target.value;
    setValue("refundType", val, { shouldValidate: true });
    if (val === "gds") {
      setValue("airline", "");
      clearErrors("airline");
      setValue("serviceProvider", "amadeus", { shouldValidate: true });
    } else if (val === "lcc") {
      setValue("serviceProvider", "");
      clearErrors("serviceProvider");
      setValue("airline", "indigo", { shouldValidate: true });
    }
  };

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("clientId", values.clientId);
    formData.append("refundType", values.refundType);

    // Conditional: GDS -> serviceProvider, LCC -> airline
    if (values.refundType === "gds") {
      formData.append("serviceProvider", values.serviceProvider);
    } else if (values.refundType === "lcc") {
      formData.append("airline", values.airline);
    }

    formData.append("batchMonth", values.batchMonth);
    formData.append("batchYear", values.batchYear);

    try {
      setSubmitting(true);
      setUploadProgress(10);

      const response = await uploadBatch(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        }
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "Batch uploaded successfully!");
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(response?.data?.message || "Failed to upload batch.");
      }
    } catch (err) {
      console.error("Batch upload failed:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "An error occurred while uploading batch.";
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] rounded-3xl p-6 bg-white overflow-hidden shadow-2xl border border-slate-100 z-50">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UploadCloud size={20} />
            </span>
            <span>Upload New Batch</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Upload an Excel (.xlsx) batch file and configure client, provider, and period parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 h-[70vh] overflow-y-auto">
          {/* Row 1: Client Selector */}
          <div>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Client"
                  required
                  placeholder={
                    loadingClients
                      ? "Loading clients..."
                      : "Search & Select Client"
                  }
                  options={clients}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  error={errors.clientId?.message}
                />
              )}
            />
          </div>

          {/* Row 2: Refund Type & Dynamic Dependent Field (Service Provider for GDS, Airline for LCC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Refund Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("refundType")}
                onChange={handleRefundTypeChange}
                className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                {REFUND_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.refundType && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.refundType.message}
                </p>
              )}
            </div>

            {/* If GDS: Show Service Provider */}
            {refundType === "gds" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Service Provider <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("serviceProvider")}
                  className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition capitalize"
                >
                  <option value="">Select Service Provider</option>
                  {SERVICE_PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.serviceProvider && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.serviceProvider.message}
                  </p>
                )}
              </div>
            )}

            {/* If LCC: Show Airline */}
            {refundType === "lcc" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Airline <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("airline")}
                  className="custom-select w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition capitalize"
                >
                  <option value="">Select Airline</option>
                  {AIRLINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.airline && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.airline.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Calendar Period Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>
                  Batch Period (Month & Year){" "}
                  <span className="text-rose-500">*</span>
                </span>

              </label>
              <div className="relative">
                <input
                  type="month"
                  value={
                    batchYear && batchMonth
                      ? `${batchYear}-${String(batchMonth).padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const [y, m] = val.split("-");
                      setValue("batchYear", y, { shouldValidate: true });
                      setValue("batchMonth", String(parseInt(m, 10)), {
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="w-full h-9 px-3 pl-9 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                />
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Selected:{" "}
                <strong className="text-slate-800">
                  {getMonthName(batchMonth)} {batchYear}
                </strong>
              </p>
              {(errors.batchMonth || errors.batchYear) && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.batchMonth?.message || errors.batchYear?.message}
                </p>
              )}
            </div>
          </div>

          {/* Sample Templates Download Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Sample Templates
                </p>
                <p className="text-[11px] text-slate-500">
                  Download sample file format and fill your data accordingly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/samples/gds_refund_sample.xlsx"
                download="gds_refund_sample.xlsx"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border shadow-2xs transition-colors cursor-pointer ${refundType === "gds"
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                  : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  }`}
                title="Download GDS Refund Sample Excel File"
              >
                <Download size={13} />
                <span>GDS Refund Sample</span>
              </a>
              <a
                href="/samples/lcc_refund_sample.xlsx"
                download="lcc_refund_sample.xlsx"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border shadow-2xs transition-colors cursor-pointer ${refundType === "lcc"
                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  }`}
                title="Download LCC Refund Sample Excel File"
              >
                <Download size={13} />
                <span>LCC Refund Sample</span>
              </a>
            </div>
          </div>

          {/* Row 4: File Upload Drag & Drop (.xlsx only) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Batch File (.xlsx only) <span className="text-rose-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${isDragOver
                  ? "border-primary bg-indigo-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  } ${errors.file ? "border-rose-400 bg-rose-50/30" : ""}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs">
                  <FileSpreadsheet size={24} />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  <span className="text-primary hover:underline font-bold">
                    Click to browse
                  </span>{" "}
                  or drag and drop your file here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported format: <strong>.xlsx</strong> Excel spreadsheet only
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatFileSize(selectedFile.size)} • Ready to upload
                    </p>
                  </div>
                </div>
                <CustomButton
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  className="!p-1.5 !h-auto text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-none cursor-pointer"
                  title="Remove file"
                >
                  <X size={16} />
                </CustomButton>
              </div>
            )}

            {errors.file && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.file.message}
              </p>
            )}
          </div>

          {/* Upload Progress Bar if submitting */}
          {submitting && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Uploading batch...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </CustomButton>

            <CustomButton
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white min-w-[130px] gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>Upload Batch</span>
                </>
              )}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadBatchModal;
