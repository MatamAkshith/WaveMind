import { request } from "./api.js";

export function createMood(entry, token) {
  return request("/api/v1/moods", {
    method: "POST",
    token,
    body: JSON.stringify({
      category: entry.category,
      intensity: Number(entry.intensity),
      reflection: entry.reflection?.trim() || null,
    }),
  });
}

export function getMoods({ token } = {}) {
  return request("/api/v1/moods", { method: "GET", token });
}

export function deleteMood(moodId, token) {
  return request(`/api/v1/moods/${encodeURIComponent(moodId)}`, {
    method: "DELETE",
    token,
  });
}
