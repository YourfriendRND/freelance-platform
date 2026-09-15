import { TaskApplicationEntity } from './task-application.entity';

export interface TaskApplicationWithTaskCustomer {
  application: TaskApplicationEntity;
  taskCustomerId: string;
}
