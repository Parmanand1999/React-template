import React, { useState, useEffect, useMemo } from "react";
import { Country } from "country-state-city";
import { useFormContext } from "react-hook-form";
import { ChevronDown, Search } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const POPULAR_ISOS = ["IN", "US", "AE", "GB", "SA", "QA", "CA", "AU", "SG", "DE", "FR"];

const ALL_DIAL_CODES = (() => {
  const rawList = Country.getAllCountries().map((c) => {
    let code = c.phonecode || "1";
    if (code.includes("-")) code = code.split("-")[0];
    if (!code.startsWith("+")) code = `+${code}`;
    return {
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag || "🌐",
      dialCode: code,
    };
  });

  const popular = rawList.filter((item) => POPULAR_ISOS.includes(item.isoCode));
  const remaining = rawList
    .filter((item) => !POPULAR_ISOS.includes(item.isoCode))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...popular, ...remaining];
})();

const getDialCodeByCountry = (countryInput) => {
  if (!countryInput || typeof countryInput !== "string") return "+91";
  const input = countryInput.trim().toLowerCase();
  const match = ALL_DIAL_CODES.find(
    (c) => c.isoCode.toLowerCase() === input || c.name.toLowerCase() === input
  );
  return match ? match.dialCode : "+91";
};

const parsePhoneValue = (val, defaultDialCode = "+91") => {
  if (!val || typeof val !== "string") return { dialCode: defaultDialCode, number: "" };
  const trimmed = val.trim();

  if (trimmed.startsWith("+")) {
    const match = ALL_DIAL_CODES.find((c) => trimmed.startsWith(c.dialCode));
    if (match) {
      return {
        dialCode: match.dialCode,
        number: trimmed.slice(match.dialCode.length).trim(),
      };
    }
  }

  const numberOnly = trimmed.replace(/[^0-9]/g, "");
  return { dialCode: defaultDialCode, number: numberOnly };
};

// Compact Searchable Dial Code Selector Button & Popover
const CountryDialCodePicker = ({ currentCode, onSelectCode, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeItem = useMemo(() => {
    return (
      ALL_DIAL_CODES.find((c) => c.dialCode === currentCode) || {
        flag: "🌐",
        dialCode: currentCode || "+91",
      }
    );
  }, [currentCode]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return ALL_DIAL_CODES;
    const q = searchQuery.trim().toLowerCase();
    return ALL_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.isoCode.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="h-9 w-[60px] rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-800 flex items-center justify-between gap-1 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer shrink-0 shadow-2xs"
          title={`${activeItem.name || ""} (${activeItem.dialCode})`}
        >
          <span className="flex items-center gap-1 truncate text-xs">
            <span className="font-bold text-[11px] tracking-tight">{activeItem.dialCode}</span>
          </span>
          <ChevronDown size={13} className="text-slate-400 shrink-0 ml-0.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[260px] p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50"
      >
        <div className="relative mb-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search country or +code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition"
            autoFocus
          />
        </div>

        <div className="max-h-[210px] overflow-y-auto space-y-0.5 pr-0.5">
          {filteredList.map((item, idx) => (
            <button
              key={`${item.isoCode}-${item.dialCode}-${idx}`}
              type="button"
              onClick={() => {
                onSelectCode(item.dialCode);
                setOpen(false);
                setSearchQuery("");
              }}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                currentCode === item.dialCode
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="flex items-center gap-2 truncate min-w-0 pr-1">
                <span className="text-sm shrink-0">{item.flag}</span>
                <span className="truncate text-xs">{item.name}</span>
              </span>
              <span className="font-bold text-slate-500 text-[11px] shrink-0 ml-1">
                {item.dialCode}
              </span>
            </button>
          ))}

          {filteredList.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No country found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PhoneInputField = ({
  name,
  label,
  placeholder = "e.g. 9876543210",
  disabled = false,
  required = false,
  country = null,
  className = "",
  value: directValue,
  onChange: directOnChange,
  error: directError,
}) => {
  const formContext = useFormContext();

  const defaultCode = useMemo(() => getDialCodeByCountry(country), [country]);
  const [selectedDialCode, setSelectedDialCode] = useState(defaultCode);

  useEffect(() => {
    if (country) {
      const code = getDialCodeByCountry(country);
      if (code) {
        setSelectedDialCode(code);
      }
    }
  }, [country]);

  // Controlled component mode (non-react-hook-form)
  if (!formContext && name === undefined) {
    const { dialCode, number } = parsePhoneValue(directValue, selectedDialCode);
    const currentCode = selectedDialCode || dialCode;

    const handleNumberChange = (e) => {
      let rawDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
      if (directOnChange) directOnChange(rawDigits);
    };

    const handleCodeSelect = (newCode) => {
      setSelectedDialCode(newCode);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold tracking-wide text-slate-700 block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="flex gap-1.5 items-center">
          <CountryDialCodePicker
            currentCode={currentCode}
            onSelectCode={handleCodeSelect}
            disabled={disabled}
          />
          <Input
            type="tel"
            disabled={disabled}
            placeholder={placeholder}
            value={number}
            onChange={handleNumberChange}
            className={`h-9 border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 text-xs ${
              directError ? "border-rose-400 ring-2 ring-rose-200" : ""
            } ${className}`}
          />
        </div>
        {directError && <p className="text-rose-500 text-xs mt-0.5">{directError}</p>}
      </div>
    );
  }

  // FormField mode (React Hook Form)
  const { control } = formContext;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const { dialCode, number } = parsePhoneValue(field.value, selectedDialCode);
        const currentCode = selectedDialCode || dialCode;

        const handleNumberChange = (e) => {
          let rawDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
          field.onChange(rawDigits);
        };

        const handleCodeSelect = (newCode) => {
          setSelectedDialCode(newCode);
        };

        return (
          <FormItem className="space-y-1.5">
            {label && (
              <FormLabel className="text-sm font-semibold tracking-wide text-slate-700">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div className="flex gap-1.5 items-center">
                <CountryDialCodePicker
                  currentCode={currentCode}
                  onSelectCode={handleCodeSelect}
                  disabled={disabled}
                />

                <Input
                  {...field}
                  type="tel"
                  disabled={disabled}
                  placeholder={placeholder}
                  value={number}
                  onChange={handleNumberChange}
                  aria-invalid={!!fieldState.error}
                  className={`h-9 border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 text-xs ${
                    fieldState.error
                      ? "border-destructive ring-2 ring-destructive/20"
                      : ""
                  } ${className}`}
                />
              </div>
            </FormControl>

            <FormMessage className="text-xs">{fieldState.error?.message}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};

export default PhoneInputField;
