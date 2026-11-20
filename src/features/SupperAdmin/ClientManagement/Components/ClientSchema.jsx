import { z } from "zod";
import { validateDetailedMobile } from "@/utils/phoneValidation";

export const TAX_TYPES = [
  { label: "VAT", value: "VAT" },
  { label: "GST", value: "GST" },
];

export const clientSchema = z
  .object({
    clientName: z
      .string()
      .trim()
      .min(2, "Agency name is required (at least 2 characters)")
      .max(100, "Agency name cannot exceed 100 characters"),

    pocName: z
      .string()
      .trim()
      .min(2, "Contact person name is required (at least 2 characters)")
      .max(80, "Contact person name cannot exceed 80 characters"),

    pocEmail: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),

    pocMobile: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(
        /^[0-9+\s\-()]{7,15}$/,
        "Please enter a valid phone number (7-15 digits)"
      ),

    country: z.string().trim().min(1, "Country is required"),
    state: z.string().trim().min(1, "State is required"),
    city: z.string().trim().min(1, "City is required"),
    address: z.string().trim().optional().or(z.literal("")),
    currency: z.string().trim().min(1, "Currency is required (select country)"),
    websiteUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) =>
          !val ||
          /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(
            val
          ) ||
          /^localhost(:\d+)?(\/.*)?$/i.test(val),
        { message: "Please enter a valid website URL (e.g. www.example.com)" }
      ),

    isTaxable: z.boolean().default(false),
    taxName: z.string().trim().optional().or(z.literal("")),
    taxIdNo: z.string().trim().optional().or(z.literal("")),
    isGsaConsultant: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.pocMobile) {
      const res = validateDetailedMobile(data.pocMobile, data.country);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pocMobile"],
          message: res.message,
        });
      }
    }

    if (data.isTaxable) {
      if (!data.taxName || !["VAT", "GST"].includes(data.taxName.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxName"],
          message: "Please select a tax type (VAT or GST)",
        });
      }
      if (!data.taxIdNo || !data.taxIdNo.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxIdNo"],
          message: "Tax ID / Registration number is required",
        });
      } else if (data.taxIdNo.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxIdNo"],
          message: "Tax ID must be at least 3 characters",
        });
      }
    }
  });

export const clientDefaultValues = {
  clientName: "",
  pocName: "",
  pocEmail: "",
  pocMobile: "",
  country: "",
  state: "",
  city: "",
  address: "",
  currency: "",
  websiteUrl: "",
  isTaxable: false,
  taxName: "",
  taxIdNo: "",
  isGsaConsultant: false,
};

export const COMMON_CURRENCIES = [
  { label: "INR (₹) - Indian Rupee", value: "INR" },
  { label: "USD ($) - US Dollar", value: "USD" },
  { label: "EUR (€) - Euro", value: "EUR" },
  { label: "GBP (£) - British Pound", value: "GBP" },
  { label: "AED (د.إ) - UAE Dirham", value: "AED" },
  { label: "SAR (﷼) - Saudi Riyal", value: "SAR" },
  { label: "QAR (﷼) - Qatari Riyal", value: "QAR" },
  { label: "CAD ($) - Canadian Dollar", value: "CAD" },
  { label: "AUD ($) - Australian Dollar", value: "AUD" },
  { label: "SGD ($) - Singapore Dollar", value: "SGD" },
  { label: "JPY (¥) - Japanese Yen", value: "JPY" },
  { label: "CNY (¥) - Chinese Yuan", value: "CNY" },
  { label: "MYR (RM) - Malaysian Ringgit", value: "MYR" },
  { label: "THB (฿) - Thai Baht", value: "THB" },
  { label: "BHD (.د.b) - Bahraini Dinar", value: "BHD" },
  { label: "KWD (د.ك) - Kuwaiti Dinar", value: "KWD" },
  { label: "OMR (ر.ع.) - Omani Rial", value: "OMR" },
];

export const CURRENCY_MAP = {
  INR: { symbol: "₹", name: "Indian Rupee" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  AED: { symbol: "د.إ", name: "UAE Dirham" },
  SAR: { symbol: "﷼", name: "Saudi Riyal" },
  QAR: { symbol: "﷼", name: "Qatari Riyal" },
  CAD: { symbol: "$", name: "Canadian Dollar" },
  AUD: { symbol: "$", name: "Australian Dollar" },
  SGD: { symbol: "$", name: "Singapore Dollar" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
  MYR: { symbol: "RM", name: "Malaysian Ringgit" },
  THB: { symbol: "฿", name: "Thai Baht" },
  BHD: { symbol: ".د.ب", name: "Bahraini Dinar" },
  KWD: { symbol: "د.ك", name: "Kuwaiti Dinar" },
  OMR: { symbol: "ر.ع.", name: "Omani Rial" },
  NZD: { symbol: "$", name: "New Zealand Dollar" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  ZAR: { symbol: "R", name: "South African Rand" },
};
