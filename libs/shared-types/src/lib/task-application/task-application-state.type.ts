import { TaskApplicationResponse } from './task-application-client.type';

export type TaskApplicationState = {
  applications: TaskApplicationResponse[];
  duplicateTaskIds: string[];
  selectedApplication: TaskApplicationResponse | null;
  isLoading: boolean;
  isLoaded: boolean;
  isSelectedLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  selectedError: string | null;
  submitError: string | null;
};
