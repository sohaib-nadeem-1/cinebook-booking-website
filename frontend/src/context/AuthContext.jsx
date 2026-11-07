import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  authService,
  readSession,
} from "../services/authService.js";

const AuthCtx = createContext(null);

const PERMISSIONS = {
  system_admin: [
    "dashboard",
    "movies",
    "movies:delete",
    "showtimes",
    "bookings",
    "bookings:refund",
    "users",
    "users:manage",
    "settings",
  ],

  box_office: [
    "dashboard",
    "movies",
    "showtimes",
    "bookings",
    "bookings:refund",
  ],

  admin: [
    "dashboard",
    "movies",
    "movies:delete",
    "showtimes",
    "bookings",
    "bookings:refund",
    "users",
    "users:manage",
    "settings",
  ],

  "Box Office Staff": [
    "dashboard",
    "movies",
    "showtimes",
    "bookings",
    "bookings:refund",
  ],

  staff: [
    "dashboard",
    "movies",
    "showtimes",
    "bookings",
  ],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readSession("customer")
  );

  const [admin, setAdmin] = useState(() =>
    readSession("admin")
  );

  const login = useCallback(async (creds) => {
    const loggedInUser = await authService.login({
      ...creds,
      portal: "customer",
    });

    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const adminLogin = useCallback(async (creds) => {
    const loggedInAdmin = await authService.login({
      ...creds,
      portal: "admin",
    });

    setAdmin(loggedInAdmin);

    return loggedInAdmin;
  }, []);

  const register = useCallback(async (data) => {
    const newUser = await authService.register(data);

    setUser(newUser);

    return newUser;
  }, []);

  const guest = useCallback(() => {
    const guestUser = authService.continueAsGuest();

    setUser(guestUser);

    return guestUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout("customer");
    setUser(null);
  }, []);

  const adminLogout = useCallback(() => {
    authService.logout("admin");
    setAdmin(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setAdmin(null);
        return;
      }

      const profile = await authService.getProfile();

      setUser(profile);
    } catch {
      authService.logout("customer");
      setUser(null);
    }
  }, []);

  const can = useCallback(
    (permission) => {
      if (!admin) return false;

      const role = admin.userRole || admin.role;

      return (
        PERMISSIONS[role]?.includes(permission) || false
      );
    },
    [admin]
  );

  const value = useMemo(
    () => ({
      user,

      admin,

      isCustomer:
        !!user && !user.guest,

      isGuest:
        !!user?.guest,

      isAdmin:
        !!admin,

      login,

      adminLogin,

      register,

      guest,

      logout,

      adminLogout,

      refresh,

      can,
    }),
    [
      user,
      admin,
      login,
      adminLogin,
      register,
      guest,
      logout,
      adminLogout,
      refresh,
      can,
    ]
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);