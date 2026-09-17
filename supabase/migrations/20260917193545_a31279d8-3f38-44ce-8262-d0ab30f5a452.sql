ALTER TABLE public.teachers ADD COLUMN email text;
CREATE UNIQUE INDEX teachers_email_unique_idx ON public.teachers (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX user_roles_one_role_per_user_idx ON public.user_roles (user_id);

CREATE POLICY teachers_self_read ON public.teachers
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(
  _user_id uuid,
  _full_name text,
  _email text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('repertorio:first-admin'));

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'INITIAL_SETUP_COMPLETED' USING ERRCODE = 'P0001';
  END IF;

  IF _user_id IS NULL OR length(trim(_full_name)) < 2 OR position('@' in _email) < 2 THEN
    RAISE EXCEPTION 'INVALID_ADMIN_DATA' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (_user_id, trim(_full_name), lower(trim(_email)), 'active'::public.record_status);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::public.app_role);

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (_user_id, 'system.initial_admin_created', 'profile', _user_id, jsonb_build_object('email', lower(trim(_email))));
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.create_teacher_identity(
  _actor_id uuid,
  _user_id uuid,
  _full_name text,
  _email text,
  _status public.record_status DEFAULT 'active'::public.record_status
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  _teacher_id uuid;
BEGIN
  IF NOT private.has_role(_actor_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF _user_id IS NULL OR length(trim(_full_name)) < 2 OR position('@' in _email) < 2 THEN
    RAISE EXCEPTION 'INVALID_TEACHER_DATA' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (_user_id, trim(_full_name), lower(trim(_email)), _status);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'teacher'::public.app_role);

  INSERT INTO public.teachers (user_id, full_name, email, status)
  VALUES (_user_id, trim(_full_name), lower(trim(_email)), _status)
  RETURNING id INTO _teacher_id;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (_actor_id, 'teacher.access_created', 'teacher', _teacher_id, jsonb_build_object('user_id', _user_id, 'email', lower(trim(_email))));

  RETURN _teacher_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_teacher_identity(uuid,uuid,text,text,public.record_status) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_teacher_identity(uuid,uuid,text,text,public.record_status) TO service_role;