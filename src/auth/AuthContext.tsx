import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Role = Database["public"]["Enums"]["app_role"];

type SignInResult = { ok: true; role: Role } | { ok: false; kind: "credentials" | "unconfirmed" | "configuration" | "connection" };

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: (sessionOverride?: Session | null) => Promise<Role | null>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (sessionOverride?: Session | null) => {
    const activeSession = sessionOverride === undefined ? session : sessionOverride;
    const userId = activeSession?.user.id;
    if (!userId) {
      setProfile(null);
      setRole(null);
      return null;
    }
    const [profileResult, roleResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
    ]);
    if (profileResult.error || roleResult.error) {
      console.error("[Auth identity]", profileResult.error ?? roleResult.error);
      setProfile(null);
      setRole(null);
      return null;
    }
    setProfile(profileResult.data);
    setRole(roleResult.data.role);
    return roleResult.data.role;
  }, [session]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await refreshProfile(data.session);
      if (active) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "TOKEN_REFRESHED") return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }
      void refreshProfile(nextSession).finally(() => setLoading(false));
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setLoading(false);
      const message = error?.message.toLowerCase() ?? "";
      console.error("[Sign in]", error);
      if (message.includes("confirm")) return { ok: false, kind: "unconfirmed" };
      if (message.includes("invalid login") || message.includes("invalid credentials")) return { ok: false, kind: "credentials" };
      if (message.includes("fetch") || message.includes("network")) return { ok: false, kind: "connection" };
      return { ok: false, kind: "configuration" };
    }
    setSession(data.session);
    setUser(data.user);
    const nextRole = await refreshProfile(data.session);
    setLoading(false);
    if (!nextRole) return { ok: false, kind: "configuration" };
    return { ok: true, role: nextRole };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null); setUser(null); setProfile(null); setRole(null);
  }, []);

  const value = useMemo<AuthValue>(() => ({ user, session, profile, role, loading, isAuthenticated: Boolean(session && user), signIn, signOut, refreshProfile }), [user, session, profile, role, loading, signIn, signOut, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function destinationForRole(role: Role | null) {
  if (role === "admin") return "/admin" as const;
  if (role === "teacher") return "/professor" as const;
  return "/aluno" as const;
}