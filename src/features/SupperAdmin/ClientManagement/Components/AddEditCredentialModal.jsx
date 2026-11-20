import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import InputField from "@/components/common/CustomField/InputField";
import SelectField from "@/components/common/CustomField/SelectField";
import {
  createClientCredentials,
  updateClientCredentials,
  getClientCredentialById,
} from "@/Services/clientServices";
import { filteredPayload } from "@/utils/filteredEmptyPayload";
import {
  GDS_PROVIDERS,
  REFUND_TYPE_OPTIONS,
} from "./credentialConstants";
import {
  getCredentialSchema,
  buildCredentialPayload,
} from "./credentialSchema";

const defaultFormValues = {
  refundType: "gds",
  serviceProvider: "amadeus",
  amadeusUserId: "",
  amadeusPassword: "",
  amadeusDefaultOfficeId: "",
  amadeusOfficeIds: [{ iata: "", officeId: "" }],
  galileoSignOn: "",
  galileoPcc: "",
  galileoPassword: "",
  galileoTPin: "",
  sabreAgentId: "",
  sabrePcc: "",
  sabrePassword: "",
};

const mapCredentialDataToForm = (cred) => {
  if (!cred) return defaultFormValues;
  const prov = cred.serviceProvider?.toLowerCase() || "amadeus";
  const amadeusData = cred.amadeus || {};
  const galileoData = cred.galileo || {};
  const sabreData = cred.sabre || {};

  const officeIds =
    Array.isArray(amadeusData.officeIds) && amadeusData.officeIds.length > 0
      ? amadeusData.officeIds.map((o) => ({
        iata: o.iata || "",
        officeId: o.officeId || "",
      }))
      : Array.isArray(cred.amadeusOfficeIds) && cred.amadeusOfficeIds.length > 0
        ? cred.amadeusOfficeIds.map((o) => ({
          iata: o.iata || "",
          officeId: o.officeId || "",
        }))
        : [{ iata: "", officeId: "" }];

  return {
    refundType: cred.refundType?.toLowerCase() || "gds",
    serviceProvider: prov,
    amadeusUserId: amadeusData.userId || cred.amadeusUserId || "",
    amadeusPassword: "",
    amadeusDefaultOfficeId:
      amadeusData.defaultOfficeId || cred.amadeusDefaultOfficeId || "",
    amadeusOfficeIds: officeIds,
    galileoSignOn: galileoData.signOn || cred.galileoSignOn || "",
    galileoPcc: galileoData.pcc || cred.galileoPcc || "",
    galileoPassword: "",
    galileoTPin: "",
    sabreAgentId: sabreData.agentId || cred.sabreAgentId || "",
    sabrePcc: sabreData.pcc || cred.sabrePcc || "",
    sabrePassword: "",
  };
};

