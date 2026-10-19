import { FindMyTasksQuery, FindTasksQuery } from '@freelance-platform/shared-types';

type TaskListParams = Record<string, string>;

export function toTaskListParams(
  query: FindTasksQuery | FindMyTasksQuery,
): TaskListParams {
  const params: TaskListParams = {};

  if (query.categoryId !== undefined) {
    params['categoryId'] = query.categoryId;
  }

  if (query.status !== undefined) {
    params['status'] = query.status;
  }

  if (query.budgetMin !== undefined) {
    params['budgetMin'] = String(query.budgetMin);
  }

  if (query.budgetMax !== undefined) {
    params['budgetMax'] = String(query.budgetMax);
  }

  if (query.sort !== undefined) {
    params['sort'] = query.sort;
  }

  if (query.page !== undefined) {
    params['page'] = String(query.page);
  }

  if (query.limit !== undefined) {
    params['limit'] = String(query.limit);
  }

  return params;
}
