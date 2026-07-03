// src/axiosConfig.js
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export default axios;