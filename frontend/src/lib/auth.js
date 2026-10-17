import { request } from "./api.js";

export function login(credentials) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function register(userData) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
    }),
  });
}

export function getCurrentUser(token) {
  return request("/api/v1/auth/me", { method: "GET", token });
}

export function updateProfile(profile, token) {
  return request("/api/v1/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(profile),
  });
}

export function changePassword(passwords, token) {
  return request("/api/v1/auth/me/password", {
    method: "PATCH",
    token,
    body: JSON.stringify(passwords),
  });
}
