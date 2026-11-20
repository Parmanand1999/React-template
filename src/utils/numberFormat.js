/**
 * Utility functions for formatting numbers and currencies consistently across the application.
 */

/**
 * Formats a number with standard thousand-separator commas.
 * Example: 1450230 -> "1,450,230"
 * Example: 1450230.5 with decimals=2 -> "1,450,230.50"
 *
 * @param {number|string} value - The numerical value to format
 * @param {number} [decimals=0] - Minimum and maximum decimal places (default: 0)
 * @returns {string} Formatted number string with commas
 */
export const formatNumberWithCommas = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a currency amount with standard 2 decimal places and thousand-separator commas.
 * Example: 1450230 -> "1,450,230.00"
 * Example: 1450230, "INR" -> "INR 1,450,230.00"
 *
 * @param {number|string} amount - The amount to format
 * @param {string} [currency=""] - Optional currency code or symbol (e.g., "INR", "USD", "₹")
 * @returns {string} Formatted currency string
 */
export const formatCurrencyAmount = (amount, currency = "") => {
  if (amount === null || amount === undefined || amount === "") {
    return currency ? `${currency} 0.00` : "0.00";
  }

  const num = Number(amount);
  if (isNaN(num)) {
    return currency ? `${currency} 0.00` : "0.00";
  }

  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency ? `${currency} ${formatted}` : formatted;
};
