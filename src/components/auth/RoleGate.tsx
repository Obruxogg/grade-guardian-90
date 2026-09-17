import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldX } from "lucide-react";
import { useAuth, destinationForRole } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export function RoleGate({ allow, children }: { allow: Array<"admin" | "teacher" | "student">; children: ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) void navigate({ to: "/login", replace: true });
  }, [auth.loading, auth.isAuthenticated, navigate]);
  if (auth.loading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary" aria-label="Carregando acesso" /></div>;
  if (!auth.isAuthenticated) return null;
  if (!auth.role || !allow.includes(auth.role)) return <main className="grid min-h-screen place-items-center bg-background px-5"><section className="max-w-md text-center"><ShieldX className="mx-auto size-12 text-destructive"/><h1 className="mt-5 font-display text-3xl font-semibold">Acesso negado</h1><p className="mt-2 text-muted-foreground">Sua conta não possui permissão para acessar esta área.</p><Button className="mt-6" onClick={() => void navigate({ to: destinationForRole(auth.role), replace: true })}>Ir para meu painel</Button></section></main>;
  return children;
}