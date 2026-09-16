import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { GraduationCap, LogOut, Loader2, BookOpenCheck, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Área do Aluno | Repertório" },
      { name: "description", content: "Portal do estudante para provas, atividades e resultados." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, role, loading: authLoading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Carregando portal do estudante...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="max-w-md text-center rounded-2xl border bg-card p-8 shadow-sm">
          <AlertTriangle className="mx-auto size-12 text-amber-500" />
          <h1 className="mt-4 font-display text-xl font-bold">Acesso Restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">Você precisa estar autenticado para acessar a área do aluno.</p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow">
              R
            </span>
            <div>
              <p className="font-display font-bold leading-none">Repertório</p>
              <p className="text-[10px] text-muted-foreground">Portal do Estudante</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold">{profile?.full_name || user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-xs">
              <LogOut className="size-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Olá, {profile?.full_name?.split(" ")[0] || "Aluno"} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Bem-vindo ao seu portal de avaliações acadêmicas.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <BookOpenCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Minhas Avaliações</h2>
                <p className="text-xs text-muted-foreground">Provas disponíveis e em andamento</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-xs font-semibold">Nenhuma prova pendente no momento</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Quando seu professor agendar uma nova avaliação, ela aparecerá aqui.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Meus Resultados</h2>
                <p className="text-xs text-muted-foreground">Notas e feedbacks liberados pelos professores</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-xs font-semibold">Nenhum resultado liberado ainda</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Seus boletins e correções aparecerão nesta área.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
