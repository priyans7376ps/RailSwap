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

  const contentType =
    response.headers.get("content-type") || "";


  if (contentType.includes("application/json")) {

    return await response.json();

  }

  return await response.text();

}




// =========================
// MAIN API REQUEST
// =========================

export async function apiRequest({

  method = "GET",

  url,

  data = null,

  headers = {},

}) {


  const token = getToken();


  const requestHeaders = {
    ...headers,
  };



  // JSON header only when not uploading file

  if (!(data instanceof FormData)) {

    requestHeaders["Content-Type"] =
      "application/json";

  }



  // JWT

  if (token) {

    requestHeaders["Authorization"] =
      `Bearer ${token}`;

  }



  try {


    const response = await fetch(

      buildUrl(url),

      {

        method,

        headers: requestHeaders,

        body:

          data === null

            ? undefined

            : data instanceof FormData

            ? data

            : JSON.stringify(data),

      }

    );


    const result =

      await parseResponse(response);




    // =========================

    // ERROR RESPONSE

    // =========================

    if (!response.ok) {


      // Only hard-redirect/clear token if we *actually* sent a token.

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


  }




  catch(error) {



    console.error(
      "API ERROR MESSAGE:",
      error?.message
    );


    console.error(
      "API ERROR STATUS:",
      error?.status
    );


    console.error(
      "API ERROR FULL:",
      JSON.stringify(error, null, 2)
    );



    throw {


      status:

        error?.status || 500,


      message:

        error?.message ||

        "Network error",


      raw:

        error,

    };


  }


}





export const loginUser = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/auth/login",
    data,
  });

export const registerUser = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/auth/register",
    data,
  });

export const logoutUser = () => {
  clearToken();
  redirectToLogin();
};

let profilePromise = null;

export const getProfile = () => {
  if (profilePromise) return profilePromise;
  profilePromise = apiRequest({
    method: "GET",
    url: "/api/user/profile",
  }).finally(() => {
    profilePromise = null;
  });
  return profilePromise;
};


export const updateProfile = (data) =>
  apiRequest({
    method: "PUT",
    url: "/api/user/profile",
    data,
  });

export const verifyTicket = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/ticket/verify",
    data,
  });

// Upload with progress (XMLHttpRequest) so the UI can show upload bar.
export const uploadTicketWithProgress = ({
  formData,
  onProgress,
}) => {
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
      reject({
        status: 500,
        message: "Network error",
        raw: xhr,
      });
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
  return apiRequest({
    method: "GET",
    url: `/api/tickets/search?${query}`,
  });
};

// =========================
// ADMIN API HELPERS
// =========================

export const adminLogin = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/admin/auth/login",
    data,
  });

export const adminGetDashboardKpis = (params = {}) =>
  apiRequest({
    method: "GET",
    url: `/api/admin/dashboard/kpis${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params).toString()}` : ""}`,
  });

export const adminListUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest({
    method: "GET",
    url: `/api/admin/users${query ? `?${query}` : ""}`,
  });
};

// Client-side JWT payload decoder for RBAC checks.
// Note: this is not a security boundary; server still enforces 403.
export function getAccessTokenPayload() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  return decodeJwtPayload(token);
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}


export const getMatches = (params) => {
  const query = params ? new URLSearchParams(params).toString() : "";
  return apiRequest({
    method: "GET",
    url: `/api/matches${query ? `?${query}` : ""}`,
  });
};

// Backend payment endpoints are start/confirm/cancel.
export const startPayment = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/payment/start",
    data,
  });

export const confirmPayment = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/payment/confirm",
    data,
  });

export const cancelPayment = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/payment/cancel",
    data,
  });

export const sendMessage = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/chat/send",
    data,
  });

export const getMessages = (receiver_id) =>
  apiRequest({
    method: "GET",
    url: `/api/chat/messages?receiver_id=${encodeURIComponent(receiver_id)}`,
  });

export const createRating = (data) =>
  apiRequest({
    method: "POST",
    url: "/api/rating/create",
    data,
  });

// Protected helpers (optional)
export const hasAuthToken = () => !!getToken();

