import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar | Repertório" },
      { name: "description", content: "Acesso seguro para equipe e administradores do Repertório." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, role, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check if initial setup is needed
    supabase.rpc("is_setup_required").then(({ data }) => {
      if (data === true) {
        setNeedsSetup(true);
      }
    });
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      if (role === "admin") {
        navigate({ to: "/admin" });
      } else if (role === "teacher") {
        navigate({ to: "/professor" });
      } else if (role === "student") {
        navigate({ to: "/aluno" });
      }
    }
  }, [authLoading, isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || "Não foi possível realizar o login.");
      return;
    }

    const userRole = result.role;
    if (userRole === "admin") {
      await navigate({ to: "/admin" });
    } else if (userRole === "teacher") {
      await navigate({ to: "/professor" });
    } else if (userRole === "student") {
      await navigate({ to: "/aluno" });
    } else {
      await navigate({ to: "/admin" });
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
            R
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Repertório</h1>
            <p className="text-xs text-muted-foreground">Sistema de Avaliações Acadêmicas</p>
          </div>
        </div>

        {needsSetup && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-amber-600" />
              <span>O sistema ainda não possui um Administrador cadastrado.</span>
            </div>
            <Link
              to="/setup"
              className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              Realizar Configuração Inicial <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Entre na sua conta</h2>
              <p className="text-xs text-muted-foreground">Acesso da equipe de gestão e professores</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@escola.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => alert("Entre em contato com o administrador do sistema para redefinir sua senha.")}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-background pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting || authLoading} className="h-11 w-full text-sm font-semibold shadow">
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              ENTRAR
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Dificuldades no acesso? Procure a secretaria da sua instituição.
        </p>
      </section>
    </main>
  );
}
