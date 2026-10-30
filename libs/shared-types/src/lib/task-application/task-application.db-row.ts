export interface TaskApplicationDbRow {
  id: string;
  task_id: string;
  performer_id: string;
  proposed_price: number | null;
  message: string;
  timeline: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  user_id?: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string | null;
  user_role?: string;
  user_created_at?: Date;
  task_title?: string;
  task_budget_min?: number;
  task_budget_max?: number;
  task_deadline?: Date;
  task_execution_type?: string;
  task_category_id?: string;
  author_id?: string;
  author_email?: string;
  author_first_name?: string;
  author_last_name?: string | null;
  author_role?: string;
  author_created_at?: Date;
}
