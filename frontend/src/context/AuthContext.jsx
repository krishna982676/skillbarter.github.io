import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "skillbarter_auth_user";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.id) {
        setUser(parsed);
        setSession({ user: parsed });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const nextUser = {
      id: email,
      email,
      full_name: email.split("@")[0],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setSession({ user: nextUser });
    return { user: nextUser };
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const nextUser = {
      id: email,
      email,
      full_name: fullName?.trim() || email.split("@")[0],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setSession({ user: nextUser });
    return { user: nextUser };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signIn, signUp, signOut }),
    [loading, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
