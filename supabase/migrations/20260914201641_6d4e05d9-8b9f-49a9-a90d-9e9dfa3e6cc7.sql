CREATE TYPE public.app_role AS ENUM ('admin','teacher','student');
CREATE TYPE public.record_status AS ENUM ('active','archived');
CREATE TYPE public.enrollment_status AS ENUM ('active','completed','transferred','cancelled');
CREATE TYPE public.assessment_status AS ENUM ('draft','scheduled','available','closed','grading','finalized','archived');
CREATE TYPE public.assessment_kind AS ENUM ('activity','assessment');
CREATE TYPE public.question_type AS ENUM ('single_choice','multiple_choice','true_false','short_answer','essay','fill_blank','matching','file_upload');
CREATE TYPE public.attempt_status AS ENUM ('in_progress','submitted','expired','graded');
CREATE TYPE public.import_status AS ENUM ('uploaded','mapping','validating','preview','confirmed','completed','cancelled','failed');

CREATE TABLE public.profiles (
 id uuid PRIMARY KEY,
 full_name text NOT NULL CHECK (length(trim(full_name)) >= 2),
 email text,
 status public.record_status NOT NULL DEFAULT 'active',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());

CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role public.app_role NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,role)
);
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_self_read ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_user_id,'admin') OR public.has_role(_user_id,'teacher') $$;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY roles_admin_all ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, code text NOT NULL UNIQUE, description text,
 status public.record_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.courses TO authenticated; GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_staff_read ON public.courses FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY courses_admin_write ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.modules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.courses(id), name text NOT NULL, sequence_no integer NOT NULL DEFAULT 1 CHECK(sequence_no>0),
 status public.record_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(course_id,name)
);
GRANT SELECT,INSERT,UPDATE ON public.modules TO authenticated; GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_staff_read ON public.modules FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY modules_admin_write ON public.modules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.classes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.courses(id), current_module_id uuid REFERENCES public.modules(id), name text NOT NULL,
 weekday smallint CHECK(weekday BETWEEN 0 AND 6), starts_at time, ends_at time, status public.record_status NOT NULL DEFAULT 'active',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(course_id,name)
);
GRANT SELECT,INSERT,UPDATE ON public.classes TO authenticated; GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY classes_staff_read ON public.classes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY classes_admin_write ON public.classes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.students (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), auth_user_id uuid UNIQUE, full_name text NOT NULL, cpf_normalized text NOT NULL UNIQUE CHECK(cpf_normalized ~ '^[0-9]{11}$'), cpf_last2 text GENERATED ALWAYS AS (right(cpf_normalized,2)) STORED,
 activation_required boolean NOT NULL DEFAULT true, status public.record_status NOT NULL DEFAULT 'active', archived_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.students TO authenticated; GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY students_self_read ON public.students FOR SELECT TO authenticated USING (auth_user_id=auth.uid());
CREATE POLICY students_admin_all ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.teachers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, full_name text NOT NULL, status public.record_status NOT NULL DEFAULT 'active',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.teachers TO authenticated; GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY teachers_staff_read ON public.teachers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY teachers_admin_write ON public.teachers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.teacher_classes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), teacher_id uuid NOT NULL REFERENCES public.teachers(id), class_id uuid NOT NULL REFERENCES public.classes(id),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(teacher_id,class_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.teacher_classes TO authenticated; GRANT ALL ON public.teacher_classes TO service_role;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_classes_staff_read ON public.teacher_classes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY teacher_classes_admin_write ON public.teacher_classes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.teacher_can_access_class(_user_id uuid,_class_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_user_id,'admin') OR EXISTS(SELECT 1 FROM public.teacher_classes tc JOIN public.teachers t ON t.id=tc.teacher_id WHERE t.user_id=_user_id AND tc.class_id=_class_id) $$;
GRANT EXECUTE ON FUNCTION public.teacher_can_access_class(uuid,uuid) TO authenticated;

CREATE TABLE public.enrollments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL REFERENCES public.students(id), class_id uuid NOT NULL REFERENCES public.classes(id),
 status public.enrollment_status NOT NULL DEFAULT 'active', started_on date NOT NULL DEFAULT current_date, ended_on date, previous_enrollment_id uuid REFERENCES public.enrollments(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(student_id,class_id,started_on)
);
GRANT SELECT,INSERT,UPDATE ON public.enrollments TO authenticated; GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollments_self_read ON public.enrollments FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.students s WHERE s.id=student_id AND s.auth_user_id=auth.uid()));
CREATE POLICY enrollments_teacher_read ON public.enrollments FOR SELECT TO authenticated USING (public.teacher_can_access_class(auth.uid(),class_id));
CREATE POLICY enrollments_admin_write ON public.enrollments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY students_teacher_read ON public.students FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.enrollments e WHERE e.student_id=students.id AND public.teacher_can_access_class(auth.uid(),e.class_id)));

