import { z } from "zod";

/**
 * Zod validation schema for Batch Upload Modal.
 * Validates client, refund type, provider, airline (conditional for LCC),
 * month/year period, and Excel (.xlsx) file.
 */
export const uploadBatchSchema = z
  .object({
    clientId: z.string().trim().min(1, "Please select a client."),
    refundType: z.string().trim().min(1, "Refund Type is required."),
    serviceProvider: z.string().trim().optional(),
    airline: z.string().trim().optional(),
    batchMonth: z.string().trim().min(1, "Batch Month is required."),
    batchYear: z.string().trim().min(1, "Batch Year is required."),
    file: z
      .any()
      .refine(
        (file) =>
          Boolean(file) &&
          (file instanceof File || (typeof file === "object" && file.name)),
        {
          message: "Please upload an .xlsx file.",
        }
      )
      .refine(
        (file) =>
          !file || (file.name && file.name.toLowerCase().endsWith(".xlsx")),
        {
          message: "Only Excel (.xlsx) files are supported.",
        }
      ),
  })
  .superRefine((data, ctx) => {
    if (data.refundType === "gds" && (!data.serviceProvider || !data.serviceProvider.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceProvider"],
        message: "Service Provider is required for GDS refund type.",
      });
    }
    if (data.refundType === "lcc" && (!data.airline || !data.airline.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["airline"],
        message: "Airline is required for LCC refund type.",
      });
    }
  });

export const defaultUploadBatchValues = {
  clientId: "",
  refundType: "gds",
  serviceProvider: "amadeus",
  airline: "",
  batchMonth: String(new Date().getMonth() + 1),
  batchYear: String(new Date().getFullYear()),
  file: null,
};
