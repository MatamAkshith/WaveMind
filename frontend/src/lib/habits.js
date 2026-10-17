import { request } from "./api.js";

export function createHabit(data, token) {
  return request("/api/v1/habits", {
    method: "POST",
    token,
    body: JSON.stringify({
      title: data.title,
      detail: data.detail?.trim() || null,
    }),
  });
}

export function getHabits(token) {
  return request("/api/v1/habits", { method: "GET", token });
}

export function updateHabit(habitId, done, token) {
  return request(`/api/v1/habits/${encodeURIComponent(habitId)}?done=${done}`, {
    method: "PATCH",
    token,
  });
}

export function deleteHabit(habitId, token) {
  return request(`/api/v1/habits/${encodeURIComponent(habitId)}`, {
    method: "DELETE",
    token,
  });
}
