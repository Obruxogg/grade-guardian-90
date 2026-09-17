import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, CheckCircle2, Lock, ArrowRight, User, Mail, KeyRound, Copy, Check, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_MIGRATION_SQL = `-- Executar no SQL Editor do Supabase Dashboard
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email text;

CREATE OR REPLACE FUNCTION public.is_setup_required()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role);
$$;
GRANT EXECUTE ON FUNCTION public.is_setup_required() TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.bootstrap_admin_account(text, text, text);

CREATE OR REPLACE FUNCTION public.bootstrap_admin_account(p_email text, p_password text, p_full_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private, auth, extensions AS $$
DECLARE _user_id uuid; _encrypted_pwd text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Configuração inicial já concluída.';
  END IF;
  IF p_email IS NULL OR trim(p_email) = '' THEN RAISE EXCEPTION 'E-mail é obrigatório.'; END IF;
  IF p_password IS NULL OR length(p_password) < 6 THEN RAISE EXCEPTION 'Senha deve ter no mínimo 6 caracteres.'; END IF;
  _encrypted_pwd := crypt(p_password, gen_salt('bf'));
  SELECT id INTO _user_id FROM auth.users WHERE email = p_email;
  IF _user_id IS NOT NULL THEN
    UPDATE auth.users SET encrypted_password = _encrypted_pwd, email_confirmed_at = COALESCE(email_confirmed_at, now()), raw_user_meta_data = jsonb_build_object('full_name', p_full_name), updated_at = now() WHERE id = _user_id;
  ELSE
    _user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES (_user_id, '00000000-0000-0000-0000-000000000000', p_email, _encrypted_pwd, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', p_full_name), now(), now(), 'authenticated', 'authenticated');
  END IF;
  INSERT INTO public.profiles (id, full_name, email, status) VALUES (_user_id, COALESCE(NULLIF(trim(p_full_name), ''), 'Administrador'), p_email, 'active'::public.record_status) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN _user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_account(text, text, text) TO anon, authenticated, service_role;`;

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
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(INITIAL_MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setShowSqlGuide(false);

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
      // Step 1: Try to sign in first — account may already exist
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!signInErr && signInData?.user) {
        console.log("[Setup] Existing user authenticated:", signInData.user.id);
        const userId = signInData.user.id;

        await supabase.from("profiles").upsert({
          id: userId,
          full_name: fullName.trim(),
          email: email.trim(),
          status: "active",
        });

        await supabase.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" }
        );

        setSuccessMsg("Administrador ativado com sucesso! Inicializando sessão...");
        await refreshProfile();
        setTimeout(() => navigate({ to: "/admin" }), 1000);
        return;
      }

      // Step 2: Create Admin Account with RPC (bypasses "Signups not allowed" restriction)
      let bootstrapUserId: string | null = null;
      let lastRpcError: any = null;

      // Attempt 2a: Call with signature (p_email, p_full_name, p_password)
      const res1 = await supabase.rpc("bootstrap_admin_account" as any, {
        p_email: email.trim(),
        p_full_name: fullName.trim(),
        p_password: password,
      });

      if (!res1.error && res1.data) {
        bootstrapUserId = res1.data as string;
      } else {
        // Attempt 2b: Call with signature (p_email, p_password, p_full_name)
        const res2 = await supabase.rpc("bootstrap_admin_account" as any, {
          p_email: email.trim(),
          p_password: password,
          p_full_name: fullName.trim(),
        });

        if (!res2.error && res2.data) {
          bootstrapUserId = res2.data as string;
        } else {
          lastRpcError = res2.error || res1.error;

          // Attempt 2c: Fallback to standard Supabase Auth signUp
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (signUpErr && !signUpData?.user) {
            console.error("[Setup] bootstrap_admin_account error:", lastRpcError, "signUp error:", signUpErr);
            
            const isMissingFunction = lastRpcError?.message?.includes("Could not find the function") || 
                                     lastRpcError?.code === "PGRST202";

            if (isMissingFunction) {
              setShowSqlGuide(true);
              setError("A função de inicialização ainda não foi executada no seu banco de dados Supabase.");
            } else {
              setError(`Erro ao criar administrador: ${lastRpcError?.message || signUpErr.message}`);
            }
            setLoading(false);
            return;
          }

          if (signUpData?.user) {
            bootstrapUserId = signUpData.user.id;
            await supabase.rpc("bootstrap_admin", { p_full_name: fullName.trim() });
          }
        }
      }

      console.log("[Setup] Admin account created, user_id:", bootstrapUserId);

      // Step 3: Sign in with the newly created credentials
      const { data: newSignIn, error: newSignInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (newSignInErr || !newSignIn?.user) {
        setError(
          "Conta criada no banco de dados. Tente realizar o login pela tela de login."
        );
        setLoading(false);
        return;
      }

      setSuccessMsg("Administrador criado com sucesso! Inicializando sessão...");
      await refreshProfile();
      setTimeout(() => navigate({ to: "/admin" }), 1000);
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

            {showSqlGuide && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                  <Terminal className="size-4 shrink-0" />
                  <span>Ação necessária no Supabase Dashboard:</span>
                </div>
                <ol className="mt-2 list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Acesse o seu projeto no <strong>Supabase Dashboard</strong>.</li>
                  <li>Vá na aba <strong>SQL Editor</strong> na barra lateral esquerda.</li>
                  <li>Clique no botão abaixo para copiar o script SQL de inicialização.</li>
                  <li>Cole no SQL Editor do Supabase e clique em <strong>Run</strong>.</li>
                </ol>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySqlToClipboard}
                    className="h-9 gap-1.5 text-xs font-semibold bg-background"
                  >
                    {copiedSql ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copiedSql ? "Copiado com Sucesso!" : "Copiar SQL de Inicialização"}
                  </Button>
                </div>
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
