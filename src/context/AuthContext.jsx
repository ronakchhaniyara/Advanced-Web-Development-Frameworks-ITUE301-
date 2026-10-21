import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [, setToken] = useState(() => localStorage.getItem("portfolio_auth_token"));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("portfolio_auth_token");
    setToken(null);
    setUser(null);
  }, []);

  // Initialize and verify authentication on app mount
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem("portfolio_auth_token");
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
    } catch {
      // Token invalid or expired
      localStorage.removeItem("portfolio_auth_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();

    // Handle token expiry dispatched from api.js
    const handleUnauthorized = () => {
      logout();
      setAuthError("Your session expired. Please log in again.");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [checkAuth, logout]);

  const login = async (email, password) => {
    setAuthError(null);
    const response = await loginUser(email, password);
    const receivedToken = response.data.token;
    const receivedUser = response.data.user;

    localStorage.setItem("portfolio_auth_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    const response = await registerUser(name, email, password);
    const receivedToken = response.data.token;
    const receivedUser = response.data.user;

    localStorage.setItem("portfolio_auth_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
