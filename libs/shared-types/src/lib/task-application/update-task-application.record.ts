import { CreateTaskApplicationRecord } from './create-task-application.record';

export type UpdateTaskApplicationRecord = Partial<
  Pick<CreateTaskApplicationRecord, 'message' | 'proposedPrice' | 'status'>
>;
