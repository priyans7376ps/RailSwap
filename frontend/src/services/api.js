// src/services/api.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// =========================
// TOKEN FUNCTIONS
// =========================

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("access_token_payload");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  window.location.href = "/login";
}

// =========================
// URL BUILDER
// =========================

function buildUrl(url = "") {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = url.replace(/^\/+/, "");
  return `${base}/${path}`;
}

// =========================
// RESPONSE HANDLER
// =========================

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

// =========================
// MAIN API REQUEST
// =========================

export async function apiRequest({ method = "GET", url, data = null, headers = {} }) {
  const token = getToken();

  const requestHeaders = { ...headers };

  if (!(data instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(buildUrl(url), {
      method,
      headers: requestHeaders,
      body:
        data === null
          ? undefined
          : data instanceof FormData
          ? data
          : JSON.stringify(data),
    });

    const result = await parseResponse(response);

    if (!response.ok) {
      const hadTokenAtRequestTime = !!token;
      if (
        (response.status === 401 || response.status === 403) &&
        hadTokenAtRequestTime
      ) {
        clearToken();
        redirectToLogin();
      }

      throw {
        status: response.status,
        message:
          result?.message ||
          result?.error ||
          `Request failed ${response.status}`,
        raw: result,
      };
    }

    return result;
  } catch (error) {
    if (error?.status) throw error;

    throw {
      status: 500,
      message: error?.message || "Network error",
      raw: error,
    };
  }
}

// =========================
// AUTH
// =========================

export const loginUser = (data) =>
  apiRequest({ method: "POST", url: "/api/auth/login", data });

export const registerUser = (data) =>
  apiRequest({ method: "POST", url: "/api/auth/register", data });

export const logoutUser = () => {
  clearToken();
  redirectToLogin();
};

let profilePromise = null;

export const getProfile = () => {
  if (profilePromise) return profilePromise;
  profilePromise = apiRequest({ method: "GET", url: "/api/user/profile" }).finally(() => {
    profilePromise = null;
  });
  return profilePromise;
};

export const updateProfile = (data) =>
  apiRequest({ method: "PUT", url: "/api/user/profile", data });

export const getDashboardSummary = () =>
  apiRequest({ method: "GET", url: "/api/user/dashboard/summary" });

// =========================
// TICKETS
// =========================

export const verifyTicket = (data) =>
  apiRequest({ method: "POST", url: "/api/ticket/verify", data });

export const uploadTicketWithProgress = ({ formData, onProgress }) => {
  if (!(formData instanceof FormData)) {
    return Promise.reject(new Error("formData must be a FormData instance"));
  }

  const token = getToken();
  const url = buildUrl("/api/tickets/create");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = () => {
      const status = xhr.status;
      const text = xhr.responseText || "";

      let result = text;
      try {
        result = text ? JSON.parse(text) : text;
      } catch {
        // keep as text
      }

      if (status >= 200 && status < 300) {
        resolve(result);
        return;
      }

      if (status === 401 || status === 403) {
        clearToken();
        redirectToLogin();
      }

      reject({
        status,
        message: result?.message || result?.error || `Request failed ${status}`,
        raw: result,
      });
    };

    xhr.onerror = () => {
      reject({ status: 500, message: "Network error", raw: xhr });
    };

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        onProgress(percent);
      };
    }

    xhr.send(formData);
  });
};

export const searchTickets = (params) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest({ method: "GET", url: `/api/tickets/search?${query}` });
};

export const getMyTickets = () =>
  apiRequest({ method: "GET", url: "/api/tickets/mine" });

export const getSearchHistory = () =>
  apiRequest({ method: "GET", url: "/api/tickets/search/history" });

export const clearSearchHistory = () =>
  apiRequest({ method: "DELETE", url: "/api/tickets/search/history" });

// =========================
// REQUESTS
// =========================

export const createRequest = (data) =>
  apiRequest({ method: "POST", url: "/api/requests", data });

export const getMyRequests = () =>
  apiRequest({ method: "GET", url: "/api/requests/me" });

export const deleteRequest = (id) =>
  apiRequest({ method: "DELETE", url: `/api/requests/${id}` });

// =========================
// BOOKMARKS
// =========================

export const saveTicket = (ticket_id) =>
  apiRequest({ method: "POST", url: "/api/bookmarks", data: { ticket_id } });

export const getSavedTickets = () =>
  apiRequest({ method: "GET", url: "/api/bookmarks" });

export const removeSavedTicket = (ticket_id) =>
  apiRequest({ method: "DELETE", url: `/api/bookmarks/${ticket_id}` });

// =========================
// MATCHING
// =========================

export const getMatches = (params) => {
  const query = params ? new URLSearchParams(params).toString() : "";
  return apiRequest({ method: "GET", url: `/api/matches${query ? `?${query}` : ""}` });
};

// =========================
// PAYMENT
// =========================

export const startPayment = (data) =>
  apiRequest({ method: "POST", url: "/api/payment/start", data });

export const confirmPayment = (data) =>
  apiRequest({ method: "POST", url: "/api/payment/confirm", data });

export const cancelPayment = (data) =>
  apiRequest({ method: "POST", url: "/api/payment/cancel", data });

// =========================
// CHAT
// =========================

export const sendMessage = (data) =>
  apiRequest({ method: "POST", url: "/api/chat/send", data });

export const getMessages = (receiver_id) =>
  apiRequest({
    method: "GET",
    url: `/api/chat/messages?receiver_id=${encodeURIComponent(receiver_id)}`,
  });

// =========================
// RATINGS
// =========================

export const createRating = (data) =>
  apiRequest({ method: "POST", url: "/api/rating/create", data });

// =========================
// NOTIFICATIONS
// =========================

export const getNotifications = () =>
  apiRequest({ method: "GET", url: "/api/notifications" });

export const markNotificationAsRead = (id) =>
  apiRequest({ method: "PUT", url: `/api/notifications/${id}/read` });

export const markAllNotificationsAsRead = () =>
  apiRequest({ method: "PUT", url: "/api/notifications/read-all" });

// =========================
// REPORTS
// =========================

export const createReport = (data) =>
  apiRequest({ method: "POST", url: "/api/reports", data });

// =========================
// ADMIN
// =========================

export const adminLogin = (data) =>
  apiRequest({ method: "POST", url: "/api/admin/auth/login", data });

export const adminGetDashboardKpis = (params = {}) =>
  apiRequest({
    method: "GET",
    url: `/api/admin/dashboard/kpis${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params).toString()}` : ""}`,
  });

export const adminListUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest({ method: "GET", url: `/api/admin/users${query ? `?${query}` : ""}` });
};

// =========================
// HELPERS
// =========================

export function getAccessTokenPayload() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  return decodeJwtPayload(token);
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const hasAuthToken = () => !!getToken();
