import { request } from "./api.js";

export function createJournalEntry(content, token) {
  return request("/api/v1/journals", {
    method: "POST",
    token,
    body: JSON.stringify({ content }),
  });
}

export function getJournalEntries(token) {
  return request("/api/v1/journals", { method: "GET", token });
}

export function deleteJournalEntry(entryId, token) {
  return request(`/api/v1/journals/${encodeURIComponent(entryId)}`, {
    method: "DELETE",
    token,
  });
}
