import axios from "axios";
import { v6 as uuidV6 } from "uuid";

const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const api = axios.create({
  baseURL: backendUrl || undefined,
  withCredentials: true,
});

if (!backendUrl) {
  console.warn(
    "VITE_BACKEND_URL is not set. API requests will fail until it is configured.",
  );
}

const clearStaleAuthState = () => {
  localStorage.removeItem("userInfo");
  localStorage.setItem("guestId", `guest_${uuidV6()}`);
};

const refreshClient = axios.create({
  baseURL: backendUrl || undefined,
  withCredentials: true,
});

let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/api/users/refresh")
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (
      status !== 401 ||
      originalRequest?._retry ||
      requestUrl.includes("/api/users/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return api(originalRequest);
    } catch (refreshError) {
      clearStaleAuthState();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
