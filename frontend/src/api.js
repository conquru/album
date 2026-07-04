const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Ошибка запроса");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  fileUrl: (path) => (path ? `${API_URL}${path}` : null),

  register: (username, password) =>
    fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handle),

  login: (username, password) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handle),

  me: () => fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() }).then(handle),

  updateAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return fetch(`${API_URL}/api/auth/avatar`, {
      method: "PUT",
      headers: authHeaders(),
      body: form,
    }).then(handle);
  },

  getEvents: () => fetch(`${API_URL}/api/events`, { headers: authHeaders() }).then(handle),

  getEvent: (id) => fetch(`${API_URL}/api/events/${id}`, { headers: authHeaders() }).then(handle),

  createEvent: (fields, photos) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, value ?? ""));
    photos.forEach((file) => form.append("photos", file));
    return fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    }).then(handle);
  },

  updateEvent: (id, fields, photos) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, value ?? ""));
    photos.forEach((file) => form.append("photos", file));
    return fetch(`${API_URL}/api/events/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: form,
    }).then(handle);
  },

  deletePhoto: (eventId, photoId) =>
    fetch(`${API_URL}/api/events/${eventId}/photos/${photoId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle),

  deleteEvent: (id) =>
    fetch(`${API_URL}/api/events/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle),
};
