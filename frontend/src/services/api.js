const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

let latency = import.meta.env.MODE === "test" ? 0 : 450;

export const setLatency = (ms) => {
  latency = ms;
};

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function simulate(fn, ms) {
  await wait(ms ?? latency);
  return fn();
}

export class ApiError extends Error {
  constructor(message, code = "ERROR", status = null) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      "Unable to connect to the server. Please try again.",
      "NETWORK_ERROR"
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Response body may be empty.
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || data?.Message || "Something went wrong",
      data?.code || "API_ERROR",
      response.status
    );
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "DELETE",
    }),
};