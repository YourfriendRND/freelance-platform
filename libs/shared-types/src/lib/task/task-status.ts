export enum TaskStatus {
  Open = 'open',
  Closed = 'closed',
  Draft = 'draft',
}

export const PUBLIC_TASK_STATUSES = [
  TaskStatus.Open,
  TaskStatus.Closed,
] as const;

export type PublicTaskStatus = (typeof PUBLIC_TASK_STATUSES)[number];

export enum TaskStatusLabel {
  Open = 'Открыта',
  Closed = 'Закрыта',
  Draft = 'Черновик',
}

export const TASK_STATUS_LABEL: Record<TaskStatus, TaskStatusLabel> = {
  [TaskStatus.Open]: TaskStatusLabel.Open,
  [TaskStatus.Closed]: TaskStatusLabel.Closed,
  [TaskStatus.Draft]: TaskStatusLabel.Draft,
};
