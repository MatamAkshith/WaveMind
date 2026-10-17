import { request } from "./api.js";

export function getInsights(token) {
  return request("/api/v1/insights/summary", { method: "GET", token });
}
