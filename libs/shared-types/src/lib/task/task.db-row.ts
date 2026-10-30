export interface TaskDbRow {
  id: string;
  title: string;
  description: string;
  status: string;
  budget_min: number;
  budget_max: number;
  execution_type: string;
  deadline: Date;
  customer_id: string;
  category_id: string;
  created_at: Date;
  updated_at: Date;
  has_applied?: boolean;
  applications_count?: string;
  views_count?: string;
  author_id?: string;
  author_email?: string;
  author_first_name?: string;
  author_last_name?: string | null;
  author_role?: string;
  author_created_at?: Date;
}
