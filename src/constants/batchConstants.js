// Centralized common constants and dropdown options for Batch Management & Providers

export const AIRLINE_OPTIONS = [
  { label: "indigo", value: "indigo" },
  { label: "spicejet", value: "spicejet" },
  { label: "flydubai", value: "flydubai" },
  { label: "akasa", value: "akasa" },
  { label: "airasia", value: "airasia" },
];

export const REFUND_TYPE_OPTIONS = [
  { label: "GDS", value: "gds" },
  { label: "LCC", value: "lcc" },
];

export const SERVICE_PROVIDER_OPTIONS = [
  { label: "Amadeus", value: "amadeus" },
  { label: "Galileo", value: "galileo" },
  { label: "Sabre", value: "sabre" },
];

export const MONTH_OPTIONS = [
  { label: "January (01)", value: "1", name: "January", short: "Jan" },
  { label: "February (02)", value: "2", name: "February", short: "Feb" },
  { label: "March (03)", value: "3", name: "March", short: "Mar" },
  { label: "April (04)", value: "4", name: "April", short: "Apr" },
  { label: "May (05)", value: "5", name: "May", short: "May" },
  { label: "June (06)", value: "6", name: "June", short: "Jun" },
  { label: "July (07)", value: "7", name: "July", short: "Jul" },
  { label: "August (08)", value: "8", name: "August", short: "Aug" },
  { label: "September (09)", value: "9", name: "September", short: "Sep" },
  { label: "October (10)", value: "10", name: "October", short: "Oct" },
  { label: "November (11)", value: "11", name: "November", short: "Nov" },
  { label: "December (12)", value: "12", name: "December", short: "Dec" },
];

export const MONTH_NAMES = MONTH_OPTIONS.map((m) => m.name);

export const getMonthName = (month) => {
  const m = Number(month);
  return MONTH_NAMES[m - 1] || month || "";
};

const currentYear = new Date().getFullYear();
// Generate a wide range from currentYear - 10 to currentYear + 5 (e.g. 2016 to 2031)
export const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const yr = String(currentYear - 10 + i);
  return { label: yr, value: yr };
});

export const BATCH_STATUS_OPTIONS = [
  { label: "In Queue", value: "in_queue" },
  { label: "Ready to Process", value: "ready_to_process" },
  { label: "Checked", value: "checked" },
  { label: "Closed", value: "closed" },
  { label: "Error", value: "error" },
];
