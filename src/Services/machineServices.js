import { getData, postData, patchData, deleteData } from "./apiServices";

/**
 * GET /api/v1/machines?page=1&limit=20&search=...&isActive=...
 * Fetch paginated machines list with optional filters
 */
export const getMachinesList = (queryParams = "") => {
  const query = queryParams ? `?${queryParams}` : "";
  return getData(`/machines${query}`);
};

/**
 * GET /api/v1/machines/{id}
 * Fetch single machine full details
 */
export const getMachineById = (id) => {
  return getData(`/machines/${id}`);
};

/**
 * PATCH /api/v1/machines/{id}/status
 * Toggle or update machine active/inactive status
 * Payload: { isActive: "active" | "inactive" }
 */
export const updateMachineStatus = (id, isActive) => {
  return patchData(`/machines/${id}/status`, { isActive });
};

/**
 * DELETE /api/v1/machines/{id}
 * Permanently delete a machine by ID
 */
export const deleteMachine = (id) => {
  return deleteData(`/machines/${id}`);
};

/**
 * GET /api/v1/machines/registration-tokens?page=1&limit=20&search=...&status=pending
 * Fetch registration tokens list
 */
export const getRegistrationTokens = (queryParams = "") => {
  const query = queryParams ? `?${queryParams}` : "";
  return getData(`/machines/registration-tokens${query}`);
};

/**
 * POST /api/v1/machines/registration-tokens
 * Generate a new machine registration token
 * Payload: { label: string, expiresInHours: number }
 */
export const createRegistrationToken = (data) => {
  return postData("/machines/registration-tokens", data);
};

/**
 * DELETE /api/v1/machines/registration-tokens/{id}
 * Delete or revoke a registration token by ID
 */
export const deleteRegistrationToken = (id) => {
  return deleteData(`/machines/registration-tokens/${id}`);
};
