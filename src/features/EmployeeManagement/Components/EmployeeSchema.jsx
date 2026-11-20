import { z } from "zod";
import { validateDetailedMobile } from "@/utils/phoneValidation";

export const employeeCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required (at least 2 characters)"),
  roleId: z.string().min(1, "Role is required"),
  email: z.string().trim().email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .superRefine((val, ctx) => {
      const res = validateDetailedMobile(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message,
        });
      }
    }),
  gender: z.enum(["male", "female", "other"]).default("male"),
  refundType: z
    .array(z.string())
    .min(1, "Select at least one refund type (GDS or LCC)"),
});

export const employeeUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name is required (at least 2 characters)"),
  roleId: z.string().min(1, "Role is required"),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .superRefine((val, ctx) => {
      const res = validateDetailedMobile(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message,
        });
      }
    }),
  gender: z.enum(["male", "female", "other"]).default("male"),
  refundType: z
    .array(z.string())
    .min(1, "Select at least one refund type (GDS or LCC)"),
});

export const employeeDefaultValues = {
  name: "",
  roleId: "",
  email: "",
  mobile: "",
  gender: "male",
  refundType: ["gds"],
};
