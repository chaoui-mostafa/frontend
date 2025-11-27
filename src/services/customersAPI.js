// src/services/customersAPI.js
import api from '../services/api';


export const customersAPI = {
  getAll: () => api.get("/customers"),
  create: (data) => api.post("/customers", data),
  // add update/delete endpoints if needed:
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};
