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
}
