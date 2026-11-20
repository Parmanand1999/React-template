import React from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectField = ({
  name,
  label,
  placeholder,
  options = [],
  required = false,
  disabled = false,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </FormLabel>

          <Select
            value={field.value}
            onValueChange={field.onChange}
            aria-invalid={!!fieldState.error}
            modal={false}
            disabled={disabled}
          >
            <SelectTrigger
              disabled={disabled}
              className={`h-9! w-full border-slate-200 bg-white text-slate-800 font-medium shadow-sm transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 ${
                disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""
              } ${fieldState.error ? "border-destructive ring-2 ring-destructive/20" : ""}`}
            >
              <SelectValue placeholder={placeholder}>
                {options.find((opt) => opt.value === field.value)?.label || field.value}
              </SelectValue>
            </SelectTrigger>

            <SelectContent alignItemWithTrigger={false}>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

export default SelectField;