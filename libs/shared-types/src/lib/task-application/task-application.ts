import { IEntity } from '../abstract/entity';
import { TaskApplicationStatus } from './task-application-status';

export interface ITaskApplication extends IEntity {
  taskId: string;
  performerId: string;
  proposedPrice: number | null;
  message: string;
  status: TaskApplicationStatus;
}
