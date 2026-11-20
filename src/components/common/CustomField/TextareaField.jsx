import React from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";

const TextareaField = ({
  name,
  label,
  placeholder,
  rows = 4,
  required = false,
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

          <FormControl>
            <Textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              aria-invalid={!!fieldState.error}
              className={`rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary/20 ${fieldState.error ? "border-destructive ring-2 ring-destructive/20" : ""}`}
            />
          </FormControl>

          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

export default TextareaField;