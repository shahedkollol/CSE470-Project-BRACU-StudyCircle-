const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson && data?.message ? data.message : res.statusText;
    throw new Error(message || "Request failed");
  }
  return data;
}

export const api = {
  auth: {
    login: (body) => request("/users/login", { method: "POST", body }),
    register: (body) => request("/users/register", { method: "POST", body }),
  },
  studyGroups: {
    list: () => request("/study-groups"),
    create: (body, token) =>
      request("/study-groups", { method: "POST", body, token }),
  },
  events: {
    list: () => request("/events"),
    create: (body, token) =>
      request("/events", { method: "POST", body, token }),
    rsvp: (id, userId, token) =>
      request(`/events/${id}/rsvp`, {
        method: "POST",
        body: { userId },
        token,
      }),
    cancel: (id, userId, token) =>
      request(`/events/${id}/cancel`, {
        method: "POST",
        body: { userId },
        token,
      }),
  },
  tutoring: {
    listPosts: () => request("/tutoring/posts"),
    createPost: (body, token) =>
      request("/tutoring/posts", { method: "POST", body, token }),
    listSessions: () => request("/tutoring/sessions"),
    createSession: (body, token) =>
      request("/tutoring/sessions", { method: "POST", body, token }),
  },
  resources: {
    list: () => request("/resources"),
    create: (body, token) =>
      request("/resources", { method: "POST", body, token }),
    bookmark: (id, userId, token) =>
      request(`/resources/${id}/bookmark`, {
        method: "POST",
        body: { userId },
        token,
      }),
    unbookmark: (id, userId, token) =>
      request(`/resources/${id}/bookmark`, {
        method: "DELETE",
        body: { userId },
        token,
      }),
    bookmarks: (userId, token) =>
      request(`/resources/bookmarks/${userId}`, { token }),
  },
  thesis: {
    listGroups: () => request("/thesis/groups"),
    createGroup: (body, token) =>
      request("/thesis/groups", { method: "POST", body, token }),
    joinGroup: (id, userId, token) =>
      request(`/thesis/groups/${id}/join`, {
        method: "PUT",
        body: { userId },
        token,
      }),
    search: (query) =>
      request(
        `/thesis/repository/search${
          query ? `?keyword=${encodeURIComponent(query)}` : ""
        }`
      ),
    createThesis: (body, token) =>
      request("/thesis/repository", { method: "POST", body, token }),
  },
  community: {
    listJobs: () => request("/community/jobs"),
    createJob: (body, token) =>
      request("/community/jobs", { method: "POST", body, token }),
    listMentorship: () => request("/community/mentorship"),
    createMentorship: (body, token) =>
      request("/community/mentorship", { method: "POST", body, token }),
  },
  admin: {
    listUsers: (token) => request("/admin/users", { token }),
    updateRole: (id, role, token) =>
      request(`/admin/users/${id}/role`, {
        method: "PUT",
        body: { role },
        token,
      }),
    deleteUser: (id, token) =>
      request(`/admin/users/${id}`, { method: "DELETE", token }),
  },
};

export { API_BASE };
