import { TaskApplicationStatus } from './task-application-status';

export interface CreateTaskApplicationRecord {
  taskId: string;
  performerId: string;
  message: string;
  proposedPrice?: number | null;
  status?: TaskApplicationStatus;
}
