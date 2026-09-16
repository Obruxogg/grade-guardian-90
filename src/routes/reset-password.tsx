import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir Senha | Repertório" },
      { name: "description", content: "Conclusão segura da redefinição de senha." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[ResetPassword] Update password error:", error);
        setErrorMsg(`Não foi possível atualizar a senha: ${error.message}`);
        setLoading(false);
        return;
      }

      setSuccessMsg("Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err) {
      console.error("[ResetPassword] Exception updating password:", err);
      setErrorMsg("Ocorreu um erro inesperado ao atualizar sua senha.");
    } finally {
      setLoading(false);
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
            <p className="text-xs text-muted-foreground">Redefinição de Senha</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Crie uma nova senha</h2>
              <p className="text-xs text-muted-foreground">Digite e confirme sua nova senha de acesso</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-background"
              />
            </div>

            {errorMsg && (
              <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
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
              SALVAR NOVA SENHA
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Lembrou da senha? <Link to="/login" className="font-semibold text-primary hover:underline">Voltar para o Login</Link>
        </p>
      </section>
    </main>
  );
}
