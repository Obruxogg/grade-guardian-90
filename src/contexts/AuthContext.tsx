import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "teacher" | "student" | null;

export interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  status: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    role?: AppRole;
    error?: string;
    technicalError?: string;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, status")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileErr) {
        console.error("[AuthContext] Error fetching profile:", profileErr);
      }

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        // Fallback: create default profile if missing
        const metadata = currentUser.user_metadata as Record<string, any> | undefined;
        const fallbackName = (metadata?.['full_name'] as string | undefined) || currentUser.email?.split("@")[0] || "Usuário";
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            full_name: fallbackName,
            email: currentUser.email ?? null,
            status: "active",
          })
          .select("id, full_name, email, status")
          .maybeSingle();

        if (newProfile) setProfile(newProfile as UserProfile);
      }

      // 2. Fetch User Role
      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (roleErr) {
        console.error("[AuthContext] Error fetching user role:", roleErr);
      }

      if (roleData) {
        setRole(roleData.role as AppRole);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("[AuthContext] Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user) {
        loadUserData(initSession.user);
      } else {
        setLoading(false);
      }
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadUserData(newSession.user);
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        console.error("[AuthContext] Sign in error detail:", authErr);
        let userMessage = "E-mail ou senha incorretos.";
        
        if (authErr.message.includes("Email not confirmed")) {
          userMessage = "Conta de e-mail ainda não confirmada. Verifique sua caixa de entrada.";
        } else if (authErr.message.includes("Failed to fetch") || authErr.status === 0) {
          userMessage = "Não foi possível conectar ao servidor. Verifique sua conexão de internet.";
        } else if (authErr.status === 400 || authErr.message.includes("Invalid login credentials")) {
          userMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
        }

        setLoading(false);
        return {
          success: false,
          error: userMessage,
          technicalError: authErr.message,
        };
      }

      const signedInUser = data.user;
      setUser(signedInUser);
      setSession(data.session);

      // Load profile & role immediately
      let userRole: AppRole = null;
      if (signedInUser) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", signedInUser.id)
          .maybeSingle();

        if (roleData) {
          userRole = roleData.role as AppRole;
          setRole(userRole);
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email, status")
          .eq("id", signedInUser.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData as UserProfile);
        }
      }

      setLoading(false);
      return {
        success: true,
        role: userRole,
      };
    } catch (err) {
      console.error("[AuthContext] Unexpected sign-in exception:", err);
      setLoading(false);
      return {
        success: false,
        error: "Ocorreu um erro inesperado durante o login. Tente novamente.",
        technicalError: err instanceof Error ? err.message : String(err),
      };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isAuthenticated: !!user && !!role,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
