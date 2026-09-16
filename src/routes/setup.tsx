import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, CheckCircle2, Lock, ArrowRight, User, Mail, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Configuração Inicial | Repertório" },
      { name: "description", content: "Configuração inicial e criação do primeiro administrador do sistema." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setCheckingSetup(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("is_setup_required");
      if (rpcErr) {
        console.error("[Setup] RPC check error:", rpcErr);
        // Fallback: query user_roles table
        const { data: roles } = await supabase
          .from("user_roles")
          .select("id")
          .eq("role", "admin");
        setSetupRequired(!roles || roles.length === 0);
      } else {
        setSetupRequired(!!data);
      }
    } catch (err) {
      console.error("[Setup] Unexpected error checking setup status:", err);
      setSetupRequired(false);
    } finally {
      setCheckingSetup(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName || fullName.trim().length < 2) {
      setError("Por favor, informe seu nome completo.");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign up in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (authErr) {
        console.error("[Setup] Auth signup error:", authErr);
        setError(`Erro ao criar conta de autenticação: ${authErr.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Não foi possível criar o usuário de autenticação.");
        setLoading(false);
        return;
      }

      // Step 2: Invoke server RPC to assign admin profile & role
      const { error: rpcErr } = await supabase.rpc("bootstrap_admin", {
        p_full_name: fullName.trim(),
      });

      if (rpcErr) {
        console.error("[Setup] Bootstrap RPC error:", rpcErr);
        setError(`Erro ao registrar privilégios de administrador: ${rpcErr.message}`);
        setLoading(false);
        return;
      }

      setSuccessMsg("Administrador criado com sucesso! Inicializando sessão...");
      await refreshProfile();

      setTimeout(async () => {
        await navigate({ to: "/admin" });
      }, 1000);
    } catch (err) {
      console.error("[Setup] Unexpected exception during setup:", err);
      setError("Ocorreu um erro inesperado durante a criação do administrador.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Verificando status do sistema...</p>
        </div>
      </div>
    );
  }

  if (!setupRequired) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
        <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Lock className="size-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Configuração Inicial Concluída</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O primeiro administrador do sistema já foi cadastrado previamente. Esta página está permanentemente bloqueada por motivos de segurança.
          </p>
          <div className="mt-8">
            <Button asChild className="h-11 w-full gap-2 text-sm font-semibold">
              <Link to="/login">
                Ir para a página de Login <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <section className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
            R
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Repertório</h1>
            <p className="text-xs text-muted-foreground">Configuração Inicial do Sistema</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Primeiro Administrador</h2>
              <p className="text-xs text-muted-foreground">Cadastre o usuário mestre para gerenciar a escola</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleBootstrap}>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome completo
              </label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ex: Ana Maria Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 bg-background pl-10"
                />
                <User className="absolute left-3 top-3 size-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail institucional
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@escola.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background pl-10"
                />
                <Mail className="absolute left-3 top-3 size-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-background pl-10"
                />
                <KeyRound className="absolute left-3 top-3 size-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-background pl-10"
                />
                <KeyRound className="absolute left-3 top-3 size-5 text-muted-foreground" />
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full text-sm font-semibold shadow">
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              CRIAR ADMINISTRADOR
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Após a criação, esta página será bloqueada e o acesso será restrito.
        </p>
      </section>
    </main>
  );
}
