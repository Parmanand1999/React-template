import axios from "axios";

// Free API Key docs.countrystatecity.in se le kar .env me VITE_CSC_API_KEY daal sakte hain
const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY || "";

const cscClient = axios.create({
  baseURL: "https://api.countrystatecity.in/v1",
  headers: {
    "X-CSCAPI-KEY": CSC_API_KEY,
  },
});

// 1. Get All Countries via REST API
export const getCountriesFromApi = async () => {
  const res = await cscClient.get("/countries");
  return res.data; // [{ id, name, iso2 }, ...]
};

// 2. Get States by Country ISO2 (e.g., 'IN') via REST API
export const getStatesByCountryFromApi = async (countryIso2) => {
  if (!countryIso2) return [];
  const res = await cscClient.get(`/countries/${countryIso2}/states`);
  return res.data; // [{ id, name, iso2 }, ...]
};

// 3. Get Cities by Country & State ISO2 (e.g., 'IN' & 'MH') via REST API
export const getCitiesByStateFromApi = async (countryIso2, stateIso2) => {
  if (!countryIso2 || !stateIso2) return [];
  const res = await cscClient.get(
    `/countries/${countryIso2}/states/${stateIso2}/cities`
  );
  return res.data; // [{ id, name }, ...]
};
