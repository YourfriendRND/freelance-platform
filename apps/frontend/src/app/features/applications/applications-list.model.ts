import { TaskApplicationStatus } from '@freelance-platform/shared-types';

export enum ApplicationsPageView {
  Loading = 'loading',
  Error = 'error',
  Empty = 'empty',
  Content = 'content',
}

export const APPLICATIONS_ALL_TAB = 'all';

export enum ApplicationsTabLabel {
  All = 'Все',
  Pending = 'На рассмотрении',
  Accept = 'Приняты',
  Decline = 'Отклонены',
}

export type ApplicationsTab = typeof APPLICATIONS_ALL_TAB | TaskApplicationStatus;

export type ApplicationListItem = {
  id: string;
  taskTitle: string;
  status: TaskApplicationStatus;
  clientName: string;
  clientDetails: string;
  message: string;
  proposedPrice: number | null;
  // TODO: срок выполнения, когда бэкенд начнёт его отдавать
  timelineLabel: string;
  submittedAt: string;
};
