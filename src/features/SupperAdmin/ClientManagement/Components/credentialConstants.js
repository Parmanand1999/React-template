export const GDS_PROVIDERS = [
  {
    value: "amadeus",
    label: "Amadeus GDS",
    shortName: "Amadeus",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    themeColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderClass: "border-blue-100",
    headerBg: "bg-gradient-to-r from-blue-50/70 to-indigo-50/40",
  },
  {
    value: "galileo",
    label: "Galileo (Travelport)",
    shortName: "Galileo",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    themeColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderClass: "border-amber-100",
    headerBg: "bg-gradient-to-r from-amber-50/70 to-orange-50/40",
  },
  {
    value: "sabre",
    label: "Sabre GDS",
    shortName: "Sabre",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    themeColor: "text-rose-600",
    bgColor: "bg-rose-50",
    borderClass: "border-rose-100",
    headerBg: "bg-gradient-to-r from-rose-50/70 to-red-50/40",
  },
];

export const PROVIDER_MAP = {
  amadeus: GDS_PROVIDERS[0],
  galileo: GDS_PROVIDERS[1],
  sabre: GDS_PROVIDERS[2],
};

export const REFUND_TYPE_OPTIONS = [
  { value: "gds", label: "GDS" },
  { value: "lcc", label: "LCC" },
];
