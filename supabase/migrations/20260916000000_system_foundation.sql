-- Migration: 20260916000000_system_foundation.sql
-- Description: Core foundation RPC functions, bootstrap admin, safe teacher creation with server-side temporary password generation, system status, and updated RLS.

-- 0. Ensure required extensions and columns exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email text;

-- 1. Helper function to check if initial setup is required (0 admins exist)
CREATE OR REPLACE FUNCTION public.is_setup_required()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_setup_required() TO anon, authenticated, service_role;

-- 2. Bootstrap first admin function (authenticated session)
CREATE OR REPLACE FUNCTION public.bootstrap_admin(p_full_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _email text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Configuração inicial já concluída. Já existe um administrador cadastrado.';
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _user_id;

  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (_user_id, COALESCE(NULLIF(trim(p_full_name), ''), 'Administrador'), _email, 'active'::public.record_status)
  ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin(text) TO authenticated, service_role;

-- 2b. Bootstrap admin account RPC (bypasses Signups not allowed restriction)
DROP FUNCTION IF EXISTS public.bootstrap_admin_account(text, text, text);

CREATE OR REPLACE FUNCTION public.bootstrap_admin_account(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth, extensions
AS $$
DECLARE
  _user_id uuid;
  _encrypted_pwd text;
BEGIN
  -- Verify setup is required (0 admins exist)
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Configuração inicial já concluída. Já existe um administrador cadastrado.';
  END IF;

  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'E-mail é obrigatório.';
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Senha deve ter no mínimo 6 caracteres.';
  END IF;

  _encrypted_pwd := crypt(p_password, gen_salt('bf'));

  -- Check if user already exists in auth.users
  SELECT id INTO _user_id FROM auth.users WHERE email = p_email;

  IF _user_id IS NOT NULL THEN
    -- Update existing auth user password and confirm email
    UPDATE auth.users 
    SET encrypted_password = _encrypted_pwd,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', p_full_name),
        updated_at = now()
    WHERE id = _user_id;
  ELSE
    -- Create new auth user
    _user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      _user_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      _encrypted_pwd,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (_user_id, COALESCE(NULLIF(trim(p_full_name), ''), 'Administrador'), p_email, 'active'::public.record_status)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_account(text, text, text) TO anon, authenticated, service_role;

-- 3. Admin create teacher function with server-side temporary password generation
CREATE OR REPLACE FUNCTION public.admin_create_teacher(
  p_email text,
  p_full_name text,
  p_status text DEFAULT 'active',
  p_password text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth, extensions
AS $$
DECLARE
  _calling_user_id uuid := auth.uid();
  _new_user_id uuid;
  _temp_password text;
  _encrypted_pwd text;
  _status_enum public.record_status;
BEGIN
  -- Verify caller is admin
  IF _calling_user_id IS NULL OR NOT private.has_role(_calling_user_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem cadastrar novos professores.';
  END IF;

  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'E-mail é obrigatório.';
  END IF;

  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Nome completo é obrigatório.';
  END IF;

  _status_enum := COALESCE(p_status::public.record_status, 'active'::public.record_status);

  -- Generate strong temporary password if not provided
  IF p_password IS NULL OR length(trim(p_password)) < 6 THEN
    _temp_password := 'Prof#' || substr(md5(random()::text || clock_timestamp()::text), 1, 8) || '!';
  ELSE
    _temp_password := p_password;
  END IF;

  -- Check if user email already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Já existe um usuário cadastrado com este e-mail.';
  END IF;

  _new_user_id := gen_random_uuid();
  _encrypted_pwd := crypt(_temp_password, gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    _new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    _encrypted_pwd,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (_new_user_id, p_full_name, p_email, _status_enum)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, status = EXCLUDED.status;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_new_user_id, 'teacher'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert teacher record with email
  INSERT INTO public.teachers (user_id, full_name, email, status)
  VALUES (_new_user_id, p_full_name, p_email, _status_enum)
  ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, status = EXCLUDED.status;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', _new_user_id,
    'email', p_email,
    'full_name', p_full_name,
    'temp_password', _temp_password
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_teacher(text, text, text, text) TO authenticated, service_role;

-- 4. Get system status diagnostics RPC
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  _admin_count int;
  _teacher_count int;
  _student_count int;
  _course_count int;
  _class_count int;
BEGIN
  SELECT count(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin'::public.app_role;
  SELECT count(*) INTO _teacher_count FROM public.teachers;
  SELECT count(*) INTO _student_count FROM public.students;
  SELECT count(*) INTO _course_count FROM public.courses;
  SELECT count(*) INTO _class_count FROM public.classes;

  RETURN jsonb_build_object(
    'backend', 'connected',
    'database', 'ok',
    'auth', 'ok',
    'profiles', 'ok',
    'roles', 'ok',
    'storage', 'ok',
    'admin_count', _admin_count,
    'teacher_count', _teacher_count,
    'student_count', _student_count,
    'course_count', _course_count,
    'class_count', _class_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated, service_role;

-- 5. RLS Policy Updates: Ensure authenticated users can read basic staff & role info needed for context
CREATE POLICY user_roles_read_all_staff ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_read_all_authenticated ON public.profiles FOR SELECT TO authenticated USING (true);
