import { getData, postData, patchData, deleteData } from "./apiServices";

// GET /api/v1/users?page=1&limit=10&search=&order=ASC
export const getUsersList = (queryParams) => getData(`/users?${queryParams}`);

// GET /api/v1/users/{id}
export const getUserById = (id) => getData(`/users/${id}`);

// POST /api/v1/users
export const createUser = (data) => postData("/users", data);

// PATCH /api/v1/users/{id}
export const updateUser = (id, data) => patchData(`/users/${id}`, data);

// DELETE /api/v1/users/{id}
export const deleteUser = (id) => deleteData(`/users/${id}`);

// PATCH /api/v1/users/{id}/status
export const toggleUserStatus = (id, isActive) =>
  patchData(`/users/${id}/status`, { isActive });

// GET /api/v1/roles
export const getRolesList = (queryParams = "") => {
  const query = queryParams ? `?${queryParams}` : "";
  return getData(`/roles${query}`);
};

// POST /api/v1/users/{id}/reset-password
export const resetUserPassword = (id, data = {}) =>
  postData(`/users/${id}/reset-password`, data);
