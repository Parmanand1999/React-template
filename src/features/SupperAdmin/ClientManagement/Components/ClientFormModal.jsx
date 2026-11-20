import React, { useEffect, useState, useMemo, useRef } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  Building2,
  User,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import InputField from "@/components/common/CustomField/InputField";
import SelectField from "@/components/common/CustomField/SelectField";
import PhoneInputField from "@/components/common/CustomField/PhoneInputField";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CustomLoader from "@/components/common/CustomLoader";
import CountryStateCitySelect from "@/components/common/DropdownSelect/CountryStateCitySelect";
import { Country } from "country-state-city";

import {
  clientSchema,
  clientDefaultValues,
  COMMON_CURRENCIES,
  TAX_TYPES,
  CURRENCY_MAP,
} from "./ClientSchema";
import {
  createClient,
  updateClient,
  getClientById,
} from "@/Services/clientServices";
import { filteredPayload } from "@/utils/filteredEmptyPayload";

const ClientFormModal = ({
  clientId = null,
  initialData = null,
  isEdit = false,
  isModal = true,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [isCustomCurrency] = useState(false);
  const countryRef = useRef(initialData?.country || "");

  const methods = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || clientDefaultValues,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  const isTaxableValue = watch("isTaxable");
  const selectedCurrency = watch("currency");

  const currencyOptions = useMemo(() => {
    if (!selectedCurrency) return COMMON_CURRENCIES;
    const exists = COMMON_CURRENCIES.some((c) => c.value === selectedCurrency);
    if (!exists) {
      return [
        { label: `${selectedCurrency} - Currency`, value: selectedCurrency },
        ...COMMON_CURRENCIES,
      ];
    }
    return COMMON_CURRENCIES;
  }, [selectedCurrency]);

  const watchedCountry = watch("country");

  // Auto-sync currency when user chooses a new country
  useEffect(() => {
    if (watchedCountry && watchedCountry !== countryRef.current) {
      countryRef.current = watchedCountry;
      const match = Country.getAllCountries().find(
        (c) =>
          c.name.toLowerCase() === watchedCountry.toLowerCase() ||
          c.isoCode.toLowerCase() === watchedCountry.toLowerCase()
      );
      if (match?.currency) {
        setValue("currency", match.currency, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } else if (!watchedCountry && !isEdit) {
      setValue("currency", "", { shouldValidate: true });
    }
  }, [watchedCountry, setValue, isEdit]);

  // Fetch freshest data when in edit mode or populate from initialData
  useEffect(() => {
    const targetId = clientId || initialData?.id || initialData?._id;
    if (isEdit && targetId) {
      let isMounted = true;
      const fetchClientDetails = async () => {
        try {
          setLoading(true);
          const response = await getClientById(targetId);
          if (
            (response?.status === 200 || response?.status === 201) &&
            isMounted
          ) {
            const data = response?.data?.data || response?.data;
            if (data) {
              countryRef.current = data.country || "";
              reset({
                clientName: data.clientName || data.name || "",
                pocName: data.pocName || "",
                pocEmail: data.pocEmail || data.email || "",
                pocMobile: data.pocMobile || data.mobile || data.phone || "",
                country: data.country || "",
                state: data.state || "",
                city: data.city || "",
                address: data.address || "",
                currency: data.currency || "",
                websiteUrl: data.websiteUrl || data.website || "",
                isTaxable: Boolean(data.isTaxable),
                taxName: data.taxName || "",
                taxIdNo: data.taxIdNo || data.taxNumber || "",
                isGsaConsultant: Boolean(data.isGsaConsultant),
              });
            }
          }
        } catch (err) {
          console.warn("Error fetching client details in modal:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchClientDetails();
      return () => {
        isMounted = false;
      };
    } else if (initialData) {
      countryRef.current = initialData.country || "";
      reset({
        clientName: initialData.clientName || initialData.name || "",
        pocName: initialData.pocName || "",
        pocEmail: initialData.pocEmail || initialData.email || "",
        pocMobile: initialData.pocMobile || initialData.mobile || initialData.phone || "",
        country: initialData.country || "",
        state: initialData.state || "",
        city: initialData.city || "",
        address: initialData.address || "",
        currency: initialData.currency || "",
        websiteUrl: initialData.websiteUrl || initialData.website || "",
        isTaxable: Boolean(initialData.isTaxable),
        taxName: initialData.taxName || "",
        taxIdNo: initialData.taxIdNo || initialData.taxNumber || "",
        isGsaConsultant: Boolean(initialData.isGsaConsultant),
      });
    } else {
      countryRef.current = "";
      reset(clientDefaultValues);
    }
  }, [isEdit, clientId, initialData, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        clientName: data.clientName?.trim(),
        pocName: data.pocName?.trim() || "",
        pocEmail: data.pocEmail?.trim() || "",
        pocMobile: data.pocMobile?.trim() || "",
        country: data.country?.trim() || "",
        state: data.state?.trim() || "",
        city: data.city?.trim() || "",
        address: data.address?.trim() || "",
        currency: data.currency?.trim() || "INR",
        websiteUrl: data.websiteUrl?.trim() || "",
        isTaxable: Boolean(data.isTaxable),
        taxName: data.isTaxable ? data.taxName?.trim() || "" : "",
        taxIdNo: data.isTaxable ? data.taxIdNo?.trim() || "" : "",
        isGsaConsultant: Boolean(data.isGsaConsultant),
      };

      const targetId = clientId || initialData?.id || initialData?._id;
      const filteredPayloadData = filteredPayload(payload)
      const response = isEdit && targetId
        ? await updateClient(targetId, filteredPayloadData)
        : await createClient(filteredPayloadData);

      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          response?.data?.message ||
          `Travel Agent ${isEdit ? "updated" : "created"} successfully!`
        );
        if (!isEdit) {
          reset(clientDefaultValues);
        }
        if (onSuccess) {
          onSuccess(response?.data?.data || response?.data);
        }
      } else {
        toast.error(
          response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} travel agent.`
        );
      }
    } catch (error) {
      console.error("Client Form Submit Error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${isEdit ? "update" : "create"} travel agent.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      {loading && <CustomLoader fixed />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-5 animate-fadeIn ${isModal ? "max-h-[70vh] overflow-y-auto pr-1" : ""
          }`}
      >
        {/* Full Page Header if not modal */}
        {!isModal && (
          <header className="rounded-3xl border border-slate-200 bg-gradient-to-r from-primary via-[#a12002] to-slate-900 p-6 text-white shadow-md">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-accent" />
                Travel Agent Management
              </p>
              <h2 className="text-2xl font-semibold">
                {isEdit ? "Update Travel Agent Details" : "Create New Travel Agent"}
              </h2>
              <p className="text-sm text-slate-300">
                Configure travel agent identity, point of contact, taxation details, and consultant agreements.
              </p>
            </div>
          </header>
        )}

        {/* Section 1: Company Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Company & Basic Information
              </h3>
              <p className="text-xs text-slate-500">
                Primary business identification details.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <InputField
                name="clientName"
                label="Agency Name"
                placeholder="e.g. Travel Point Holidays"
                required
              />
            </div>

            <div>
              <InputField
                name="websiteUrl"
                label="Website URL"
                placeholder="e.g. https://www.globaltech.com"
              />
            </div>


          </div>
        </div>

        {/* Section 2: Point of Contact */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Point of Contact (POC)
              </h3>
              <p className="text-xs text-slate-500">
                Designated representative for account communications.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InputField
              name="pocName"
              label="Contact Person Name"
              placeholder="e.g. John Doe"
              required
            />
            <InputField
              name="pocEmail"
              label="Email Address"
              placeholder="e.g. john.doe@company.com"
              type="email"
              required
            />
            <PhoneInputField
              name="pocMobile"
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              country={watch("country")}
              required
            />
          </div>
        </div>

        {/* Section 3: Location & Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Location & Office Address
              </h3>
              <p className="text-xs text-slate-500">
                Registered office jurisdiction and physical address.
              </p>
            </div>
          </div>

          <CountryStateCitySelect
            country={watch("country")}
            state={watch("state")}
            city={watch("city")}
            onCountryChange={(val, opt) => {
              countryRef.current = val;
              setValue("country", val, { shouldValidate: true });
              if (opt?.currency) {
                setValue("currency", opt.currency, { shouldValidate: true });
              } else {
                setValue("currency", "");
              }
            }}
            onStateChange={(val) => setValue("state", val, { shouldValidate: true })}
            onCityChange={(val) => setValue("city", val, { shouldValidate: true })}
            required={true}
            errors={errors}
          />
          <div className="flex gap-4">
            <div className="">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Billing Currency
                  <span className="text-rose-500">*</span>
                </label>
                {selectedCurrency && (
                  <div className="flex items-center gap-1.5">
                    {!isCustomCurrency && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                        <Sparkles size={10} /> Auto
                      </span>
                    )}
                    {/* <button
                      type="button"
                      onClick={() => setIsCustomCurrency(!isCustomCurrency)}
                      className="text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {isCustomCurrency ? "Auto-sync" : "Change"}
                    </button> */}
                  </div>
                )}
              </div>

              {isCustomCurrency ? (
                <SelectField
                  name="currency"
                  placeholder="Select Currency"
                  options={currencyOptions}
                />
              ) : (
                <div
                  className={`h-9 w-full rounded-lg border px-2.5 text-xs flex items-center justify-between transition select-none ${selectedCurrency
                    ? "bg-slate-50/90 border-slate-200 text-slate-900 shadow-2xs"
                    : "bg-slate-50/40 border-dashed border-slate-300 text-slate-400"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold shrink-0 shadow-2xs ${selectedCurrency
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                        }`}
                    >
                      {selectedCurrency
                        ? CURRENCY_MAP[selectedCurrency]?.symbol || selectedCurrency[0]
                        : "$"}
                    </div>

                    {selectedCurrency ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-slate-800 text-xs tracking-wide">
                          {selectedCurrency}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate">
                          • {CURRENCY_MAP[selectedCurrency]?.name || "Currency"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic truncate">
                        Auto-assigned with Country
                      </span>
                    )}
                  </div>

                  {watchedCountry && selectedCurrency && (
                    <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs shrink-0 ml-1">
                      {watchedCountry}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="w-full">
              <InputField
                name="address"
                label="Full Address"
                placeholder="e.g. Plot No 42, Mindspace Tech Park, Sector 5"
              />
            </div>
          </div>

        </div>

        {/* Section 4: Taxation & Business Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Taxation & Business Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Configure tax compliance identifiers and agency flags.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Taxable Toggle Card */}
            <Controller
              name="isTaxable"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => {
                    const nextVal = !field.value;
                    field.onChange(nextVal);
                    if (!nextVal) {
                      setValue("taxName", "");
                      setValue("taxIdNo", "");
                      clearErrors(["taxName", "taxIdNo"]);
                    }
                  }}
                  className={`flex items-start justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${field.value
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Receipt size={14} className={field.value ? "text-emerald-600" : "text-slate-400"} />
                      Is Taxable Client
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Enable if invoices require tax calculations (GST/VAT).
                    </p>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${field.value ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${field.value ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </div>
                </div>
              )}
            />

            {/* GSA Consultant Toggle Card */}
            <Controller
              name="isGsaConsultant"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`flex items-start justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${field.value
                    ? "border-purple-300 bg-purple-50/40"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className={field.value ? "text-purple-600" : "text-slate-400"} />
                      GSA Consultant
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Mark client as a General Sales Agent consultant.
                    </p>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${field.value ? "bg-purple-600" : "bg-slate-300"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${field.value ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          {/* Conditional Tax Fields if isTaxable */}
          {isTaxableValue && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100 animate-fadeIn">
              <SelectField
                name="taxName"
                label="Tax Name / Type"
                placeholder="Select Tax Type (VAT / GST)"
                options={TAX_TYPES}
                required={isTaxableValue}
              />
              <InputField
                name="taxIdNo"
                label="Tax ID / Registration No."
                placeholder={
                  watch("taxName") === "GST"
                    ? "e.g. 27AAAAA0000A1Z5"
                    : "e.g. VAT12345678"
                }
                required={isTaxableValue}
                uppercase={true}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-white">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            Cancel
          </CustomButton>

          <CustomButton
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
          >
            {isEdit ? "Update Travel Agent" : "Create Travel Agent"}
          </CustomButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default ClientFormModal;
