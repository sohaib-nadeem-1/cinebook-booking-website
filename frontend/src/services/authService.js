
import { api, ApiError } from "./api.js";

const KEYS = {
  customer: "session",
  admin: "adminSession",
};

// Save login session
const saveSession = (kind, token, user, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;

  // Remove old session from both storages
  localStorage.removeItem(KEYS[kind]);
  sessionStorage.removeItem(KEYS[kind]);

  storage.setItem(
    KEYS[kind],
    JSON.stringify({
      token,
      user,
    })
  );

  // Authorization header ke liye
  localStorage.setItem("token", token);
};

// Read saved session
export const readSession = (kind = "customer") => {
  const raw =
    localStorage.getItem(KEYS[kind]) ||
    sessionStorage.getItem(KEYS[kind]);

  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    return session.user || null;
  } catch {
    localStorage.removeItem(KEYS[kind]);
    sessionStorage.removeItem(KEYS[kind]);

    return null;
  }
};

export const authService = {
  // LOGIN
  login: async ({
    email,
    password,
    remember = true,
    portal = "customer",
  }) => {
    const response = await api.post("/login", {
      email,
      password,
    });

    const token = response.token;

    if (!token) {
      throw new ApiError(
        "Token was not returned by server",
        "INVALID_RESPONSE"
      );
    }

    localStorage.setItem("token", token);

    const profileResponse = await api.get("/profile");

    const user = profileResponse.data;

    if (!user) {
      throw new ApiError(
        "User profile not found",
        "PROFILE_NOT_FOUND"
      );
    }

    const role = user.userRole || user.role;

    const staffRoles = [
      "admin",
      "staff",
      "system_admin",
      "box_office",
      "Box Office Staff",
    ];

    const isStaff = staffRoles.includes(role);

    if (portal === "admin" && !isStaff) {
      localStorage.removeItem("token");

      throw new ApiError(
        "This account does not have access to the admin console.",
        "FORBIDDEN"
      );
    }

    if (portal === "customer" && isStaff) {
      localStorage.removeItem("token");

      throw new ApiError(
        "Staff accounts sign in through the Admin Portal.",
        "WRONG_PORTAL"
      );
    }

    saveSession(portal, token, user, remember);

    return user;
  },

  // REGISTER
  register: async ({
    name,
    email,
    phone,
    password,
  }) => {
    const response = await api.post("/register", {
      name,
      email,
      phone,
      password,
    });

    const token = response.token;

    if (!token) {
      throw new ApiError(
        "Token was not returned by server",
        "INVALID_RESPONSE"
      );
    }

    localStorage.setItem("token", token);

    const profileResponse = await api.get("/profile");

    const user = profileResponse.data;

    if (!user) {
      throw new ApiError(
        "User profile not found",
        "PROFILE_NOT_FOUND"
      );
    }

    saveSession("customer", token, user, true);

    return user;
  },

  // GET PROFILE
  getProfile: async () => {
    const response = await api.get("/profile");

    if (!response.data) {
      throw new ApiError(
        "User profile not found",
        "PROFILE_NOT_FOUND"
      );
    }

    return response.data;
  },

  // CHANGE PASSWORD
  changePassword: async (userId, passwordData) => {
    const response = await api.patch(
      "/change-password",
      {
        current: passwordData.current,
        next: passwordData.next,
        confirm: passwordData.confirm,
      }
    );

    return response;
  },

  // GUEST LOGIN
  continueAsGuest: () => {
    const guest = {
      id: "guest",
      name: "Guest",
      role: "guest",
      guest: true,
    };

    sessionStorage.setItem(
      KEYS.customer,
      JSON.stringify({
        user: guest,
        token: null,
      })
    );

    return guest;
  },

  // LOGOUT
  logout: (kind = "customer") => {
    localStorage.removeItem(KEYS[kind]);
    sessionStorage.removeItem(KEYS[kind]);

    localStorage.removeItem("token");
  },
};
