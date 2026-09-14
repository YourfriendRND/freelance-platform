import { TaskApplicationDbRow } from './task-application.db-row';

export interface TaskApplicationWithTaskCustomerDbRow extends TaskApplicationDbRow {
  task_customer_id: string;
}
