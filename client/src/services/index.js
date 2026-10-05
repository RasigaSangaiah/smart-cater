import api from "./api";

// ---- Auth ----
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ---- Caterers ----
export const catererService = {
  list: (params) => api.get("/caterers", { params }),
  getById: (id) => api.get(`/caterers/${id}`),
  getMyProfile: () => api.get("/caterers/me/profile"),
  getMyDashboard: () => api.get("/caterers/me/dashboard"),
  create: (data) => api.post("/caterers", data),
  update: (id, data) => api.put(`/caterers/${id}`, data),
  getAvailability: (id) => api.get(`/caterers/${id}/availability`),
  setAvailability: (id, data) => api.post(`/caterers/${id}/availability`, data),
};

// ---- Menu ----
export const menuService = {
  getByCaterer: (catererId) => api.get(`/menus/${catererId}`),
  create: (data) => api.post("/menus", data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  remove: (id) => api.delete(`/menus/${id}`),
};

// ---- Bookings ----
export const bookingService = {
  create: (data) => api.post("/bookings", data),
  list: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// ---- Payments ----
export const paymentService = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verify: (data) => api.post("/payments/verify", data),
};

// ---- Reviews ----
export const reviewService = {
  create: (data) => api.post("/reviews", data),
  getByCaterer: (catererId) => api.get(`/reviews/${catererId}`),
};

// ---- Admin ----
export const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`),
  getCaterers: (params) => api.get("/admin/caterers", { params }),
  approveCaterer: (id, approved) => api.put(`/admin/caterers/${id}/approve`, { approved }),
  getBookings: (params) => api.get("/admin/bookings", { params }),
  exportUrl: () => {
    const token = localStorage.getItem("smartcater_token");
    return `/api/admin/export?token=${encodeURIComponent(token || "")}`;
  },
};
