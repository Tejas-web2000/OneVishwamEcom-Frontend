import axios from "axios";
import { auth } from "../firebase/config";
import { isJwtExpired } from "../utils/tokenUtils";

const DEFAULT_API_URL = "https://asia-south1-onevishwam.cloudfunctions.net/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Role": "user",
    "X-Account-Type": "user",
  },
});

// Request Interceptor: Attach fresh Firebase ID Token dynamically
API.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};
    config.headers["X-Client-Role"] = "user";
    config.headers["X-Account-Type"] = "user";
    try {
      if (auth && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }
      const currentUser = auth?.currentUser;
      if (currentUser) {
        let idToken = await currentUser.getIdToken(false);
        if (isJwtExpired(idToken)) {
          idToken = await currentUser.getIdToken(true);
        }
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
          localStorage.setItem("accessToken", idToken);
        }
      } else {
        const legacyToken = localStorage.getItem("accessToken");
        if (legacyToken) {
          if (isJwtExpired(legacyToken)) {
            localStorage.removeItem("accessToken");
          } else {
            config.headers.Authorization = `Bearer ${legacyToken}`;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to get Firebase ID token:", err);
    }

    // Prevent double /api prefix if baseURL already ends with /api
    if (config.baseURL?.endsWith("/api") && config.url?.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamlessly refresh expired Firebase token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const msg = error.response?.data?.message || "";

    const isTokenExpired =
      status === 401 &&
      (msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("token"));

    if (isTokenExpired && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (auth && typeof auth.authStateReady === "function") {
          await auth.authStateReady();
        }
        const currentUser = auth?.currentUser;
        if (currentUser) {
          const freshToken = await currentUser.getIdToken(true);
          if (freshToken) {
            localStorage.setItem("accessToken", freshToken);
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return API(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.warn("[API] Failed to refresh Firebase token on 401:", refreshErr);
      }

      // If token refresh failed and no active currentUser, clear stale tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default API;
