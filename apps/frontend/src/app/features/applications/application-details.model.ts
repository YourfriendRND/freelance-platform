import { TaskApplicationStatus, TaskExecutionType } from '@freelance-platform/shared-types';

export type ApplicationDetailsClient = {
  name: string;
  ratingLabel: string;
};

export type ApplicationDetailsTask = {
  id: string;
  deadlineLabel: string;
  executionType: TaskExecutionType | null;
};

export type ApplicationDetailsView = {
  id: string;
  status: TaskApplicationStatus;
  taskTitle: string;
  submittedAt: string;
  proposedPrice: number | null;
  timelineLabel: string;
  taskBudgetLabel: string;
  message: string;
  client: ApplicationDetailsClient;
  task: ApplicationDetailsTask;
};
