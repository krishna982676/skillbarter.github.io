import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { getProfileById } from "../api/profileApi";

const AuthContext = createContext(null);

function mapAuthUser(authUser, profile) {
  const fallbackName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split("@")[0] || "User";
  return {
    id: profile?.id || authUser?.id,
    email: profile?.email || authUser?.email || "",
    full_name: profile?.full_name || fallbackName,
    avatar_url: profile?.avatar_url || null,
    bio: profile?.bio || "",
    location: profile?.location || "",
    credits: profile?.credits ?? 0,
    trust_score: profile?.trust_score ?? 0,
    rating: profile?.rating ?? 0,
    rating_count: profile?.rating_count ?? 0,
    exchanges: profile?.exchanges ?? 0,
    role: profile?.role || "user",
    status: profile?.status || "active",
    skills_offered: profile?.skills_offered || [],
    skills_wanted: profile?.skills_wanted || [],
    availability: profile?.availability || [],
    last_seen: profile?.last_seen || null,
    created_at: profile?.created_at || authUser?.created_at || null,
    updated_at: profile?.updated_at || authUser?.updated_at || null,
  };
}

async function resolveProfile(authUser) {
  if (!authUser?.id) return null;

  const existing = await getProfileById(authUser.id).catch(() => null);
  if (existing) {
    return mapAuthUser(authUser, existing);
  }

  const created = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (created.error) {
    throw new Error(created.error.message || "Failed to initialize profile");
  }

  return mapAuthUser(authUser, created.data);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const nextSession = data.session;
        if (!active) return;

        if (nextSession?.user) {
          const resolvedUser = await resolveProfile(nextSession.user);
          if (!active) return;
          setSession(nextSession);
          setUser(resolvedUser);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch {
        if (!active) return;
        setSession(null);
        setUser(null);
      }

      if (active) {
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;

      setLoading(true);
      try {
        if (nextSession?.user) {
          const resolvedUser = await resolveProfile(nextSession.user);
          if (!active) return;
          setSession(nextSession);
          setUser(resolvedUser);
        } else {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || "Failed to sign in");
    }
    const resolvedUser = await resolveProfile(data.user);
    setUser(resolvedUser);
    setSession(data.session);
    return { user: resolvedUser };
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || email.split("@")[0],
        },
      },
    });
    if (error) {
      throw new Error(error.message || "Failed to sign up");
    }
    if (!data.user) {
      throw new Error("Sign up succeeded but no user was returned.");
    }
    if (!data.session) {
      throw new Error("Sign up succeeded. Check your email to confirm the account, then sign in.");
    }
    const resolvedUser = await resolveProfile(data.user);
    setUser(resolvedUser);
    setSession(data.session);
    return { user: resolvedUser };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
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
