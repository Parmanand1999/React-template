import { getData, postData, deleteData } from "./apiServices";

// GET /api/v1/batches?page=1&limit=20&search=ds&order=DESC&clientId=...&refundType=...
export const getBatchesList = (queryParams = "") => {
  const query = queryParams ? `?${queryParams}` : "";
  return getData(`/batches${query}`);
};

// POST /api/v1/batches/upload (multipart/form-data)
export const uploadBatch = (formData, onUploadProgress) => {
  return postData("/batches/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

// GET /api/v1/batches/{id}
export const getBatchById = (id) => getData(`/batches/${id}`);

// GET /api/v1/batches/{batchId}/entries?page=1&limit=20&search=...&order=DESC&scrapingStatus=...&parsingStatus=...
export const getBatchEntries = (batchId, queryParams = "") => {
  if (
    typeof queryParams === "object" &&
    queryParams !== null &&
    !(queryParams instanceof URLSearchParams)
  ) {
    return getData(`/batches/${batchId}/entries`, queryParams);
  }
  const query = queryParams ? `?${queryParams.toString()}` : "";
  return getData(`/batches/${batchId}/entries${query}`);
};

// DELETE /api/v1/batches/{id} (if supported)
export const deleteBatch = (id) => deleteData(`/batches/${id}`);

// POST /api/v1/batches/{id}/assign
export const assignBatch = (id, data) => postData(`/batches/${id}/assign`, data);

// POST /api/v1/batches/{id}/send-to-review
export const sendBatchToReview = (id, data) =>
  postData(`/batches/${id}/send-to-review`, data);

// POST /api/v1/batches/{id}/review
export const reviewBatch = (id, data) =>
  postData(`/batches/${id}/review`, data);

// POST /api/v1/batches/{id}/remarks
export const addBatchRemark = (id, data) =>
  postData(`/batches/${id}/remarks`, data);

/**
 * POST /api/v1/batches/{id}/dispatch
 * Dispatch batch to a machine for scraping/processing
 * Payload: { machineId: string, priority: 0 | 1 }
 */
export const dispatchBatch = (id, data) =>
  postData(`/batches/${id}/dispatch`, data);

// GET /api/v1/batches/{batchId}/audit-logs?page=1&limit=20
export const getBatchAuditLogs = (batchId, queryParams = "") => {
  const query = queryParams ? (typeof queryParams === "string" ? `?${queryParams}` : "") : "";
  return getData(`/batches/${batchId}/audit-logs${query}`);
};