CREATE TABLE public.question_bank (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL, course_id uuid REFERENCES public.courses(id), module_id uuid REFERENCES public.modules(id), content_tag text,
 difficulty smallint NOT NULL DEFAULT 2 CHECK(difficulty BETWEEN 1 AND 3), type public.question_type NOT NULL, prompt text NOT NULL, explanation text, default_points numeric(8,2) NOT NULL DEFAULT 1 CHECK(default_points>=0),
 status public.record_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.question_bank TO authenticated; GRANT ALL ON public.question_bank TO service_role;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY question_bank_staff_read ON public.question_bank FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY question_bank_staff_create ON public.question_bank FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND author_id=auth.uid());
CREATE POLICY question_bank_author_update ON public.question_bank FOR UPDATE TO authenticated USING (author_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.question_options (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), question_id uuid NOT NULL REFERENCES public.question_bank(id), option_text text NOT NULL, is_correct boolean NOT NULL DEFAULT false, position integer NOT NULL CHECK(position>0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(question_id,position)
);
GRANT SELECT,INSERT,UPDATE ON public.question_options TO authenticated; GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY question_options_staff_all ON public.question_options FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, title text NOT NULL, description text, kind public.assessment_kind NOT NULL DEFAULT 'assessment', course_id uuid NOT NULL REFERENCES public.courses(id), module_id uuid REFERENCES public.modules(id),
 status public.assessment_status NOT NULL DEFAULT 'draft', max_score numeric(8,2) NOT NULL DEFAULT 10 CHECK(max_score>0), passing_score numeric(8,2) NOT NULL DEFAULT 7 CHECK(passing_score>=0), max_attempts integer NOT NULL DEFAULT 1 CHECK(max_attempts>0), time_limit_minutes integer CHECK(time_limit_minutes>0), opens_at timestamptz, closes_at timestamptz,
 shuffle_questions boolean NOT NULL DEFAULT false, shuffle_options boolean NOT NULL DEFAULT false, show_score_immediately boolean NOT NULL DEFAULT false, show_answers boolean NOT NULL DEFAULT false, release_after_close boolean NOT NULL DEFAULT false, manual_release boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz, CHECK(passing_score<=max_score), CHECK(closes_at IS NULL OR opens_at IS NULL OR closes_at>opens_at)
);
GRANT SELECT,INSERT,UPDATE ON public.assessments TO authenticated; GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessments_staff_read ON public.assessments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY assessments_staff_create ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND owner_id=auth.uid());
CREATE POLICY assessments_owner_update ON public.assessments FOR UPDATE TO authenticated USING (owner_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.assessment_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id uuid NOT NULL REFERENCES public.assessments(id), version_no integer NOT NULL CHECK(version_no>0), snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(assessment_id,version_no)
);
GRANT SELECT,INSERT ON public.assessment_versions TO authenticated; GRANT ALL ON public.assessment_versions TO service_role;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_versions_staff_read ON public.assessment_versions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY assessment_versions_staff_create ON public.assessment_versions FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND created_by=auth.uid());

CREATE TABLE public.assessment_questions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES public.assessment_versions(id), question_id uuid NOT NULL REFERENCES public.question_bank(id), position integer NOT NULL CHECK(position>0), points numeric(8,2) NOT NULL CHECK(points>=0), is_annulled boolean NOT NULL DEFAULT false, annulment_rule text CHECK(annulment_rule IN ('points_for_all','remove_from_total')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(version_id,position), UNIQUE(version_id,question_id)
);
GRANT SELECT,INSERT,UPDATE ON public.assessment_questions TO authenticated; GRANT ALL ON public.assessment_questions TO service_role;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_questions_staff_all ON public.assessment_questions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.assessment_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id uuid NOT NULL REFERENCES public.assessments(id), class_id uuid NOT NULL REFERENCES public.classes(id), assigned_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(assessment_id,class_id)
);
GRANT SELECT,INSERT,UPDATE ON public.assessment_assignments TO authenticated; GRANT ALL ON public.assessment_assignments TO service_role;
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assignments_staff_read ON public.assessment_assignments FOR SELECT TO authenticated USING (public.teacher_can_access_class(auth.uid(),class_id));
CREATE POLICY assignments_admin_all ON public.assessment_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY assignments_teacher_create ON public.assessment_assignments FOR INSERT TO authenticated WITH CHECK (public.teacher_can_access_class(auth.uid(),class_id) AND assigned_by=auth.uid());

