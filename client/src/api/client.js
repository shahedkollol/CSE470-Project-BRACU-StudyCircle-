const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, { method = "GET", token, body, user } = {}) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";

  // Lightweight header-based guard: propagate user id/role if available
  let effectiveUser = user;
  if (!effectiveUser && typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        effectiveUser = JSON.parse(saved)?.user;
      } catch (err) {
        console.error("Failed to parse auth", err);
      }
    }
  }

  if (effectiveUser?.id || effectiveUser?._id) {
    headers["x-user-id"] = effectiveUser.id || effectiveUser._id;
  }
  if (effectiveUser?.role) {
    headers["x-user-role"] = effectiveUser.role;
  }

  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
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
    listPosts: (params = {}) => {
      const qs = new URLSearchParams();
      ["subject", "postType", "meetingMode", "availability", "sort"].forEach(
        (key) => {
          if (params[key]) qs.set(key, params[key]);
        }
      );
      [
        ["rateMin", params.rateMin],
        ["rateMax", params.rateMax],
        ["page", params.page],
        ["limit", params.limit],
      ].forEach(([key, val]) => {
        if (val !== undefined && val !== "") qs.set(key, val);
      });

      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request(`/tutoring/posts${suffix}`);
    },
    createPost: (body, token) =>
      request("/tutoring/posts", { method: "POST", body, token }),
    listSessions: () => request("/tutoring/sessions"),
    createSession: (body, token) =>
      request("/tutoring/sessions", { method: "POST", body, token }),
    updateSessionStatus: (id, status, token) =>
      request(`/tutoring/sessions/${id}/status`, {
        method: "PUT",
        body: { status },
        token,
      }),
    rateSession: (id, body, token) =>
      request(`/tutoring/sessions/${id}/rating`, {
        method: "POST",
        body,
        token,
      }),
    leaderboard: () => request("/tutoring/leaderboard"),
    listFavorites: (token) => request("/tutoring/favorites", { token }),
    addFavorite: (tutorId, token) =>
      request(`/tutoring/favorites/${tutorId}`, { method: "POST", token }),
    removeFavorite: (tutorId, token) =>
      request(`/tutoring/favorites/${tutorId}`, { method: "DELETE", token }),
  },
  resources: {
    list: (params = {}) => {
      const qs = new URLSearchParams();
      [
        "subject",
        "department",
        "tag",
        "search",
        "fileType",
        "minRating",
        "from",
        "to",
      ].forEach((key) => {
        if (params[key]) qs.set(key, params[key]);
      });
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request(`/resources${suffix}`);
    },
    create: (body, token) =>
      request("/resources", {
        method: "POST",
        body:
          body?.file && typeof FormData !== "undefined"
            ? (() => {
              const fd = new FormData();
              Object.entries(body).forEach(([key, val]) => {
                if (val === undefined || val === null) return;
                if (key === "file") {
                  fd.append("file", val);
                } else if (Array.isArray(val)) {
                  val.forEach((item) => fd.append(key, item));
                } else {
                  fd.append(key, val);
                }
              });
              return fd;
            })()
            : body,
        token,
      }),
    bookmark: (id, token) =>
      request(`/resources/${id}/bookmark`, { method: "POST", token }),
    unbookmark: (id, token) =>
      request(`/resources/${id}/bookmark`, { method: "DELETE", token }),
    bookmarks: (userId, token) =>
      request(`/resources/bookmarks/${userId}`, { token }),
    addReview: (id, body, token) =>
      request(`/resources/${id}/reviews`, { method: "POST", body, token }),
    trackView: (id) => request(`/resources/${id}/view`, { method: "POST" }),
    trackDownload: (id) =>
      request(`/resources/${id}/download`, { method: "POST" }),
    report: (id, body, token) =>
      request(`/resources/${id}/report`, { method: "POST", body, token }),
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
    // Repository
    listRepository: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.department) qs.set("department", params.department);
      if (params.keyword) qs.set("keyword", params.keyword);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request(`/thesis/repository${suffix}`);
    },
    search: (query) =>
      request(
        `/thesis/repository/search${query ? `?keyword=${encodeURIComponent(query)}` : ""
        }`
      ),
    getThesis: (id) => request(`/thesis/repository/${id}`),
    createThesis: (body, token) => {
      // Handle FormData for file uploads
      if (body.pdf || body.code) {
        const fd = new FormData();
        Object.entries(body).forEach(([key, val]) => {
          if (val === undefined || val === null) return;
          if (key === "pdf" || key === "code") {
            fd.append(key, val);
          } else if (Array.isArray(val)) {
            val.forEach((item) => fd.append(key, item));
          } else {
            fd.append(key, val);
          }
        });
        return request("/thesis/repository", { method: "POST", body: fd, token });
      }
      return request("/thesis/repository", { method: "POST", body, token });
    },
    upvote: (id, token) =>
      request(`/thesis/repository/${id}/upvote`, { method: "POST", token }),
    downvote: (id, token) =>
      request(`/thesis/repository/${id}/downvote`, { method: "POST", token }),
    addReview: (id, body, token) =>
      request(`/thesis/repository/${id}/reviews`, { method: "POST", body, token }),
    getCitation: (id) => request(`/thesis/repository/${id}/cite`),
    trackDownload: (id) =>
      request(`/thesis/repository/${id}/download`, { method: "POST" }),
  },
  community: {
    listJobs: () => request("/community/jobs"),
    createJob: (body, token) =>
      request("/community/jobs", { method: "POST", body, token }),
    listMentorship: () => request("/community/mentorship"),
    createMentorship: (body, token) =>
      request("/community/mentorship", { method: "POST", body, token }),
    listMyMentorship: (token) =>
      request("/community/mentorship/mine", { token }),
    updateMentorshipStatus: (id, status, token) =>
      request(`/community/mentorship/${id}/status`, {
        method: "PUT",
        body: { status },
        token,
      }),
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
  user: {
    me: (token) => request("/users/me", { token }),
    updateMe: (body, token) =>
      request("/users/me", { method: "PUT", body, token }),
    updateById: (id, body, token) =>
      request(`/users/${id}`, { method: "PUT", body, token }),
  },
  alumni: {
    listMine: (token) => request("/alumni/employment/me", { token }),
    create: (body, token) =>
      request("/alumni/employment", { method: "POST", body, token }),
    update: (id, body, token) =>
      request(`/alumni/employment/${id}`, { method: "PUT", body, token }),
    remove: (id, token) =>
      request(`/alumni/employment/${id}`, { method: "DELETE", token }),
    search: (params = {}) => {
      const qs = new URLSearchParams();
      ["company", "industry", "title", "location"].forEach((k) => {
        if (params[k]) qs.set(k, params[k]);
      });
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request(`/alumni/employment/search${suffix}`);
    },
    analytics: () => request("/alumni/employment/analytics"),
  },
  notifications: {
    list: (token) => request("/notifications", { token }),
    markRead: (id, token) =>
      request(`/notifications/${id}/read`, { method: "PUT", token }),
  },
};

export { API_BASE };
