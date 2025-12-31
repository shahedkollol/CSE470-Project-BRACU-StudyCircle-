import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch (err) {
        console.error("Failed to parse auth", err);
      }
    }
    setLoading(false);
  }, []);

  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: nextUser, token: nextToken })
      );
    } else {
      localStorage.removeItem("auth");
    }
  };

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    persist(res.user, res.token);
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.auth.register(payload);
    persist(res.user, res.token);
    return res.user;
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const me = await api.user.me(token);
    persist(me, token);
    return me;
  };

  const updateProfile = async (payload) => {
    if (!token) throw new Error("Not authenticated");
    const me = await api.user.updateMe(payload, token);
    persist(me, token);
    return me;
  };

  const logout = () => persist(null, null);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
