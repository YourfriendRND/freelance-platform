import { FindTasksQuery } from './find-tasks-query.type';
import { TaskStatus } from './task-status';

export type FindMyTasksQuery = Omit<FindTasksQuery, 'status'> & {
  status?: TaskStatus;
};
