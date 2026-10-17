import { request } from "./api.js";

export function getGoals(token) {
  return request("/api/v1/goals", { method: "GET", token });
}

export function createGoal(data, token) {
  return request("/api/v1/goals", {
    method: "POST",
    token,
    body: JSON.stringify({ title: data.title, description: data.description || null }),
  });
}

export function updateGoal(goalId, progress, token) {
  return request(`/api/v1/goals/${encodeURIComponent(goalId)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ progress: Number(progress) }),
  });
}

export function deleteGoal(goalId, token) {
  return request(`/api/v1/goals/${encodeURIComponent(goalId)}`, {
    method: "DELETE",
    token,
  });
}
