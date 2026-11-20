import React from "react";

/**
 * FormSection Component
 * A stylized container for grouping form fields with a title, description, and icon.
 */
const FormSection = ({ title, description, icon, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default FormSection;