const AddEditCredentialModal = ({
  isOpen = false,
  onClose,
  clientId,
  clientName = "",
  existingCredentials = [],
  editingCredential = null,
  onSuccess,
}) => {
  const isEdit = Boolean(editingCredential);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Compute remaining providers not yet added for this client
  const availableProviders = useMemo(() => {
    if (isEdit) {
      return GDS_PROVIDERS.filter(
        (p) =>
          p.value === editingCredential?.serviceProvider?.toLowerCase()
      );
    }
    return GDS_PROVIDERS.filter(
      (p) =>
        !existingCredentials.some(
          (c) => c.serviceProvider?.toLowerCase() === p.value
        )
    );
  }, [isEdit, editingCredential, existingCredentials]);

  const providerOptions = useMemo(() => {
    return availableProviders.map((p) => ({
      value: p.value,
      label: p.label,
    }));
  }, [availableProviders]);

  const schema = useMemo(() => getCredentialSchema(isEdit), [isEdit]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  // Optimized subscriber for serviceProvider using useWatch to isolate re-renders
  const currentServiceProvider = useWatch({
    control,
    name: "serviceProvider",
    defaultValue: "amadeus",
  });

  // Field Array for Amadeus Office IDs repeater
  const { fields, append, remove } = useFieldArray({
    control,
    name: "amadeusOfficeIds",
  });

  // Populate or reset form whenever modal opens or editingCredential changes
  useEffect(() => {
    if (!isOpen) return;
    clearErrors();

    if (editingCredential) {
      reset(mapCredentialDataToForm(editingCredential));

      const credId = editingCredential.id || editingCredential._id;
      // Skip redundant fetch if nested provider details are already loaded in editingCredential
      const hasNestedData = Boolean(
        editingCredential.amadeus?.userId ||
        editingCredential.galileo?.signOn ||
        editingCredential.sabre?.agentId
      );

      if (credId && !hasNestedData) {
        const fetchDetails = async () => {
          setFetchingDetails(true);
          try {
            const res = await getClientCredentialById(credId);
            if (res?.data?.success && res?.data?.data) {
              reset(mapCredentialDataToForm(res.data.data));
            }
          } catch (err) {
            console.error("Fetch credential details error:", err);
          } finally {
            setFetchingDetails(false);
          }
        };

        fetchDetails();
      }
    } else {
      const defaultProv = availableProviders[0]?.value || "amadeus";
      reset({
        ...defaultFormValues,
        serviceProvider: defaultProv,
      });
    }
  }, [isOpen, editingCredential, availableProviders, reset, clearErrors]);

  const onSubmit = async (data) => {
    const rawPayload = buildCredentialPayload(data, isEdit, clientId);
    const cleanPayload = filteredPayload(rawPayload);

    try {
      setLoading(true);
      let res;
      if (isEdit) {
        const credId = editingCredential.id || editingCredential._id;
        res = await updateClientCredentials(credId, cleanPayload);
      } else {
        res = await createClientCredentials(cleanPayload);
      }

      if (res?.data?.success) {
        toast.success(
          res.data.message ||
          (isEdit
            ? "Credential updated successfully!"
            : "Credential added successfully!")
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to save credential.");
      }
    } catch (error) {
      console.error("Save client credential error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to save credential. Please check all fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeProviderMeta = GDS_PROVIDERS.find(
    (p) => p.value === currentServiceProvider
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200"
      >
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit GDS Credential" : "Add GDS Credential"}
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
        </DialogHeader>

        {/* Scrollable Form Body */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {fetchingDetails ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <CustomLoader />
                  <p className="text-xs text-slate-500 font-medium">
                    Loading credential details...
                  </p>
                </div>
              ) : (
                <>
                  {/* Common Configuration Section */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Layers size={15} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Provider Configuration
                        </span>
                      </div>
                      {activeProviderMeta && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${activeProviderMeta.badgeClass}`}
                        >
                          {activeProviderMeta.shortName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Refund Type Dropdown */}
                      <SelectField
                        name="refundType"
                        label="Refund Type"
                        placeholder="Select refund type"
                        options={REFUND_TYPE_OPTIONS}
                        disabled={isEdit}
                        required
                      />

                      {/* Service Provider Dropdown */}
                      <SelectField
                        name="serviceProvider"
                        label="Service Provider"
                        placeholder="Select GDS provider"
                        options={providerOptions}
                        disabled={isEdit}
                        required
                      />
                    </div>

                    {isEdit && (
                      <p className="text-[11px] text-slate-500 italic">
                        Service provider cannot be changed in edit mode. Delete and create a new credential to switch providers.
                      </p>
                    )}
                  </div>

                  {/* Dynamic Provider Fields */}
                  <div className="space-y-4">
                    {/* AMADEUS */}
                    {currentServiceProvider === "amadeus" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                            Amadeus API Credentials
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            name="amadeusUserId"
                            label="Amadeus User ID"
                            placeholder="e.g. 1A_USER123"
                            required
                          />

                          <InputField
                            name="amadeusPassword"
                            label="Amadeus Password"
                            placeholder={
                              isEdit
                                ? "Leave blank to keep current password"
                                : "Enter Amadeus password"
                            }
                            type="password"
                            required={!isEdit}
                          />

                          <div className="md:col-span-2">
                            <InputField
                              name="amadeusDefaultOfficeId"
                              label="Default Office ID"
                              placeholder="e.g. DEL1S2100"
                              uppercase
                              required
                            />
                          </div>
                        </div>

                        {/* Amadeus Office IDs Repeater */}
                        <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/70 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Associated Office IDs
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Configure IATA codes and their corresponding Office IDs.
                              </p>
                            </div>
                            <CustomButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => append({ iata: "", officeId: "" })}
                              className="text-xs py-1 px-2.5 h-8 flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Plus size={13} />
                              <span>Add Office ID</span>
                            </CustomButton>
                          </div>

                          <div className="space-y-2.5">
                            {fields.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs"
                              >
                                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                  #{index + 1}
                                </span>
                                <div className="flex-1">
                                  <InputField
                                    name={`amadeusOfficeIds.${index}.iata`}
                                    placeholder="IATA (e.g. 14312345)"
                                    maxLength={8}
                                    numbersOnly
                                  />
                                </div>
                                <div className="flex-1">
                                  <InputField
                                    name={`amadeusOfficeIds.${index}.officeId`}
                                    placeholder="Office ID (e.g. DEL1S2100)"
                                    uppercase
                                  />
                                </div>
                                {fields.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                    title="Remove Office ID"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GALILEO */}
                    {currentServiceProvider === "galileo" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Galileo (Travelport) Credentials
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            name="galileoSignOn"
                            label="Galileo Sign-On"
                            placeholder="e.g. 1234AB"
                            required
                          />

                          <InputField
                            name="galileoPcc"
                            label="Galileo PCC"
                            placeholder="e.g. 7XYZ"
                            uppercase
                            required
                          />

                          <InputField
                            name="galileoPassword"
                            label="Galileo Password"
                            placeholder={
                              isEdit
                                ? "Leave blank to keep current password"
                                : "Enter Galileo password"
                            }
                            type="password"
                            required={!isEdit}
                          />

                          <InputField
                            name="galileoTPin"
                            label="Galileo T-PIN"
                            placeholder={
                              isEdit
                                ? "Leave blank to keep current T-PIN"
                                : "Enter 4-digit T-PIN"
                            }
                            type="password"
                            max={10}
                            required={!isEdit}
                          />
                        </div>
                      </div>
                    )}

                    {/* SABRE */}
                    {currentServiceProvider === "sabre" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                            Sabre GDS Credentials
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            name="sabreAgentId"
                            label="Sabre Agent ID"
                            placeholder="e.g. AGENT123"
                            required
                          />

                          <InputField
                            name="sabrePcc"
                            label="Sabre PCC"
                            placeholder="e.g. 1ABC"
                            uppercase
                            required
                          />

                          <div className="md:col-span-2">
                            <InputField
                              name="sabrePassword"
                              label="Sabre Password"
                              placeholder={
                                isEdit
                                  ? "Leave blank to keep current password"
                                  : "Enter Sabre password"
                              }
                              type="password"
                              required={!isEdit}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-end gap-3">
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading || isSubmitting || fetchingDetails}
                className="text-xs px-4"
              >
                Cancel
              </CustomButton>

              <CustomButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading || isSubmitting || fetchingDetails}
                className="text-xs px-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs"
              >
                {loading || isSubmitting ? (
                  <>
                    <CustomLoader size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>
                      {isEdit ? "Update Credential" : "Add Credential"}
                    </span>
                  </>
                )}
              </CustomButton>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditCredentialModal;
