import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

if (!backendUrl) {
  console.warn(
    "VITE_BACKEND_URL is not set. API requests will fail until it is configured.",
  );
}

axios.defaults.baseURL = backendUrl || undefined;
axios.defaults.withCredentials = true;

export default axios;
