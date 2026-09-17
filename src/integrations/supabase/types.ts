export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          assessment_question_id: string
          attempt_id: string
          auto_graded: boolean
          awarded_points: number | null
          created_at: string
          graded_at: string | null
          graded_by: string | null
          grading_status: string
          id: string
          response: Json
          teacher_comment: string | null
          updated_at: string
        }
        Insert: {
          assessment_question_id: string
          attempt_id: string
          auto_graded?: boolean
          awarded_points?: number | null
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string
          id?: string
          response?: Json
          teacher_comment?: string | null
          updated_at?: string
        }
        Update: {
          assessment_question_id?: string
          attempt_id?: string
          auto_graded?: boolean
          awarded_points?: number | null
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          grading_status?: string
          id?: string
          response?: Json
          teacher_comment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_assessment_question_id_fkey"
            columns: ["assessment_question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_assignments: {
        Row: {
          assessment_id: string
          assigned_by: string
          class_id: string
          created_at: string
          id: string
        }
        Insert: {
          assessment_id: string
          assigned_by: string
          class_id: string
          created_at?: string
          id?: string
        }
        Update: {
          assessment_id?: string
          assigned_by?: string
          class_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_assignments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          annulment_rule: string | null
          created_at: string
          id: string
          is_annulled: boolean
          points: number
          position: number
          question_id: string
          version_id: string
        }
        Insert: {
          annulment_rule?: string | null
          created_at?: string
          id?: string
          is_annulled?: boolean
          points: number
          position: number
          question_id: string
          version_id: string
        }
        Update: {
          annulment_rule?: string | null
          created_at?: string
          id?: string
          is_annulled?: boolean
          points?: number
          position?: number
          question_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "assessment_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_versions: {
        Row: {
          assessment_id: string
          created_at: string
          created_by: string
          id: string
          snapshot: Json
          version_no: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          created_by: string
          id?: string
          snapshot?: Json
          version_no: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          created_by?: string
          id?: string
          snapshot?: Json
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_versions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          archived_at: string | null
          closes_at: string | null
          course_id: string
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["assessment_kind"]
          manual_release: boolean
          max_attempts: number
          max_score: number
          module_id: string | null
          opens_at: string | null
          owner_id: string
          passing_score: number
          release_after_close: boolean
          show_answers: boolean
          show_score_immediately: boolean
          shuffle_options: boolean
          shuffle_questions: boolean
          status: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          closes_at?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["assessment_kind"]
          manual_release?: boolean
          max_attempts?: number
          max_score?: number
          module_id?: string | null
          opens_at?: string | null
          owner_id: string
          passing_score?: number
          release_after_close?: boolean
          show_answers?: boolean
          show_score_immediately?: boolean
          shuffle_options?: boolean
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          closes_at?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["assessment_kind"]
          manual_release?: boolean
          max_attempts?: number
          max_score?: number
          module_id?: string | null
          opens_at?: string | null
          owner_id?: string
          passing_score?: number
          release_after_close?: boolean
          show_answers?: boolean
          show_score_immediately?: boolean
          shuffle_options?: boolean
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          assessment_id: string
          attempt_number: number
          created_at: string
          expires_at: string | null
          id: string
          option_orders: Json
          question_order: string[]
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submission_reason: string | null
          submitted_at: string | null
          updated_at: string
          version_id: string
        }
        Insert: {
          assessment_id: string
          attempt_number: number
          created_at?: string
          expires_at?: string | null
          id?: string
          option_orders?: Json
          question_order?: string[]
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id: string
          submission_reason?: string | null
          submitted_at?: string | null
          updated_at?: string
          version_id: string
        }
        Update: {
          assessment_id?: string
          attempt_number?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          option_orders?: Json
          question_order?: string[]
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id?: string
          submission_reason?: string | null
          submitted_at?: string | null
          updated_at?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "assessment_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      classes: {
        Row: {
          course_id: string
          created_at: string
          current_module_id: string | null
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          weekday: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          current_module_id?: string | null
          ends_at?: string | null
          id?: string
          name: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          current_module_id?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          class_id: string
          created_at: string
          ended_on: string | null
          id: string
          previous_enrollment_id: string | null
          started_on: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          ended_on?: string | null
          id?: string
          previous_enrollment_id?: string | null
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          ended_on?: string | null
          id?: string
          previous_enrollment_id?: string | null
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_previous_enrollment_id_fkey"
            columns: ["previous_enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          attempt_id: string
          blank_count: number
          correct_count: number
          created_at: string
          id: string
          incorrect_count: number
          percentage: number
          released_at: string | null
          result_label: string
          score: number
          updated_at: string
        }
        Insert: {
          attempt_id: string
          blank_count?: number
          correct_count?: number
          created_at?: string
          id?: string
          incorrect_count?: number
          percentage?: number
          released_at?: string | null
          result_label: string
          score?: number
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          blank_count?: number
          correct_count?: number
          created_at?: string
          id?: string
          incorrect_count?: number
          percentage?: number
          released_at?: string | null
          result_label?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          column_mapping: Json
          completed_at: string | null
          created_at: string
          created_by: string
          created_count: number
          error_count: number
          id: string
          mode: string
          original_filename: string
          review_count: number
          status: Database["public"]["Enums"]["import_status"]
          storage_path: string
          total_count: number
          updated_count: number
          valid_count: number
        }
        Insert: {
          column_mapping?: Json
          completed_at?: string | null
          created_at?: string
          created_by: string
          created_count?: number
          error_count?: number
          id?: string
          mode: string
          original_filename: string
          review_count?: number
          status?: Database["public"]["Enums"]["import_status"]
          storage_path: string
          total_count?: number
          updated_count?: number
          valid_count?: number
        }
        Update: {
          column_mapping?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string
          created_count?: number
          error_count?: number
          id?: string
          mode?: string
          original_filename?: string
          review_count?: number
          status?: Database["public"]["Enums"]["import_status"]
          storage_path?: string
          total_count?: number
          updated_count?: number
          valid_count?: number
        }
        Relationships: []
      }
      import_rows: {
        Row: {
          applied_at: string | null
          batch_id: string
          created_at: string
          id: string
          matched_student_id: string | null
          messages: Json
          normalized_data: Json | null
          raw_data: Json
          row_number: number
          validation_status: string
        }
        Insert: {
          applied_at?: string | null
          batch_id: string
          created_at?: string
          id?: string
          matched_student_id?: string | null
          messages?: Json
          normalized_data?: Json | null
          raw_data: Json
          row_number: number
          validation_status: string
        }
        Update: {
          applied_at?: string | null
          batch_id?: string
          created_at?: string
          id?: string
          matched_student_id?: string | null
          messages?: Json
          normalized_data?: Json | null
          raw_data?: Json
          row_number?: number
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_matched_student_id_fkey"
            columns: ["matched_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          name: string
          sequence_no: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          name: string
          sequence_no?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          name?: string
          sequence_no?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          author_id: string
          content_tag: string | null
          course_id: string | null
          created_at: string
          default_points: number
          difficulty: number
          explanation: string | null
          id: string
          module_id: string | null
          prompt: string
          status: Database["public"]["Enums"]["record_status"]
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          author_id: string
          content_tag?: string | null
          course_id?: string | null
          created_at?: string
          default_points?: number
          difficulty?: number
          explanation?: string | null
          id?: string
          module_id?: string | null
          prompt: string
          status?: Database["public"]["Enums"]["record_status"]
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          content_tag?: string | null
          course_id?: string | null
          created_at?: string
          default_points?: number
          difficulty?: number
          explanation?: string | null
          id?: string
          module_id?: string | null
          prompt?: string
          status?: Database["public"]["Enums"]["record_status"]
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_text: string
          position: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text: string
          position: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          activation_required: boolean
          archived_at: string | null
          auth_user_id: string | null
          cpf_last2: string | null
          cpf_normalized: string
          created_at: string
          full_name: string
          id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          activation_required?: boolean
          archived_at?: string | null
          auth_user_id?: string | null
          cpf_last2?: string | null
          cpf_normalized: string
          created_at?: string
          full_name: string
          id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          activation_required?: boolean
          archived_at?: string | null
          auth_user_id?: string | null
          cpf_last2?: string | null
          cpf_normalized?: string
          created_at?: string
          full_name?: string
          id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          full_name: string
          id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_setup_required: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      bootstrap_admin: {
        Args: {
          p_full_name?: string | undefined
        }
        Returns: undefined
      }
      bootstrap_admin_account: {
        Args: {
          p_email?: string | undefined
          p_password?: string | undefined
          p_full_name?: string | undefined
        }
        Returns: string
      }
      admin_create_teacher: {
        Args: {
          p_email?: string | undefined
          p_full_name?: string | undefined
          p_status?: string | undefined
          p_password?: string | null | undefined
        }
        Returns: Json
      }
      get_system_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      assessment_kind: "activity" | "assessment"
      assessment_status:
        | "draft"
        | "scheduled"
        | "available"
        | "closed"
        | "grading"
        | "finalized"
        | "archived"
      attempt_status: "in_progress" | "submitted" | "expired" | "graded"
      enrollment_status: "active" | "completed" | "transferred" | "cancelled"
      import_status:
        | "uploaded"
        | "mapping"
        | "validating"
        | "preview"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "failed"
      question_type:
        | "single_choice"
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "essay"
        | "fill_blank"
        | "matching"
        | "file_upload"
      record_status: "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student"],
      assessment_kind: ["activity", "assessment"],
      assessment_status: [
        "draft",
        "scheduled",
        "available",
        "closed",
        "grading",
        "finalized",
        "archived",
      ],
      attempt_status: ["in_progress", "submitted", "expired", "graded"],
      enrollment_status: ["active", "completed", "transferred", "cancelled"],
      import_status: [
        "uploaded",
        "mapping",
        "validating",
        "preview",
        "confirmed",
        "completed",
        "cancelled",
        "failed",
      ],
      question_type: [
        "single_choice",
        "multiple_choice",
        "true_false",
        "short_answer",
        "essay",
        "fill_blank",
        "matching",
        "file_upload",
      ],
      record_status: ["active", "archived"],
    },
  },
} as const
