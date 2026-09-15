export enum TaskApplicationStatus {
  Pending = 'pending',
  Accept = 'accept',
  Decline = 'decline',
}

export enum TaskApplicationStatusLabel {
  Pending = 'На рассмотрении',
  Accept = 'Принят',
  Decline = 'Отклонён',
}

export const TASK_APPLICATION_STATUS_LABEL: Record<
  TaskApplicationStatus,
  TaskApplicationStatusLabel
> = {
  [TaskApplicationStatus.Pending]: TaskApplicationStatusLabel.Pending,
  [TaskApplicationStatus.Accept]: TaskApplicationStatusLabel.Accept,
  [TaskApplicationStatus.Decline]: TaskApplicationStatusLabel.Decline,
};
