import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const id = z.string().uuid();
const answerValue = z.object({ selectedOptionIds: z.array(id).max(20).optional(), text: z.string().max(20000).optional() });

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const startAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ assessmentId: id }).parse(value))
  .handler(async ({ data, context }) => {
    const { data: student } = await context.supabase.from("students").select("id").eq("auth_user_id", context.userId).maybeSingle();
    if (!student) throw new Error("Acesso de aluno não encontrado.");
    const admin = await adminClient();
    const { data: current } = await admin.from("attempts").select("id,status,started_at,expires_at,version_id,question_order,option_orders").eq("assessment_id", data.assessmentId).eq("student_id", student.id).eq("status", "in_progress").maybeSingle();
    if (current) return { attempt: current, resumed: true };
    const { data: assessment } = await admin.from("assessments").select("id,status,opens_at,closes_at,time_limit_minutes,max_attempts,shuffle_questions,shuffle_options").eq("id", data.assessmentId).single();
    const now = new Date();
    if (!assessment || !["available","scheduled"].includes(assessment.status) || (assessment.opens_at && now < new Date(assessment.opens_at)) || (assessment.closes_at && now > new Date(assessment.closes_at))) throw new Error("Esta avaliação não está disponível.");
    const { data: enrollment } = await admin.from("enrollments").select("class_id").eq("student_id", student.id).eq("status", "active");
    const classIds=(enrollment??[]).map((row)=>row.class_id);
    const { data: assignment } = classIds.length ? await admin.from("assessment_assignments").select("id").eq("assessment_id",assessment.id).in("class_id",classIds).limit(1).maybeSingle() : {data:null};
    if (!assignment) throw new Error("Esta avaliação não foi destinada à sua turma.");
    const { count } = await admin.from("attempts").select("id",{count:"exact",head:true}).eq("assessment_id",assessment.id).eq("student_id",student.id);
    if ((count??0)>=assessment.max_attempts) throw new Error("O limite de tentativas foi atingido.");
    const { data: version } = await admin.from("assessment_versions").select("id").eq("assessment_id",assessment.id).order("version_no",{ascending:false}).limit(1).single();
    if (!version) throw new Error("A avaliação ainda não possui uma versão publicada.");
    const { data: rows } = await admin.from("assessment_questions").select("id,question_id,position").eq("version_id",version.id).order("position");
    const order=(rows??[]).map((row)=>row.id);
    if(assessment.shuffle_questions) order.sort(()=>Math.random()-0.5);
    const expiresAt=assessment.time_limit_minutes ? new Date(now.getTime()+assessment.time_limit_minutes*60000).toISOString() : null;
    const { data: attempt,error }=await admin.from("attempts").insert({assessment_id:assessment.id,version_id:version.id,student_id:student.id,attempt_number:(count??0)+1,expires_at:expiresAt,question_order:order}).select("id,status,started_at,expires_at,version_id,question_order,option_orders").single();
    if(error) throw new Error("Não foi possível iniciar a avaliação.");
    await admin.from("audit_logs").insert({actor_id:context.userId,action:"assessment_started",entity_type:"attempt",entity_id:attempt.id});
    return {attempt,resumed:false};
  });

export const getAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ attemptId: id }).parse(value))
  .handler(async ({ data, context }) => {
    const {data:attempt}=await context.supabase.from("attempts").select("id,assessment_id,version_id,status,started_at,expires_at,question_order").eq("id",data.attemptId).single();
    if(!attempt) throw new Error("Tentativa não encontrada.");
    const admin=await adminClient();
    const {data:assessment}=await admin.from("assessments").select("title,description,time_limit_minutes").eq("id",attempt.assessment_id).single();
    const {data:links}=await admin.from("assessment_questions").select("id,position,points,question_id").eq("version_id",attempt.version_id);
    const questionIds=(links??[]).map((row)=>row.question_id);
    const {data:questions}=questionIds.length ? await admin.from("question_bank").select("id,type,prompt,content_tag").in("id",questionIds) : {data:[]};
    const {data:options}=questionIds.length ? await admin.from("question_options").select("id,question_id,option_text,position").in("question_id",questionIds).order("position") : {data:[]};
    const {data:answers}=await context.supabase.from("answers").select("assessment_question_id,response,updated_at").eq("attempt_id",attempt.id);
    const safeQuestions=(attempt.question_order??[]).map((linkId)=>{const link=(links??[]).find((item)=>item.id===linkId);const question=(questions??[]).find((item)=>item.id===link?.question_id);return link&&question?{id:link.id,position:link.position,points:link.points,type:question.type,prompt:question.prompt,contentTag:question.content_tag,options:(options??[]).filter((item)=>item.question_id===question.id).map(({id:optionId,option_text})=>({id:optionId,text:option_text}))}:null}).filter(Boolean);
    return {attempt,assessment,questions:safeQuestions,answers:answers??[],serverNow:new Date().toISOString()};
  });

