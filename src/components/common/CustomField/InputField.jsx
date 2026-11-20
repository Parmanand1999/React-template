import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

const InputField = ({
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  autoComplete = "off",
  required = false,
  uppercase = false,
  numbersOnly = false,
  max,
  maxLength,
  className = "",
  showPasswordToggle = false,
  ...props
}) => {
  const { control } = useFormContext();
  const [isVisible, setIsVisible] = useState(false);

  const isPassword = type === "password" || showPasswordToggle;
  const inputType = isPassword ? (isVisible ? "text" : "password") : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-1.5">
          {label && (
            <FormLabel className="text-sm font-semibold tracking-wide text-slate-700">
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}

          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={inputType}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={field.value ?? ""}
                onChange={(e) => {
                  let value = e.target.value;
                  if (numbersOnly) {
                    value = value.replace(/\D/g, "");
                  }
                  if (typeof maxLength === "number") {
                    value = value.slice(0, maxLength);
                  }
                  if (uppercase) {
                    value = value.toUpperCase();
                  }

                  field.onChange(value);
                }}
                maxLength={maxLength}
                aria-invalid={!!fieldState.error}
                className={`h-9 border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 ${
                  isPassword ? "pr-9" : ""
                } ${
                  fieldState.error
                    ? "border-destructive ring-2 ring-destructive/20"
                    : ""
                } ${className}`}
                max={max}
                {...props}
              />
              {isPassword && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                  aria-label={isVisible ? "Hide password" : "Show password"}
                >
                  {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </div>
          </FormControl>

          <FormMessage className="text-xs">{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

export default InputField;