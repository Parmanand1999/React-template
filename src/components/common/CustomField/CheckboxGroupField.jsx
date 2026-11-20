import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CheckboxGroupField = ({
  name,
  label,
  options = [],
  required = false,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValues = Array.isArray(field.value) ? field.value : [];

        const toggleValue = (optionValue) => {
          const nextValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((value) => value !== optionValue)
            : [...selectedValues, optionValue];
          field.onChange(nextValues);
        };

        return (
          <FormItem className="space-y-2">
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>

            <FormControl>
              <div className="grid gap-3 sm:grid-cols-2">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => toggleValue(option.value)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </FormControl>

            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};

export default CheckboxGroupField;
