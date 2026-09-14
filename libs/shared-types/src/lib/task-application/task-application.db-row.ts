export interface TaskApplicationDbRow {
  id: string;
  task_id: string;
  performer_id: string;
  proposed_price: number | null;
  message: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
