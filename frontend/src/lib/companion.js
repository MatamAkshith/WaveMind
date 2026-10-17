import { request } from "./api.js";

export function sendCompanionMessage(message, token) {
  return sendCompanionMessageWithOptions(message, {}, token);
}

export function sendCompanionMessageWithOptions(message, options, token) {
  return request("/api/v1/companion/chat", {
    method: "POST",
    token,
    body: JSON.stringify({ message, ...options }),
  });
}

export function listConversations(token) {
  return request("/api/v1/chat/conversations", { token });
}

export function createConversation(token) {
  return request("/api/v1/chat/conversations", {
    method: "POST",
    token,
    body: JSON.stringify({}),
  });
}

export function getConversationMessages(conversationId, token) {
  return request(`/api/v1/chat/conversations/${conversationId}/messages`, { token });
}
