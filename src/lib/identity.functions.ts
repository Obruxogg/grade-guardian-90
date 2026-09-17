import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const personSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

const setupSchema = personSchema.extend({
  password: z.string().min(12).max(128),
});

const teacherSchema = personSchema.extend({
  status: z.enum(["active", "archived"]).default("active"),
});

function publicMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[Identity]", message);
  if (message.includes("INITIAL_SETUP_COMPLETED")) return "Configuração inicial já concluída.";
  if (message.toLowerCase().includes("already") || message.toLowerCase().includes("registered")) {
    return "Este e-mail já possui uma conta.";
  }
  return fallback;
}

export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) {
    console.error("[Setup status]", error);
    return { configured: false, healthy: false };
  }
  return { configured: (count ?? 0) > 0, healthy: true };
});

export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) => setupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error("Não foi possível verificar a configuração do sistema.");
    if ((count ?? 0) > 0) throw new Error("Configuração inicial já concluída.");

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (authError || !authData.user) {
      throw new Error(publicMessage(authError, "Não foi possível criar o administrador."));
    }

    const userId = authData.user.id;
    const { error: identityError } = await supabaseAdmin.rpc("bootstrap_first_admin", {
      _user_id: userId,
      _full_name: data.fullName,
      _email: data.email,
    });
    if (identityError) {
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (rollbackError) console.error("[Setup rollback]", rollbackError);
      throw new Error(publicMessage(identityError, "Não foi possível concluir a configuração inicial."));
    }

    return { ok: true };
  });

export const createTeacherAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => teacherSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: role, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .single();
    if (roleError || role?.role !== "admin") throw new Error("Acesso negado.");

    const temporaryPassword = `${crypto.randomUUID()}Aa7!`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, must_change_password: true },
    });
    if (authError || !authData.user) {
      throw new Error(publicMessage(authError, "Não foi possível criar o acesso do professor."));
    }

    const userId = authData.user.id;
    const { error: identityError } = await supabaseAdmin.rpc("create_teacher_identity", {
      _actor_id: context.userId,
      _user_id: userId,
      _full_name: data.fullName,
      _email: data.email,
      _status: data.status,
    });
    if (identityError) {
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (rollbackError) console.error("[Teacher rollback]", rollbackError);
      throw new Error(publicMessage(identityError, "Não foi possível concluir o cadastro do professor."));
    }

    return { ok: true, temporaryPassword };
  });

export const getAdminFoundation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).single();
    if (role?.role !== "admin") throw new Error("Acesso negado.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [students, teachers, classes, assessments, recent] = await Promise.all([
      supabaseAdmin.from("students").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("teachers").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("classes").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("assessments").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("audit_logs").select("id,action,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    return {
      counts: { students: students.count ?? 0, teachers: teachers.count ?? 0, classes: classes.count ?? 0, assessments: assessments.count ?? 0 },
      recent: recent.data ?? [],
    };
  });

export const getSystemHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).single();
    if (role?.role !== "admin") throw new Error("Acesso negado.");
    const checks = await Promise.all([
      context.supabase.from("profiles").select("id", { head: true }),
      context.supabase.from("user_roles").select("id", { head: true }),
    ]);
    return {
      backend: "Conectado",
      database: checks.every(({ error }) => !error) ? "OK" : "Falha",
      authentication: "OK",
      profiles: checks[0].error ? "Falha" : "OK",
      roles: checks[1].error ? "Falha" : "OK",
      storage: "OK",
    };
  });