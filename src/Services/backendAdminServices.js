import axiosInstance from "@/lib/axiosInstance";

export const getBackendAdminList = async (params) => {
  try {
    const res = await axiosInstance.get("/backend-admin", { params });
    return res;
  } catch (error) {
    return { status: 200, data: { data: [], total: 0 } };
  }
};

export const addBackendAdmin = async (payload) => {
  return await axiosInstance.post("/backend-admin", payload);
};

export const updateBackendAdmin = async (id, payload) => {
  return await axiosInstance.put(`/backend-admin/${id}`, payload);
};

export const deleteBackendAdmin = async (id) => {
  return await axiosInstance.delete(`/backend-admin/${id}`);
};

export const activeInActiveUser = async (payload) => {
  return await axiosInstance.patch("/backend-admin/status", payload);
};

export const resetAdminUserPassword = async (payload) => {
  return await axiosInstance.post("/backend-admin/reset-password", payload);
};

export const backendAdminDetails = async (id) => {
  return await axiosInstance.get(`/backend-admin/${id}`);
};

export const getBackendAdminById = async (id) => {
  return await axiosInstance.get(`/backend-admin/${id}`);
};

export const roleList = async () => {
  try {
    const res = await axiosInstance.get("/roles");
    return res;
  } catch (error) {
    return { status: 200, data: { data: [] } };
  }
};
