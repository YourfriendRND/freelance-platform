import { TaskStatus, TASK_STATUS_LABEL } from '@freelance-platform/shared-types';
import { UiSelectOption } from '@freelance-platform/ui';

export type TasksSortValue = 'newest' | 'oldest' | 'budget-desc' | 'budget-asc';

export const TASKS_ALL_CATEGORIES_OPTION: UiSelectOption = {
  value: 'all',
  label: 'Все категории',
};

export const TASKS_STATUS_OPTIONS: readonly UiSelectOption<TaskStatus | 'all'>[] = [
  { value: 'all', label: 'Все статусы' },
  { value: TaskStatus.Open, label: TASK_STATUS_LABEL[TaskStatus.Open] },
  { value: TaskStatus.Draft, label: TASK_STATUS_LABEL[TaskStatus.Draft] },
  { value: TaskStatus.Closed, label: TASK_STATUS_LABEL[TaskStatus.Closed] },
];

export const TASKS_SORT_OPTIONS: readonly UiSelectOption<TasksSortValue>[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'budget-desc', label: 'Бюджет: по убыванию' },
  { value: 'budget-asc', label: 'Бюджет: по возрастанию' },
];
