import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, GraduationCap, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Repertório | Avaliações Acadêmicas" },
      { name: "description", content: "Sistema seguro de avaliações, notas e gestão institucional." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, role, isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground shadow">
              R
            </span>
            <div>
              <p className="font-display text-lg font-semibold leading-none">Repertório</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Sistema de Avaliações</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild variant="default">
                <Link to={role === "admin" ? "/admin" : role === "teacher" ? "/professor" : "/aluno"}>
                  <UserCheck className="mr-2 size-4" /> Ir para meu Painel ({role})
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/setup">Configuração Inicial</Link>
                </Button>
                <Button asChild variant="default">
                  <Link to="/login">Acesso da Equipe</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <ShieldCheck className="size-4" /> Plataforma Integrada de Gestão
          </span>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Avaliações e gestão acadêmica, em um lugar simples e seguro.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Acesse o painel institucional para cadastrar professores, gerenciar turmas, responder provas ou publicar resultados.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base shadow">
              <Link to="/login">
                <GraduationCap className="mr-2 size-5" /> Entrar no Sistema
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link to="/setup">
                <Sparkles className="mr-2 size-5" /> Configuração Inicial
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <BookOpenCheck className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">Gestão e Segurança</p>
                <p className="mt-1 text-sm text-muted-foreground">Perfis e roles segregados com RLS no banco.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-semibold">Infraestrutura Pronta</p>
                <p className="mt-1 text-sm text-muted-foreground">Admin, Professores e Alunos conectados.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Acesso ao Sistema</p>
          <h2 className="mt-3 font-display text-2xl font-semibold">Selecione seu perfil de acesso</h2>
          <div className="mt-6 space-y-3">
            <Button asChild className="h-14 w-full justify-start px-5 text-base">
              <Link to="/login">
                <GraduationCap className="mr-3 size-5" /> Login da Equipe (Admin / Professor)
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 w-full justify-start px-5 text-base">
              <Link to="/setup">
                <Sparkles className="mr-3 size-5 text-amber-500" /> Configuração Inicial do 1º Admin
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Caso seja seu primeiro acesso como administrador da escola, acesse a Configuração Inicial para criar sua conta mestre.
          </p>
        </div>
      </section>
    </main>
  );
}
