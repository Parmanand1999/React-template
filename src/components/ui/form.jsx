
import * as React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

const Form = FormProvider;

const FormField = ({ ...props }) => {
  return <Controller {...props} />;
};

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef((props, ref) => (
  <label ref={ref} className="text-sm font-medium" {...props} />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef((props, ref) => (
  <div ref={ref} {...props} />
));
FormControl.displayName = "FormControl";

const FormMessage = ({ children, className = "" }) => {
  if (!children) return null;

  return (
    <p className={`text-sm text-destructive mt-1 ${className}`}>
      {children}
    </p>
  );
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormContext,
};