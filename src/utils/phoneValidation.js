import { isValidPhoneNumber } from "libphonenumber-js";
import { Country } from "country-state-city";

// Country ISO & Dial Code strict validation rules
const STRICT_COUNTRY_RULES = {
  IN: { regex: /^[6-9]\d{9}$/, desc: "10-digit number starting with 6, 7, 8, or 9", digits: 10 },
  "+91": { regex: /^[6-9]\d{9}$/, desc: "10-digit number starting with 6, 7, 8, or 9", digits: 10 },

  AE: { regex: /^5\d{8}$/, desc: "9-digit UAE number starting with 5 (e.g. 50, 52, 54, 55, 58)", digits: 9 },
  "+971": { regex: /^5\d{8}$/, desc: "9-digit UAE number starting with 5 (e.g. 50, 52, 54, 55, 58)", digits: 9 },

  US: { regex: /^[2-9]\d{2}[2-9]\d{6}$/, desc: "valid 10-digit US mobile number", digits: 10 },
  "+1": { regex: /^[2-9]\d{2}[2-9]\d{6}$/, desc: "valid 10-digit US/CA mobile number", digits: 10 },

  GB: { regex: /^7\d{9}$/, desc: "10-digit UK mobile number starting with 7", digits: 10 },
  "+44": { regex: /^7\d{9}$/, desc: "10-digit UK mobile number starting with 7", digits: 10 },

  SA: { regex: /^5\d{8}$/, desc: "9-digit Saudi mobile number starting with 5", digits: 9 },
  "+966": { regex: /^5\d{8}$/, desc: "9-digit Saudi mobile number starting with 5", digits: 9 },

  QA: { regex: /^[3567]\d{7}$/, desc: "8-digit Qatari mobile number starting with 3, 5, 6, or 7", digits: 8 },
  "+974": { regex: /^[3567]\d{7}$/, desc: "8-digit Qatari mobile number starting with 3, 5, 6, or 7", digits: 8 },

  SG: { regex: /^[89]\d{7}$/, desc: "8-digit Singapore mobile number starting with 8 or 9", digits: 8 },
  "+65": { regex: /^[89]\d{7}$/, desc: "8-digit Singapore mobile number starting with 8 or 9", digits: 8 },

  AU: { regex: /^4\d{8}$/, desc: "9-digit Australian mobile number starting with 4", digits: 9 },
  "+61": { regex: /^4\d{8}$/, desc: "9-digit Australian mobile number starting with 4", digits: 9 },
};

/**
 * Resolves country name or ISO string to 2-letter ISO country code (e.g., "India" -> "IN").
 */
export const getCountryIsoCode = (countryInput) => {
  if (!countryInput || typeof countryInput !== "string") return undefined;
  const input = countryInput.trim().toLowerCase();
  if (input.length === 2) return input.toUpperCase();

  const match = Country.getAllCountries().find(
    (c) => c.name.toLowerCase() === input || c.isoCode.toLowerCase() === input
  );
  return match ? match.isoCode : undefined;
};

/**
 * Next-level Strict Mobile Number Validator
 * @param {string} phone - Full mobile input string (e.g. "+91 9876543210" or "9876543210")
 * @param {string} [countryInput] - Country name, ISO code, or dial code (e.g. "India", "IN", "+91")
 * @returns {{ isValid: boolean, message: string }} Validation result object
 */
export const validateDetailedMobile = (phone, countryInput = null) => {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, message: "Mobile number is required" };
  }
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, message: "Mobile number is required" };
  }

  // Extract dial code prefix if present (+91, +971, etc.)
  let dialCode = "";
  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    const parts = trimmed.split(" ");
    if (parts.length > 1 && parts[0].startsWith("+")) {
      dialCode = parts[0].trim();
      digits = parts.slice(1).join("").replace(/\D/g, "");
    }
  }

  const isoCode = getCountryIsoCode(countryInput);
  const targetRule =
    STRICT_COUNTRY_RULES[isoCode] ||
    STRICT_COUNTRY_RULES[dialCode] ||
    (countryInput && STRICT_COUNTRY_RULES[countryInput.trim()]);

  // 1. Strict country rule check if rule exists for country / dial code
  if (targetRule) {
    if (!targetRule.regex.test(digits)) {
      return {
        isValid: false,
        message: `Invalid number format (${targetRule.desc})`,
      };
    }
    return { isValid: true, message: "" };
  }

  // 2. Global libphonenumber-js validation for other countries
  try {
    if (isoCode && isValidPhoneNumber(digits, isoCode)) {
      return { isValid: true, message: "" };
    }
    if (isValidPhoneNumber(trimmed)) {
      return { isValid: true, message: "" };
    }
  } catch (err) {
    console.warn("libphonenumber validation warning:", err);
  }

  // 3. Fallback international E.164 check (7-15 digits)
  if (digits.length >= 7 && digits.length <= 15) {
    return { isValid: true, message: "" };
  }

  return {
    isValid: false,
    message: "Please enter a valid mobile number (7-15 digits)",
  };
};

/**
 * Boolean wrapper for validateDetailedMobile
 */
export const validateInternationalMobile = (phone, countryInput = null) => {
  return validateDetailedMobile(phone, countryInput).isValid;
};
