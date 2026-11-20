export const filteredPayload = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map(filteredPayload)
      .filter(
        (item) =>
          item !== undefined &&
          item !== null &&
          item !== ""
      );
  }

  if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const filteredValue = filteredPayload(value);

      const isEmptyObject =
        typeof filteredValue === "object" &&
        !Array.isArray(filteredValue) &&
        filteredValue !== null &&
        Object.keys(filteredValue).length === 0;

      if (
        filteredValue !== undefined &&
        filteredValue !== null &&
        filteredValue !== "" &&
        !isEmptyObject
      ) {
        acc[key] = filteredValue;
      }

      return acc;
    }, {});
  }

  return obj;
};