export enum TaskExecutionType {
  Remote = 'remote',
  CustomerPlace = 'customer_place',
}

export enum TaskExecutionTypeLabel {
  Remote = 'Удалённо',
  CustomerPlace = 'У заказчика',
}

export const TASK_EXECUTION_TYPE_LABEL: Record<TaskExecutionType, TaskExecutionTypeLabel> = {
  [TaskExecutionType.Remote]: TaskExecutionTypeLabel.Remote,
  [TaskExecutionType.CustomerPlace]: TaskExecutionTypeLabel.CustomerPlace,
};
