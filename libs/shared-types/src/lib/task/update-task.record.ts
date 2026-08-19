import { CreateTaskRecord } from './create-task.record';

export type UpdateTaskRecord = Partial<Omit<CreateTaskRecord, 'customerId'>>;
