import axios from 'axios';
import { auth } from './firebase/config';

const DEFAULT_API_URL = 'https://asia-south1-onevishwam.cloudfunctions.net/api';

const client = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    DEFAULT_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (status) => status >= 200 && status < 400,
});

import { isJwtExpired } from './utils/tokenUtils';

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

client.interceptors.request.use(async (config) => {
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
        localStorage.setItem('accessToken', idToken);
      }
    } else {
      const token = localStorage.getItem('accessToken');
      if (token) {
        if (isJwtExpired(token)) {
          localStorage.removeItem('accessToken');
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (isJwtExpired(token)) {
        localStorage.removeItem('accessToken');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 1. First attempt to refresh via active Firebase user session
      try {
        if (auth && typeof auth.authStateReady === 'function') {
          await auth.authStateReady();
        }
        const currentUser = auth?.currentUser;
        if (currentUser) {
          const freshToken = await currentUser.getIdToken(true);
          if (freshToken) {
            localStorage.setItem('accessToken', freshToken);
            processQueue(null, freshToken);
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return client(originalRequest);
          }
        }
      } catch (fbRefreshErr) {
        console.warn('[API Client] Firebase token refresh failed:', fbRefreshErr);
      }

      // 2. Fallback: refresh via backend refreshToken if available
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      }

      try {
        const { data } = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccess = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);

        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return client(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (body) => client.post('/auth/login', body),
  register: (body) => client.post('/auth/register', body),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  getMe: () => client.get('/auth/me'),
  updateProfile: (body) => client.put('/auth/profile', body),
  changePassword: (body) => client.put('/auth/password', body),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  verifyOtp: (body) => client.post('/auth/verify-otp', body),
  resendOtp: (email) => client.post('/auth/resend-otp', { email }),
  resetPasswordWithOtp: (body) => client.post('/auth/reset-password', body),
  deleteAccount: () => client.delete('/auth/account'),
  toggleSave: (listingId) => client.post('/auth/save', { listingId }),
  getSaved: () => client.get('/auth/saved'),
};

// ─── Public ──────────────────────────────────────────────────────────────────
export const publicAPI = {
  getLoans: (params) => client.get('/loans', { params }),
  sendEnquiry: (body) => client.post('/enquiries', body),
  submitReview: (body) => client.post('/reviews', body),
  getUserReviews: (userId) => client.get(`/users/${userId}/reviews`),
};

// ─── Property ────────────────────────────────────────────────────────────────
export const propertyAPI = {
  getAll: (params) => client.get('/product/properties', { params }),
  getById: (id) => client.get(`/product/properties/${id}`),
  search: (params) => client.get('/product/properties/search', { params }),
  getFeatured: () => client.get('/product/properties/featured'),
  getLatest: (params) => client.get('/product/properties/latest', { params }),
  getByCity: (city, params) => client.get(`/product/properties/by-city/${city}`, { params }),
  getByArea: (area, params) => client.get(`/product/properties/by-area/${area}`, { params }),
  getByType: (type, params) => client.get(`/product/properties/by-type/${type}`, { params }),
  getByCategory: (category, params) => client.get(`/product/properties/by-category/${category}`, { params }),
  getSimilar: (id) => client.get(`/product/properties/similar/${id}`),
  update: (id, body) => client.put(`/product/properties/${id}`, body),
  remove: (id) => client.delete(`/product/properties/${id}`),
  toggleStatus: (id) => client.patch(`/product/properties/${id}/status`),
  getMy: () => client.get('/product/properties/my/listings'),
  submitRequirement: (body) => client.post('/product/properties/requirements', body),
};

// ─── Vehicle ─────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll: (params) => client.get('/product/vehicles', { params }),
  getById: (id) => client.get(`/product/vehicles/${id}`),
  getSimilar: (id) => client.get(`/product/vehicles/similar/${id}`),
  getMy: () => client.get('/product/vehicles/my'),
  update: (id, body) => client.put(`/product/vehicles/${id}`, body),
  remove: (id) => client.delete(`/product/vehicles/${id}`),
  toggleStatus: (id) => client.patch(`/product/vehicles/${id}/status`),
};

// ─── Grocery ─────────────────────────────────────────────────────────────────
export const groceryAPI = {
  getAll: (params) => client.get('/product/groceries', { params }),
  getById: (id) => client.get(`/product/groceries/${id}`),
  getSimilar: (id) => client.get(`/product/groceries/similar/${id}`),
  getMy: () => client.get('/product/groceries/my'),
  update: (id, body) => client.put(`/product/groceries/${id}`, body),
  remove: (id) => client.delete(`/product/groceries/${id}`),
  toggleStatus: (id) => client.patch(`/product/groceries/${id}/status`),
};

// ─── Garment ─────────────────────────────────────────────────────────────────
export const garmentAPI = {
  getAll: (params) => client.get('/product/garments', { params }),
  getById: (id) => client.get(`/product/garments/${id}`),
  getSimilar: (id) => client.get(`/product/garments/similar/${id}`),
  getMy: () => client.get('/product/garments/my'),
  update: (id, body) => client.put(`/product/garments/${id}`, body),
  remove: (id) => client.delete(`/product/garments/${id}`),
  toggleStatus: (id) => client.patch(`/product/garments/${id}/status`),
};

// ─── Jewellery ───────────────────────────────────────────────────────────────
export const jewelleryAPI = {
  getAll: (params) => client.get('/product/jewellery', { params }),
  getById: (id) => client.get(`/product/jewellery/${id}`),
  getSimilar: (id) => client.get(`/product/jewellery/${id}/similar`),
  getMy: () => client.get('/product/jewellery/my'),
  update: (id, body) => client.put(`/product/jewellery/${id}`, body),
  remove: (id) => client.delete(`/product/jewellery/${id}`),
  toggleStatus: (id) => client.patch(`/product/jewellery/${id}/status`),
};

// ─── Finance ─────────────────────────────────────────────────────────────────
export const financeAPI = {
  getAll: (params) => client.get('/product/finance', { params }),
  getById: (id) => client.get(`/product/finance/${id}`),
  getSimilar: (id) => client.get(`/product/finance/similar/${id}`),
  getMy: () => client.get('/product/finance/my'),
  update: (id, body) => client.put(`/product/finance/${id}`, body),
  remove: (id) => client.delete(`/product/finance/${id}`),
  toggleStatus: (id) => client.patch(`/product/finance/${id}/status`),
};

// ─── Finance Offerings ───────────────────────────────────────────────────────
export const financeOfferingAPI = {
  getAll: (params) => client.get('/product/finance-offerings', { params }),
  getById: (id) => client.get(`/product/finance-offerings/${id}`),
  getSimilar: (id) => client.get(`/product/finance-offerings/similar/${id}`),
  getMy: () => client.get('/product/finance-offerings/my'),
  update: (id, body) => client.put(`/product/finance-offerings/${id}`, body),
  remove: (id) => client.delete(`/product/finance-offerings/${id}`),
  toggleStatus: (id) => client.patch(`/product/finance-offerings/${id}/status`),
};

// ─── Electronics ─────────────────────────────────────────────────────────────
export const electronicsAPI = {
  getAll: (params) => client.get('/product/electronics', { params }),
  getById: (id) => client.get(`/product/electronics/${id}`),
  getSimilar: (id) => client.get(`/product/electronics/${id}/similar`),
  getMy: () => client.get('/product/electronics/my'),
  update: (id, body) => client.put(`/product/electronics/${id}`, body),
  remove: (id) => client.delete(`/product/electronics/${id}`),
  toggleStatus: (id) => client.patch(`/product/electronics/${id}/status`),
};

// ─── Bedding & Sleep Comfort ──────────────────────────────────────────────────
export const beddingAPI = {
  getAll: (params) => client.get('/product/bedding', { params }),
  getById: (id) => client.get(`/product/bedding/${id}`),
  getSimilar: (id) => client.get(`/product/bedding/${id}/similar`),
  getMy: () => client.get('/product/bedding/my'),
  update: (id, body) => client.put(`/product/bedding/${id}`, body),
  remove: (id) => client.delete(`/product/bedding/${id}`),
  toggleStatus: (id) => client.patch(`/product/bedding/${id}/status`),
};

// ─── Homepage ────────────────────────────────────────────────────────────────
export const homepageAPI = {
  getHomepageData: () => client.get('/homepage'),
};

export default client;
