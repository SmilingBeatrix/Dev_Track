import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "https://dev-track-kqza.onrender.com/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("devtrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("devtrack_token");
    localStorage.removeItem("devtrack_user");
    if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) window.location.href = "/login";
  }
  return Promise.reject(error);
});
export const messageOf = (e) => e.response?.data?.message || "Something went wrong. Please try again.";
export default api;
