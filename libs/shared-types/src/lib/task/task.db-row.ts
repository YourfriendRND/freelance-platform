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
}