CREATE TABLE public.attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id uuid NOT NULL REFERENCES public.assessments(id), version_id uuid NOT NULL REFERENCES public.assessment_versions(id), student_id uuid NOT NULL REFERENCES public.students(id),
 attempt_number integer NOT NULL CHECK(attempt_number>0), status public.attempt_status NOT NULL DEFAULT 'in_progress', started_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, submitted_at timestamptz, submission_reason text, question_order uuid[] NOT NULL DEFAULT '{}', option_orders jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(assessment_id,student_id,attempt_number)
);
CREATE UNIQUE INDEX attempts_one_active_idx ON public.attempts(assessment_id,student_id) WHERE status='in_progress';
CREATE INDEX attempts_student_idx ON public.attempts(student_id,created_at DESC);
GRANT SELECT,INSERT,UPDATE ON public.attempts TO authenticated; GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY attempts_self_read ON public.attempts FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.students s WHERE s.id=student_id AND s.auth_user_id=auth.uid()));
CREATE POLICY attempts_staff_read ON public.attempts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), attempt_id uuid NOT NULL REFERENCES public.attempts(id), assessment_question_id uuid NOT NULL REFERENCES public.assessment_questions(id), response jsonb NOT NULL DEFAULT '{}'::jsonb,
 awarded_points numeric(8,2), auto_graded boolean NOT NULL DEFAULT false, grading_status text NOT NULL DEFAULT 'pending' CHECK(grading_status IN ('pending','automatic','manual','not_required')), teacher_comment text, graded_by uuid, graded_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(attempt_id,assessment_question_id)
);
CREATE INDEX answers_attempt_idx ON public.answers(attempt_id);
GRANT SELECT,INSERT,UPDATE ON public.answers TO authenticated; GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY answers_self_read ON public.answers FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.attempts a JOIN public.students s ON s.id=a.student_id WHERE a.id=attempt_id AND s.auth_user_id=auth.uid()));
CREATE POLICY answers_staff_read ON public.answers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.grades (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), attempt_id uuid NOT NULL UNIQUE REFERENCES public.attempts(id), score numeric(8,2) NOT NULL DEFAULT 0, percentage numeric(6,2) NOT NULL DEFAULT 0, correct_count integer NOT NULL DEFAULT 0, incorrect_count integer NOT NULL DEFAULT 0, blank_count integer NOT NULL DEFAULT 0, result_label text NOT NULL, released_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON public.grades TO authenticated; GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY grades_self_released_read ON public.grades FOR SELECT TO authenticated USING (released_at IS NOT NULL AND EXISTS(SELECT 1 FROM public.attempts a JOIN public.students s ON s.id=a.student_id WHERE a.id=attempt_id AND s.auth_user_id=auth.uid()));
CREATE POLICY grades_staff_read ON public.grades FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.import_batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_by uuid NOT NULL, original_filename text NOT NULL, storage_path text NOT NULL, mode text NOT NULL CHECK(mode IN ('add_only','add_update','update_only')), status public.import_status NOT NULL DEFAULT 'uploaded', column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb, total_count integer NOT NULL DEFAULT 0, valid_count integer NOT NULL DEFAULT 0, review_count integer NOT NULL DEFAULT 0, error_count integer NOT NULL DEFAULT 0, created_count integer NOT NULL DEFAULT 0, updated_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
GRANT SELECT,INSERT,UPDATE ON public.import_batches TO authenticated; GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY import_batches_admin_all ON public.import_batches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND created_by=auth.uid());

CREATE TABLE public.import_rows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), batch_id uuid NOT NULL REFERENCES public.import_batches(id), row_number integer NOT NULL, raw_data jsonb NOT NULL, normalized_data jsonb, validation_status text NOT NULL CHECK(validation_status IN ('valid','review','error','ignored')), messages jsonb NOT NULL DEFAULT '[]'::jsonb, matched_student_id uuid REFERENCES public.students(id), applied_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(batch_id,row_number)
);
GRANT SELECT,INSERT,UPDATE ON public.import_rows TO authenticated; GRANT ALL ON public.import_rows TO service_role;
ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY import_rows_admin_all ON public.import_rows FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action text NOT NULL, entity_type text NOT NULL, entity_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs(entity_type,entity_id,created_at DESC);
GRANT SELECT,INSERT ON public.audit_logs TO authenticated; GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY audit_staff_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id=auth.uid() AND public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['profiles','courses','modules','classes','students','teachers','enrollments','question_bank','assessments','attempts','answers','grades'] LOOP EXECUTE format('CREATE TRIGGER touch_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()',t,t); END LOOP; END $$;

CREATE INDEX enrollments_student_idx ON public.enrollments(student_id,status);
CREATE INDEX enrollments_class_idx ON public.enrollments(class_id,status);
CREATE INDEX assessment_assignments_class_idx ON public.assessment_assignments(class_id);
CREATE INDEX assessments_status_idx ON public.assessments(status,opens_at,closes_at);
CREATE INDEX question_bank_filters_idx ON public.question_bank(course_id,module_id,content_tag,difficulty,type);
