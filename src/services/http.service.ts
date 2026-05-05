import axios from "axios";
import { BASE_URL } from "../constants/api.constants";
import { getToken, removeToken } from "../utils/token.utils";
import { ROUTES } from "../constants/routes.constants";

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach JWT token
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = ROUTES.SIGN_IN;
    }
    return Promise.reject(error);
  }
);

export default http;
