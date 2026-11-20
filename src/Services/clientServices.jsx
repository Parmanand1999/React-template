import { getData, postData, patchData, deleteData } from "./apiServices";

// GET /api/v1/clients?page=1&limit=10&search=&order=DESC
export const getClientsList = (queryParams = "") => {
  const query = queryParams ? `?${queryParams}` : "";
  return getData(`/clients${query}`);
};

// GET /api/v1/clients/{id}
export const getClientById = (id) => getData(`/clients/${id}`);

// POST /api/v1/clients
export const createClient = (data) => postData("/clients", data);

// PATCH /api/v1/clients/{id}
export const updateClient = (id, data) => patchData(`/clients/${id}`, data);

// DELETE /api/v1/clients/{id}
export const deleteClient = (id) => deleteData(`/clients/${id}`);

// PATCH /api/v1/clients/{id}/status
export const toggleClientStatus = (id, isActive) =>
  patchData(`/clients/${id}/status`, { isActive });

// ============================================
// CLIENT CREDENTIALS API ENDPOINTS (/api/v1/client-credentials)
// ============================================

// GET /api/v1/client-credentials?clientId={clientId}
export const getClientCredentials = (clientId) =>
  getData(`/client-credentials?clientId=${clientId}`);

// GET /api/v1/client-credentials/{id}
export const getClientCredentialById = (id) =>
  getData(`/client-credentials/${id}`);

// POST /api/v1/client-credentials
export const createClientCredentials = (data) =>
  postData("/client-credentials", data);

// PATCH /api/v1/client-credentials/{id}
export const updateClientCredentials = (id, data) =>
  patchData(`/client-credentials/${id}`, data);

// PATCH /api/v1/client-credentials/{id}/status
export const toggleClientCredentialStatus = (id, isActive) =>
  patchData(`/client-credentials/${id}/status`, { isActive });

// DELETE /api/v1/client-credentials/{id}
export const deleteClientCredential = (id) =>
  deleteData(`/client-credentials/${id}`);

// GET /api/v1/client-credentials/{id}/secrets
export const getClientCredentialSecrets = (id) =>
  getData(`/client-credentials/${id}/secrets`);


