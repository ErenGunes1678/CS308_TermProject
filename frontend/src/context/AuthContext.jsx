import { createContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();

        if (isMounted) {
          setUser(currentUser || null);
        }
      } catch (error) {
        if (isMounted) {
          if (error?.response?.status === 401) {
            setUser(null);
          } else {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.user || null);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    setUser(data.user || null);
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clear local user state even if the backend logout request fails.
    }

    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
