export type Roster = {
  id: string;
  school_year: number;
  institution_name: string;
  modality: string;
  education_level: string;
  grade: string;
  section: string;
  name?: string | null;
  active: boolean;
  student_count?: number;
  active_student_count?: number;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Student = {
  id: string;
  roster_id: string;
  full_name: string;
  internal_code?: string | null;
  document_number?: string | null;
  sex?: string | null;
  notes?: string | null;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RosterPayload = Pick<Roster, "school_year" | "institution_name" | "modality" | "education_level" | "grade" | "section"> & {
  name?: string;
};

export type RosterUpdatePayload = Partial<RosterPayload> & { active?: boolean };

export type StudentPayload = Pick<Student, "full_name"> & {
  internal_code?: string;
  document_number?: string;
  sex?: string;
  notes?: string;
  active?: boolean;
};

export type PaginatedResponse<Item> = {
  items: Item[];
  total: number;
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
};

export type ImportMappingField =
  | "full_name"
  | "last_names"
  | "first_names"
  | "internal_code"
  | "document_number"
  | "sex"
  | "notes";

export type ImportMapping = Partial<Record<ImportMappingField, string>>;

export type RosterImportRow = {
  row_number: number;
  values: Record<string, string>;
  status?: "valid" | "duplicate" | "invalid";
  message?: string;
};

export type RosterImportPreview = {
  preview_token?: string | null;
  columns: string[];
  rows: RosterImportRow[];
  suggested_mapping: ImportMapping;
  warnings: string[];
  total_rows: number;
};

export type ConfirmImportPayload = {
  preview_token?: string | null;
  mapping: ImportMapping;
  rows: Array<Record<string, string>>;
  skip_duplicates: boolean;
};

export type ImportResult = {
  created_count: number;
  skipped_count?: number;
  students?: Student[];
};
