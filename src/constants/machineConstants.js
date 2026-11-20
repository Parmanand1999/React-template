export const MACHINE_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const MACHINE_ONLINE_OPTIONS = [
  { label: "All Connectivity", value: "all" },
  { label: "Online", value: "true" },
  { label: "Offline", value: "false" },
];

export const MACHINE_STATE_OPTIONS = [
  { label: "All States", value: "all" },
  { label: "Idle", value: "idle" },
  { label: "Processing", value: "processing" },
  { label: "Busy", value: "busy" },
  { label: "Offline", value: "offline" },
];

export const AVAILABLE_MODULE_OPTIONS = [
  { label: "Amadeus GDS", value: "amadeus", color: "blue" },
  { label: "IndiGo LCC", value: "indigo", color: "indigo" },
  { label: "Air India", value: "air_india", color: "amber" },
  { label: "SpiceJet", value: "spicejet", color: "rose" },
];

export const OS_PLATFORM_OPTIONS = [
  { label: "Windows (win32)", value: "win32" },
  { label: "Linux (linux)", value: "linux" },
  { label: "macOS (darwin)", value: "darwin" },
];

// Token Status Options matching user screenshot (-- / pending / used / expired / revoked)
export const TOKEN_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Used", value: "used" },
  { label: "Expired", value: "expired" },
  { label: "Revoked", value: "revoked" },
];

export const TOKEN_EXPIRY_PRESETS = [
  { label: "1 Hour", value: 1 },
  { label: "3 Hours", value: 3 },
  { label: "6 Hours", value: 6 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours (1 Day)", value: 24 },

];
