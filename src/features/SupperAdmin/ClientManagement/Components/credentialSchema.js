import { z } from "zod";

/**
 * Generate dynamic Zod validation schema based on whether form is in Add or Edit mode.
 * In Edit mode, password & T-PIN fields are optional so existing credentials aren't overwritten.
 */
export const getCredentialSchema = (isEdit = false) => {
  return z
    .object({
      refundType: z.string().trim().min(1, "Refund Type is required."),
      serviceProvider: z.string().trim().min(1, "Service Provider is required."),

      // Amadeus fields
      amadeusUserId: z.string().trim().optional(),
      amadeusPassword: z.string().optional(),
      amadeusDefaultOfficeId: z.string().trim().optional(),
      amadeusOfficeIds: z
        .array(
          z.object({
            iata: z
              .string()
              .trim()
              .optional()
              .refine(
                (val) => !val || /^\d{7,8}$/.test(val),
                {
                  message: "IATA must be between 7 OR 8 digits.",
                }
              ),
            officeId: z.string().trim().optional(),
          })
        )
        .optional(),

      // Galileo fields
      galileoSignOn: z.string().trim().optional(),
      galileoPcc: z.string().trim().optional(),
      galileoPassword: z.string().optional(),
      galileoTPin: z.string().optional(),

      // Sabre fields
      sabreAgentId: z.string().trim().optional(),
      sabrePcc: z.string().trim().optional(),
      sabrePassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const prov = data.serviceProvider?.toLowerCase();

      // Validate provider-specific required fields
      if (prov === "amadeus") {
        if (!data.amadeusUserId || data.amadeusUserId.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amadeusUserId"],
            message: "Amadeus User ID is required.",
          });
        }
        if (!isEdit && (!data.amadeusPassword || data.amadeusPassword.trim().length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amadeusPassword"],
            message: "Amadeus Password is required.",
          });
        }
        if (!data.amadeusDefaultOfficeId || data.amadeusDefaultOfficeId.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amadeusDefaultOfficeId"],
            message: "Default Office ID is required.",
          });
        }
      } else if (prov === "galileo") {
        if (!data.galileoSignOn || data.galileoSignOn.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["galileoSignOn"],
            message: "Galileo Sign-On is required.",
          });
        }
        if (!data.galileoPcc || data.galileoPcc.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["galileoPcc"],
            message: "Galileo PCC is required.",
          });
        }
        if (!isEdit && (!data.galileoPassword || data.galileoPassword.trim().length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["galileoPassword"],
            message: "Galileo Password is required.",
          });
        }
        if (!isEdit && (!data.galileoTPin || data.galileoTPin.trim().length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["galileoTPin"],
            message: "Galileo T-PIN is required.",
          });
        }
      } else if (prov === "sabre") {
        if (!data.sabreAgentId || data.sabreAgentId.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sabreAgentId"],
            message: "Sabre Agent ID is required.",
          });
        }
        if (!data.sabrePcc || data.sabrePcc.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sabrePcc"],
            message: "Sabre PCC is required.",
          });
        }
        if (!isEdit && (!data.sabrePassword || data.sabrePassword.trim().length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sabrePassword"],
            message: "Sabre Password is required.",
          });
        }
      }
    });
};

/**
 * Builds a clean, provider-scoped payload for API submission.
 */
export const buildCredentialPayload = (data, isEdit = false, clientId = null) => {
  const prov = data.serviceProvider?.toLowerCase();
  let payload = {};

  if (!isEdit && clientId) {
    payload.clientId = clientId;
    payload.refundType = data.refundType;
    payload.serviceProvider = prov;
  }

  if (prov === "amadeus") {
    const validOfficeIds = (data.amadeusOfficeIds || []).filter(
      (item) => item.iata?.trim() || item.officeId?.trim()
    );

    payload.amadeusUserId = data.amadeusUserId?.trim();
    if (data.amadeusPassword?.trim()) {
      payload.amadeusPassword = data.amadeusPassword.trim();
    }
    payload.amadeusDefaultOfficeId = data.amadeusDefaultOfficeId?.trim();
    payload.amadeusOfficeIds = validOfficeIds;
  } else if (prov === "galileo") {
    payload.galileoSignOn = data.galileoSignOn?.trim();
    payload.galileoPcc = data.galileoPcc?.trim();
    if (data.galileoPassword?.trim()) {
      payload.galileoPassword = data.galileoPassword.trim();
    }
    if (data.galileoTPin?.trim()) {
      payload.galileoTPin = data.galileoTPin.trim();
    }
  } else if (prov === "sabre") {
    payload.sabreAgentId = data.sabreAgentId?.trim();
    payload.sabrePcc = data.sabrePcc?.trim();
    if (data.sabrePassword?.trim()) {
      payload.sabrePassword = data.sabrePassword.trim();
    }
  }

  return payload;
};
