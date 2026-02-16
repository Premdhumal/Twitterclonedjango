const API_BASE = import.meta.env.VITE_API_URL || '';

let csrfInitialized = false;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function initCSRF() {
  if (csrfInitialized) return;

  try {
    await fetch(`${API_BASE}/api/auth/status/`, {
      method: "GET",
      credentials: "include",
    });

    csrfInitialized = true;
  } catch (e) {
    console.warn("CSRF init failed", e);
  }
}

async function apiFetch(path, options = {}) {
  await initCSRF();

  const url = `${API_BASE}${path}`;

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const csrfToken = getCookie("csrftoken");

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(
      data?.error || data?.detail || "Request failed"
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// AUTH
export const authAPI = {
  status: () => apiFetch("/api/auth/status/"),

  login: (username, password) =>
    apiFetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiFetch("/api/auth/logout/", {
      method: "POST",
    }),

  register: (username, email, password) =>
    apiFetch("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
};

// TWEETS
export const tweetAPI = {
  list: () => apiFetch("/api/tweets/"),

  detail: (id) => apiFetch(`/api/tweets/${id}/`),

  create: (formData) =>
    apiFetch("/api/tweets/", {
      method: "POST",
      body: formData,
    }),

  update: (id, formData) =>
    apiFetch(`/api/tweets/${id}/`, {
      method: "PUT",
      body: formData,
    }),

  delete: (id) =>
    apiFetch(`/api/tweets/${id}/`, {
      method: "DELETE",
    }),

  like: (id) =>
    apiFetch(`/api/tweets/${id}/like/`, {
      method: "POST",
    }),
};

// NOTIFICATIONS
export const notifAPI = {
  list: () => apiFetch("/api/notifications/"),

  markRead: () =>
    apiFetch("/api/notifications/", {
      method: "POST",
    }),
};

// PROFILE
export const profileAPI = {
  get: (username) =>
    apiFetch(`/api/profile/${username}/`),

  update: (username, data) =>
    apiFetch(`/api/profile/${username}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  tweets: (username) =>
    apiFetch(`/api/profile/${username}/tweets/`),
};