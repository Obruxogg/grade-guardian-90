import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  School,
  FileCheck,
  HelpCircle,
  ClipboardCheck,
  BarChart2,
  FileText,
  User as UserIcon,
  LogOut,
  BookOpenCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/professor")({
  head: () => ({
    meta: [
      { title: "Painel do Professor | Repertório" },
      { name: "description", content: "Área exclusiva do docente para turmas, avaliações e correções." },
    ],
  }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, profile, role, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleLogout = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  // 1. Loading Guard
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Carregando painel do professor...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Guard
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="max-w-md text-center rounded-2xl border bg-card p-8 shadow-sm">
          <AlertTriangle className="mx-auto size-12 text-amber-500" />
          <h1 className="mt-4 font-display text-xl font-bold">Acesso Restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">Você precisa estar autenticado para acessar a área do professor.</p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Role Protection Guard (Allow teacher and admin)
  if (role !== "teacher" && role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="max-w-md text-center rounded-2xl border bg-card p-8 shadow-sm">
          <ShieldCheck className="mx-auto size-12 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-bold text-destructive">Acesso Negado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta atual não possui permissões de docente.
          </p>
          <Button variant="outline" onClick={handleLogout} className="mt-6 w-full">
            Sair e trocar de conta
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "classes", label: "Minhas Turmas", icon: School },
    { id: "exams", label: "Provas", icon: FileCheck },
    { id: "questions", label: "Banco de Questões", icon: HelpCircle },
    { id: "grading", label: "Correções", icon: ClipboardCheck },
    { id: "results", label: "Resultados", icon: BarChart2 },
    { id: "reports", label: "Relatórios", icon: FileText },
    { id: "profile", label: "Meu Perfil", icon: UserIcon },
  ];

  const teacherFirstName = profile?.full_name ? profile.full_name.split(" ")[0] : "Docente";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r bg-card flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow">
              R
            </span>
            <div>
              <p className="font-display font-bold leading-none">Repertório</p>
              <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Área do Professor
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
              {profile?.full_name?.charAt(0) || "P"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold">{profile?.full_name || "Professor"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{profile?.email || user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 text-xs">
            <LogOut className="size-3.5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-8">
          <div>
            <h1 className="font-display text-xl font-bold">Olá, Professor {teacherFirstName} 👋</h1>
            <p className="text-xs text-muted-foreground">Acompanhe suas turmas e aplicações de provas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-2 shadow">
              <Plus className="size-4" /> Nova Avaliação
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 flex-1">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minhas Turmas</p>
                    <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                      <School className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">0</p>
                  <p className="mt-1 text-xs text-muted-foreground">Turmas atribuídas</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provas Ativas</p>
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                      <FileCheck className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">0</p>
                  <p className="mt-1 text-xs text-muted-foreground">Avaliações em andamento</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aguardando Correção</p>
                    <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
                      <ClipboardCheck className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">0</p>
                  <p className="mt-1 text-xs text-muted-foreground">Respostas pendentes</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avaliações Realizadas</p>
                    <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-600">
                      <BookOpenCheck className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">0</p>
                  <p className="mt-1 text-xs text-muted-foreground">Histórico concluído</p>
                </div>
              </div>

              {/* Sections Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Próximas Avaliações */}
                <section className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="size-5 text-primary" />
                      <h2 className="font-display text-lg font-semibold">Próximas Avaliações</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl p-6">
                      <FileCheck className="size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-xs font-semibold text-foreground">Nenhuma avaliação agendada</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Crie uma nova prova para disponibilizar aos seus alunos.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Últimas Provas Aplicadas */}
                <section className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpenCheck className="size-5 text-emerald-500" />
                      <h2 className="font-display text-lg font-semibold">Últimas Provas Aplicadas</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl p-6">
                      <CheckCircle2 className="size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-xs font-semibold text-foreground">Nenhuma avaliação concluída</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        O histórico de provas finalizadas aparecerá aqui.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Pendências de Correção */}
                <section className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardCheck className="size-5 text-amber-500" />
                      <h2 className="font-display text-lg font-semibold">Pendências de Correção</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl p-6">
                      <AlertCircle className="size-8 text-emerald-500/60 mb-2" />
                      <p className="text-xs font-semibold text-foreground">Tudo em dia!</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Nenhuma resposta aguardando correção manual no momento.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Polished Empty State Banner */}
              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-primary/5 to-transparent p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Você ainda não possui turmas vinculadas</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    Solicite ao administrador da escola a vinculação da sua conta às turmas do semestre para visualizar a lista de alunos e aplicar avaliações.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => alert("Solicitação enviada ao administrador.")}>
                  Solicitar Vinculação
                </Button>
              </div>
            </div>
          )}

          {/* OTHER TABS: PLACEHOLDERS */}
          {activeTab !== "overview" && (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                <School className="size-6" />
              </div>
              <h2 className="font-display text-xl font-bold">Módulo {menuItems.find((i) => i.id === activeTab)?.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Este espaço do professor está integrado e pronto para gerenciamento acadêmico.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
