import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const primitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const target = z.enum(["name", "cpf", "course", "module", "class", "schedule", "ignore"]);
const importInput = z.object({ filename: z.string().min(1).max(240), storagePath: z.string().min(1).max(500), rows: z.array(z.record(primitive)).min(1).max(10000), mapping: z.record(target), mode: z.enum(["add_only", "add_update", "update_only"]) });
type Row = Record<string, string | number | boolean | null>;
const clean = (value: unknown) => String(value ?? "").trim();
const key = (value: unknown) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const digits = (value: unknown) => clean(value).replace(/\D/g, "");

function validCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const check = (length: number) => { let sum = 0; for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index); const result = (sum * 10) % 11; return result === 10 ? 0 : result; };
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10]);
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Somente administradores podem importar alunos.");
}

export const prepareStudentImport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => importInput.parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context);
  const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const { data: students } = await admin.from("students").select("id,cpf_normalized,full_name");
  const { data: classes } = await admin.from("classes").select("id,name,starts_at,ends_at,courses(name,code),modules!classes_current_module_id_fkey(name)").eq("status", "active");
  const source = (raw: Row, mapped: z.infer<typeof target>) => { const column = Object.entries(data.mapping).find(([, field]) => field === mapped)?.[0]; return column ? raw[column] : null; };
  const duplicateCounts = new Map<string, number>();
  data.rows.forEach((raw) => { const cpf = digits(source(raw, "cpf")); duplicateCounts.set(cpf, (duplicateCounts.get(cpf) ?? 0) + 1); });
  const normalized = data.rows.map((raw, index) => {
    const name = clean(source(raw, "name")); const cpf = digits(source(raw, "cpf")); const course = clean(source(raw, "course")); const moduleName = clean(source(raw, "module")); const className = clean(source(raw, "class")); const schedule = clean(source(raw, "schedule"));
    const existing = (students ?? []).find((item) => item.cpf_normalized === cpf);
    const matchedClass = (classes ?? []).find((item: any) => key(item.name) === key(className) && (!course || key(item.courses?.name) === key(course) || key(item.courses?.code) === key(course)) && (!moduleName || key(item.modules?.name) === key(moduleName)));
    const messages: string[] = [];
    if (!name) messages.push("Nome ausente"); if (!validCpf(cpf)) messages.push("CPF inválido"); if (cpf && (duplicateCounts.get(cpf) ?? 0) > 1) messages.push("CPF duplicado na planilha"); if (!className) messages.push("Turma ausente"); else if (!matchedClass) messages.push("Turma, curso ou módulo não encontrado");
    if (schedule && matchedClass) { const expected = [matchedClass.starts_at?.slice(0, 5), matchedClass.ends_at?.slice(0, 5)].filter(Boolean).join(" - "); if (expected && key(schedule) !== key(expected)) messages.push("Horário diferente do cadastro da turma"); }
    if (existing && data.mode === "add_only") messages.push("Aluno já cadastrado — será ignorado"); if (!existing && data.mode === "update_only") messages.push("Aluno novo — será ignorado");
    const blocking = messages.some((message) => ["Nome ausente", "CPF inválido", "CPF duplicado na planilha", "Turma, curso ou módulo não encontrado", "Turma ausente"].includes(message)); const ignored = (existing && data.mode === "add_only") || (!existing && data.mode === "update_only");
    return { rowNumber: index + 2, raw, normalizedData: { name, cpf, course, module: moduleName, class: className, classId: matchedClass?.id ?? null, schedule }, existing, messages, status: ignored ? "ignored" : blocking ? "error" : messages.length || existing ? "review" : "valid" };
  });
  const counts = { total: normalized.length, valid: normalized.filter((item) => item.status === "valid").length, review: normalized.filter((item) => item.status === "review").length, error: normalized.filter((item) => item.status === "error").length };
  const { data: batch, error } = await admin.from("import_batches").insert({ created_by: context.userId, original_filename: data.filename, storage_path: data.storagePath, mode: data.mode, column_mapping: data.mapping, status: "preview", total_count: counts.total, valid_count: counts.valid, review_count: counts.review, error_count: counts.error }).select("id").single();
  if (error || !batch) throw new Error("Não foi possível preparar a importação.");
  const { error: rowsError } = await admin.from("import_rows").insert(normalized.map((item) => ({ batch_id: batch.id, row_number: item.rowNumber, raw_data: item.raw, normalized_data: item.normalizedData, validation_status: item.status, messages: item.messages, matched_student_id: item.existing?.id ?? null })));
  if (rowsError) throw new Error("Não foi possível salvar a prévia da importação.");
  return { batchId: batch.id, counts, rows: normalized.slice(0, 100).map(({ rowNumber, normalizedData, messages, status, existing }) => ({ rowNumber, ...normalizedData, messages, status, existingName: existing?.full_name ?? null })) };
});

export const confirmStudentImport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ batchId: z.string().uuid(), includeReview: z.boolean().default(true) }).parse(data)).handler(async ({ data, context }) => {
  await assertAdmin(context); const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const { data: batch } = await admin.from("import_batches").select("id,status,mode").eq("id", data.batchId).eq("created_by", context.userId).single(); if (!batch || batch.status !== "preview") throw new Error("Este lote não está disponível para confirmação.");
  const { data: rows } = await admin.from("import_rows").select("id,normalized_data,matched_student_id").eq("batch_id", batch.id).in("validation_status", data.includeReview ? ["valid", "review"] : ["valid"]);
  let created = 0; let updated = 0;
  for (const item of rows ?? []) {
    const normalized = item.normalized_data as { name: string; cpf: string; classId: string | null }; if (!normalized.classId) continue; let studentId = item.matched_student_id;
    if (studentId && batch.mode !== "add_only") { const { error } = await admin.from("students").update({ full_name: normalized.name }).eq("id", studentId); if (error) throw new Error("Não foi possível atualizar um aluno do lote."); updated += 1; }
    else if (!studentId && batch.mode !== "update_only") { const { data: inserted, error } = await admin.from("students").insert({ full_name: normalized.name, cpf_normalized: normalized.cpf }).select("id").single(); if (error || !inserted) throw new Error("Não foi possível cadastrar um aluno do lote."); studentId = inserted.id; created += 1; }
    if (!studentId) continue;
    const { data: active } = await admin.from("enrollments").select("id,class_id").eq("student_id", studentId).eq("status", "active").maybeSingle();
    if (!active) await admin.from("enrollments").insert({ student_id: studentId, class_id: normalized.classId }); else if (active.class_id !== normalized.classId) { await admin.from("enrollments").update({ status: "transferred", ended_on: new Date().toISOString().slice(0, 10) }).eq("id", active.id); await admin.from("enrollments").insert({ student_id: studentId, class_id: normalized.classId, previous_enrollment_id: active.id }); }
    await admin.from("import_rows").update({ applied_at: new Date().toISOString(), matched_student_id: studentId }).eq("id", item.id);
  }
  const completedAt = new Date().toISOString(); await admin.from("import_batches").update({ status: "completed", completed_at: completedAt, created_count: created, updated_count: updated }).eq("id", batch.id); await admin.from("audit_logs").insert({ actor_id: context.userId, action: "student_import_completed", entity_type: "import_batch", entity_id: batch.id, metadata: { created, updated } }); return { created, updated, completedAt };
});