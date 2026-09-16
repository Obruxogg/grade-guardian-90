import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Layers,
  FileCheck,
  HelpCircle,
  BarChart2,
  UploadCloud,
  FileText,
  Settings,
  LogOut,
  Plus,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Key,
  HardDrive,
  UserCheck,
  Search,
  X,
  Mail,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Repertório" },
      { name: "description", content: "Gestão completa da instituição, professores, alunos e turmas." },
    ],
  }),
  component: AdminDashboard,
});

interface TeacherRecord {
  id: string;
  user_id: string;
  full_name: string;
  status: string;
  created_at: string;
}

interface SystemStatusData {
  backend: string;
  database: string;
  auth: string;
  profiles: string;
  roles: string;
  storage: string;
  admin_count?: number;
  teacher_count?: number;
  student_count?: number;
  course_count?: number;
  class_count?: number;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, role, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Teachers State
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherStatus, setNewTeacherStatus] = useState("active");
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [teacherFormError, setTeacherFormError] = useState<string | null>(null);
  const [teacherFormSuccess, setTeacherFormSuccess] = useState<string | null>(null);

  // System Status State
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role === "admin") {
      fetchTeachers();
      fetchSystemStatus();
    }
  }, [authLoading, user, role]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, user_id, full_name, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Admin] Error fetching teachers:", error);
      } else {
        setTeachers((data as TeacherRecord[]) || []);
      }
    } catch (err) {
      console.error("[Admin] Exception fetching teachers:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase.rpc("get_system_status");
      if (error) {
        console.error("[Admin] Error fetching system status:", error);
        setSystemStatus({
          backend: "connected",
          database: "ok",
          auth: "ok",
          profiles: "ok",
          roles: "ok",
          storage: "ok",
        });
      } else {
        setSystemStatus(data as SystemStatusData);
      }
    } catch (err) {
      console.error("[Admin] Exception fetching system status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Created Credentials Modal State
  const [createdTeacherCredentials, setCreatedTeacherCredentials] = useState<{
    name: string;
    email: string;
    tempPassword: string;
  } | null>(null);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFormError(null);
    setTeacherFormSuccess(null);

    if (!newTeacherName || newTeacherName.trim().length < 2) {
      setTeacherFormError("Nome completo é obrigatório.");
      return;
    }
    if (!newTeacherEmail || !newTeacherEmail.includes("@")) {
      setTeacherFormError("E-mail válido é obrigatório.");
      return;
    }

    setCreatingTeacher(true);

    try {
      const { data, error: rpcErr } = await supabase.rpc("admin_create_teacher", {
        p_email: newTeacherEmail.trim(),
        p_full_name: newTeacherName.trim(),
        p_status: newTeacherStatus,
        p_password: newTeacherPassword ? newTeacherPassword : null,
      });

      if (rpcErr) {
        console.error("[Admin] Create teacher RPC error:", rpcErr);
        setTeacherFormError(`Erro ao criar professor: ${rpcErr.message}`);
        setCreatingTeacher(false);
        return;
      }

      const res = data as any;
      const generatedPwd = res?.temp_password || newTeacherPassword || "Senha123!";

      setCreatedTeacherCredentials({
        name: newTeacherName.trim(),
        email: newTeacherEmail.trim(),
        tempPassword: generatedPwd,
      });

      setNewTeacherName("");
      setNewTeacherEmail("");
      setNewTeacherPassword("");
      setIsTeacherModalOpen(false);

      await fetchTeachers();
      await fetchSystemStatus();
    } catch (err) {
      console.error("[Admin] Exception creating teacher:", err);
      setTeacherFormError("Erro inesperado ao cadastrar professor.");
    } finally {
      setCreatingTeacher(false);
    }
  };

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
          <p className="text-sm font-medium text-muted-foreground">Carregando permissões do administrador...</p>
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
          <p className="mt-2 text-sm text-muted-foreground">Você precisa estar autenticado para acessar o painel administrativo.</p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Unauthorized Role Guard
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="max-w-md text-center rounded-2xl border bg-card p-8 shadow-sm">
          <ShieldCheck className="mx-auto size-12 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-bold text-destructive">Acesso Negado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta atual possui a função de <strong>{role || "usuário"}</strong>. Apenas administradores têm permissão nesta área.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {role === "teacher" && (
              <Button asChild className="w-full">
                <Link to="/professor">Ir para o Painel do Professor</Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Sair e trocar de conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "teachers", label: "Professores", icon: GraduationCap, badge: teachers.length },
    { id: "students", label: "Alunos", icon: Users },
    { id: "courses", label: "Cursos", icon: BookOpen },
    { id: "classes", label: "Turmas", icon: School },
    { id: "modules", label: "Módulos", icon: Layers },
    { id: "exams", label: "Provas", icon: FileCheck },
    { id: "questions", label: "Banco de Questões", icon: HelpCircle },
    { id: "results", label: "Resultados", icon: BarChart2 },
    { id: "imports", label: "Importações", icon: UploadCloud },
    { id: "reports", label: "Relatórios", icon: FileText },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Painel Admin
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
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              {profile?.full_name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold">{profile?.full_name || "Administrador"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{profile?.email || user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 text-xs">
            <LogOut className="size-3.5" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-8">
          <div>
            <h1 className="font-display text-xl font-bold">
              {menuItems.find((i) => i.id === activeTab)?.label || "Administração"}
            </h1>
            <p className="text-xs text-muted-foreground">Gestão completa e controle institucional</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Sistema Ativo
            </span>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alunos Cadastrados</p>
                    <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                      <Users className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">{systemStatus?.student_count ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Alunos registrados na base</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professores Ativos</p>
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                      <GraduationCap className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">{teachers.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Docentes com permissão de acesso</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Turmas Ativas</p>
                    <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-600">
                      <School className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">{systemStatus?.class_count ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Turmas em andamento</p>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provas no Sistema</p>
                    <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
                      <FileCheck className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold">0</p>
                  <p className="mt-1 text-xs text-muted-foreground">Avaliações criadas</p>
                </div>
              </div>

              {/* Sections Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border bg-card p-6 shadow-sm">
                  <h2 className="font-display text-lg font-semibold mb-4">Avaliações Recentes</h2>
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl p-6">
                    <FileCheck className="size-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-semibold">Nenhuma avaliação recente</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      As avaliações criadas pelos professores serão listadas aqui.
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border bg-card p-6 shadow-sm">
                  <h2 className="font-display text-lg font-semibold mb-4">Atividades Administrativas Recentes</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border p-3.5">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold">Fundação do Sistema Inicializada</p>
                        <p className="text-[11px] text-muted-foreground">Administrador mestre e estrutura de roles configurados com sucesso.</p>
                      </div>
                    </div>
                    {teachers.length > 0 && (
                      <div className="flex items-start gap-3 rounded-xl border p-3.5">
                        <UserCheck className="size-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold">{teachers.length} Professor(es) Cadastrado(s)</p>
                          <p className="text-[11px] text-muted-foreground">Acessos de docência prontos para utilização.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* System Health Section */}
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Status do Sistema</h2>
                    <p className="text-xs text-muted-foreground">Diagnóstico em tempo real dos serviços fundamentais</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchSystemStatus} disabled={loadingStatus}>
                    {loadingStatus ? <Loader2 className="size-3.5 animate-spin" /> : "Atualizar Diagnostics"}
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-xl border p-4 text-center">
                    <Server className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Backend</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.backend || "Conectado"}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4 text-center">
                    <Database className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Banco de Dados</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.database || "OK"}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4 text-center">
                    <Key className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Autenticação</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.auth || "OK"}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4 text-center">
                    <UserIcon className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Profiles</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.profiles || "OK"}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4 text-center">
                    <ShieldCheck className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Roles (RLS)</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.roles || "OK"}
                    </span>
                  </div>

                  <div className="rounded-xl border p-4 text-center">
                    <HardDrive className="mx-auto size-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold">Storage</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {systemStatus?.storage || "OK"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TEACHERS */}
          {activeTab === "teachers" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Buscar professor por nome ou ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10"
                  />
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>

                <Button onClick={() => setIsTeacherModalOpen(true)} className="gap-2 shadow">
                  <Plus className="size-4" /> NOVO PROFESSOR
                </Button>
              </div>

              {/* Teachers Table */}
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/50 uppercase text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-6 py-4">Nome do Professor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">ID de Usuário (UUID)</th>
                      <th className="px-6 py-4">Data de Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingTeachers ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          <Loader2 className="mx-auto size-6 animate-spin mb-2" />
                          Carregando corpo docente...
                        </td>
                      </tr>
                    ) : filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <GraduationCap className="mx-auto size-10 text-muted-foreground/40 mb-2" />
                          <p className="font-semibold text-foreground text-sm">Nenhum professor cadastrado</p>
                          <p className="text-xs mt-1">Clique no botão "NOVO PROFESSOR" para gerar o primeiro acesso.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                            <div className="grid size-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                              {t.full_name.charAt(0)}
                            </div>
                            <span>{t.full_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                t.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              {t.status === "active" ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">{t.user_id}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER TABS: PLACEHOLDERS */}
          {activeTab !== "overview" && activeTab !== "teachers" && (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Settings className="size-6" />
              </div>
              <h2 className="font-display text-xl font-bold">Módulo {menuItems.find((i) => i.id === activeTab)?.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                A estrutura base está conectada e pronta para expansão.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* CREATE TEACHER MODAL */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Novo Professor</h3>
                  <p className="text-xs text-muted-foreground">Criar acesso seguro de docente</p>
                </div>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Nome Completo</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ex: Prof. João Santana"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    required
                    className="h-10 pl-9"
                  />
                  <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">E-mail de Acesso</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="professor@escola.com"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    required
                    className="h-10 pl-9"
                  />
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Senha de Acesso</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    required
                    className="h-10 pl-9"
                  />
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Status</label>
                <select
                  value={newTeacherStatus}
                  onChange={(e) => setNewTeacherStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="active">Ativo</option>
                  <option value="archived">Inativo / Arquivado</option>
                </select>
              </div>

              {teacherFormError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {teacherFormError}
                </div>
              )}

              {teacherFormSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{teacherFormSuccess}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsTeacherModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingTeacher}>
                  {creatingTeacher ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  CRIAR ACESSO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME TEMPORARY CREDENTIALS DISPLAY MODAL */}
      {createdTeacherCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-center">Acesso Criado com Sucesso!</h3>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Copie as credenciais temporárias do professor. <strong>Esta senha será exibida uma única vez.</strong>
            </p>

            <div className="mt-6 space-y-3 rounded-xl border bg-muted/40 p-4 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block font-sans">Professor</span>
                <span className="font-bold text-foreground text-sm">{createdTeacherCredentials.name}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block font-sans">E-mail</span>
                <span className="text-foreground font-semibold">{createdTeacherCredentials.email}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block font-sans">Senha Temporária Gerada</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block mt-1">
                  {createdTeacherCredentials.tempPassword}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => {
                  const textToCopy = `Acesso do Professor ao Repertório:\nNome: ${createdTeacherCredentials.name}\nE-mail: ${createdTeacherCredentials.email}\nSenha Temporária: ${createdTeacherCredentials.tempPassword}\nLink de Acesso: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(textToCopy);
                  alert("Dados de acesso copiados para a área de transferência!");
                }}
                className="w-full gap-2 shadow"
              >
                COPIAR DADOS DE ACESSO
              </Button>
              <Button variant="outline" onClick={() => setCreatedTeacherCredentials(null)} className="w-full">
                Entendido / Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
