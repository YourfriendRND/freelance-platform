import { TaskApplicationStatus } from './task-application-status';

export interface CreateTaskApplicationRecord {
  taskId: string;
  performerId: string;
  message: string;
  proposedPrice?: number | null;
  timeline?: string | null;
  status?: TaskApplicationStatus;
}
