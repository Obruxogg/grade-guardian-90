DROP POLICY assessments_staff_read ON public.assessments;
CREATE POLICY assessments_authorized_read ON public.assessments FOR SELECT TO authenticated USING (
 private.has_role(auth.uid(),'admin') OR owner_id=auth.uid() OR EXISTS(
  SELECT 1 FROM public.assessment_assignments aa WHERE aa.assessment_id=assessments.id AND private.teacher_can_access_class(auth.uid(),aa.class_id)
 )
);
DROP POLICY assessment_versions_staff_read ON public.assessment_versions;
CREATE POLICY assessment_versions_authorized_read ON public.assessment_versions FOR SELECT TO authenticated USING (
 EXISTS(SELECT 1 FROM public.assessments a WHERE a.id=assessment_id)
);
DROP POLICY assessment_questions_staff_all ON public.assessment_questions;
CREATE POLICY assessment_questions_authorized_read ON public.assessment_questions FOR SELECT TO authenticated USING (
 EXISTS(SELECT 1 FROM public.assessment_versions av JOIN public.assessments a ON a.id=av.assessment_id WHERE av.id=version_id)
);
CREATE POLICY assessment_questions_author_write ON public.assessment_questions FOR ALL TO authenticated USING (
 EXISTS(SELECT 1 FROM public.assessment_versions av JOIN public.assessments a ON a.id=av.assessment_id WHERE av.id=version_id AND (a.owner_id=auth.uid() OR private.has_role(auth.uid(),'admin')))
) WITH CHECK (
 EXISTS(SELECT 1 FROM public.assessment_versions av JOIN public.assessments a ON a.id=av.assessment_id WHERE av.id=version_id AND (a.owner_id=auth.uid() OR private.has_role(auth.uid(),'admin')))
);
DROP POLICY attempts_staff_read ON public.attempts;
CREATE POLICY attempts_authorized_staff_read ON public.attempts FOR SELECT TO authenticated USING (
 private.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.assessment_assignments aa WHERE aa.assessment_id=attempts.assessment_id AND private.teacher_can_access_class(auth.uid(),aa.class_id))
);
DROP POLICY answers_staff_read ON public.answers;
CREATE POLICY answers_authorized_staff_read ON public.answers FOR SELECT TO authenticated USING (
 private.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.attempts a JOIN public.assessment_assignments aa ON aa.assessment_id=a.assessment_id WHERE a.id=attempt_id AND private.teacher_can_access_class(auth.uid(),aa.class_id))
);
DROP POLICY grades_staff_read ON public.grades;
CREATE POLICY grades_authorized_staff_read ON public.grades FOR SELECT TO authenticated USING (
 private.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.attempts a JOIN public.assessment_assignments aa ON aa.assessment_id=a.assessment_id WHERE a.id=attempt_id AND private.teacher_can_access_class(auth.uid(),aa.class_id))
);