export const saveAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ attemptId:id, assessmentQuestionId:id, response:answerValue }).parse(value))
  .handler(async ({data,context})=>{
    const {data:attempt}=await context.supabase.from("attempts").select("id,status,expires_at,version_id").eq("id",data.attemptId).single();
    if(!attempt||attempt.status!=="in_progress") throw new Error("Esta avaliação não aceita mais alterações.");
    if(attempt.expires_at&&new Date()>=new Date(attempt.expires_at)) throw new Error("O tempo da avaliação terminou.");
    const admin=await adminClient();
    const {data:link}=await admin.from("assessment_questions").select("id").eq("id",data.assessmentQuestionId).eq("version_id",attempt.version_id).maybeSingle();
    if(!link) throw new Error("Questão inválida para esta tentativa.");
    const {error}=await admin.from("answers").upsert({attempt_id:attempt.id,assessment_question_id:link.id,response:data.response},{onConflict:"attempt_id,assessment_question_id"});
    if(error) throw new Error("Não foi possível salvar sua resposta. Tente novamente.");
    return {savedAt:new Date().toISOString()};
  });

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value)=>z.object({attemptId:id}).parse(value))
  .handler(async ({data,context})=>{
    const {data:attempt}=await context.supabase.from("attempts").select("id,status,assessment_id,version_id,expires_at").eq("id",data.attemptId).single();
    if(!attempt||attempt.status!=="in_progress") throw new Error("Esta tentativa já foi finalizada.");
    const admin=await adminClient();
    const timedOut=Boolean(attempt.expires_at&&new Date()>=new Date(attempt.expires_at));
    const {data:links}=await admin.from("assessment_questions").select("id,question_id,points,is_annulled,annulment_rule").eq("version_id",attempt.version_id);
    const {data:answers}=await admin.from("answers").select("id,assessment_question_id,response").eq("attempt_id",attempt.id);
    let score=0,correct=0,incorrect=0,blank=0,pending=0;
    for(const link of links??[]){const answer=(answers??[]).find((row)=>row.assessment_question_id===link.id);if(link.is_annulled&&link.annulment_rule==="points_for_all"){score+=link.points;continue;}if(!answer){blank++;continue;}const {data:question}=await admin.from("question_bank").select("type").eq("id",link.question_id).single();if(question?.type==="essay"||question?.type==="short_answer"||question?.type==="file_upload"){pending++;continue;}const {data:opts}=await admin.from("question_options").select("id,is_correct").eq("question_id",link.question_id);const expected=(opts??[]).filter(o=>o.is_correct).map(o=>o.id).sort();const response=answer.response as {selectedOptionIds?:string[]};const received=(response.selectedOptionIds??[]).sort();const isCorrect=expected.length===received.length&&expected.every((value,index)=>value===received[index]);if(isCorrect){score+=link.points;correct++;}else incorrect++;await admin.from("answers").update({awarded_points:isCorrect?link.points:0,auto_graded:true,grading_status:"automatic",graded_at:new Date().toISOString()}).eq("id",answer.id);}
    const {data:assessment}=await admin.from("assessments").select("max_score,passing_score,show_score_immediately").eq("id",attempt.assessment_id).single();
    const percentage=assessment?Math.round((score/assessment.max_score)*10000)/100:0;const resultLabel=assessment&&score>=assessment.passing_score?"Aprovado":"Abaixo da média";const now=new Date().toISOString();
    await admin.from("attempts").update({status:pending?"submitted":"graded",submitted_at:now,submission_reason:timedOut?"time_expired":"student_submitted"}).eq("id",attempt.id);
    await admin.from("grades").upsert({attempt_id:attempt.id,score,percentage,correct_count:correct,incorrect_count:incorrect,blank_count:blank,result_label:resultLabel,released_at:assessment?.show_score_immediately&&!pending?now:null},{onConflict:"attempt_id"});
    await admin.from("audit_logs").insert({actor_id:context.userId,action:timedOut?"assessment_time_expired":"assessment_submitted",entity_type:"attempt",entity_id:attempt.id,metadata:{pending_manual:pending}});
    return {pendingManual:pending,submittedAt:now};
  });