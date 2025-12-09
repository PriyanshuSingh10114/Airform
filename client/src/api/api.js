import axios from "axios";

const api = axios.create({
  baseURL: "https://airform.onrender.com/", 
  withCredentials: true,
});

export const getBases = async () => {
  const { data } = await api.get("forms/bases");
  return data;
};

export const getTables = async (baseId) => {
  const { data } = await api.get(`forms/bases/${baseId}/tables`);
  return data;
};

export const createForm = async (formData) => {
  const { data } = await api.post("forms", formData);
  return data;
};

export const getMyForms = async () => {
  const { data } = await api.get("forms/my-forms");
  return data;
};

export const getForm = async (formId) => {
  const { data } = await api.get(`forms/${formId}`);
  return data;
};

export const submitResponse = async (formId, formData) => {
  const { data } = await api.post(`responses/${formId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getResponses = async (formId) => {
  const { data } = await api.get(`responses/${formId}/list`);
  return data;
};

export const updateResponseStatus = async (responseId, status) => {
  const { data } = await api.put(
    `responses/${responseId}/status`,
    { status },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return data;
};

export default api;
