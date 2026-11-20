export const formatActionTitle = (action = "") => {
  return String(action).replaceAll("_", " ");
};

// export const formatDate = (value) => {
//   if (!value) return { date: "-", time: "" };

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return { date: value, time: "" };
//   }

//   return {
//     date: date.toLocaleDateString("en-IN"),
//     time: date.toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//   };
// };

export const getDynamicKeyStatus = (log) => {
  const keyName = log?.keyName;
  if (!keyName) return null;

  return log?.afterData?.[keyName] || null;
};

// export const getLogStatus = (log) => {
//   return (
//     log?.afterData?.fieldStatus ||
//     log?.afterData?.result ||
//     log?.afterData?.status ||
//     log?.afterData?.qcVerification?.status ||
//     getDynamicKeyStatus(log) ||
//     log?.beforeData?.fieldStatus ||
//     "-"
//   );
// };

// export const normalizeLog = (log) => {
//   const dateInfo = formatDate(log?.timestamp);

//   return {
//     id: log?._id,
//     action: log?.action || "-",
//     title: formatActionTitle(log?.action),
//     category: log?.category || "-",
//     role: log?.performedBy?.roleName || log?.role || "-",
//     actorName: log?.performedBy?.name || "-",
//     keyName: log?.keyName || "",
//     status: getLogStatus(log),
//     timestamp: log?.timestamp,
//     date: dateInfo.date,
//     time: dateInfo.time,
//     raw: log,
//   };
// };

// export const normalizeLogSort = (logs = []) => {
//   return logs
//     .map(normalizeLog)
//     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
// };

export const getStatusColor = (status = "") => {
  const value = String(status).toUpperCase();

  if (
    value.includes("REJECTED") ||
    value.includes("NOT_VERIFIED") ||
    value.includes("FAILED")
  ) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (
    value.includes("VERIFIED") ||
    value.includes("SUCCESS") ||
    value.includes("COMPLETED")
  ) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (
    value.includes("REVERIFY") ||
    value.includes("RE_VERIFY") ||
    value.includes("PENDING") ||
    value.includes("IN_PROGRESS")
  ) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};



