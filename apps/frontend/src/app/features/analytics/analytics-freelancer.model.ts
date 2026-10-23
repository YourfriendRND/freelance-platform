import {
  TaskApplicationResponse,
  TaskApplicationStatsResponse,
  TaskApplicationStatus,
} from '@freelance-platform/shared-types';

export const ANALYTICS_RECENT_APPLICATIONS_LIMIT = 4;

// TODO: Подставить счетчики заказов и доход, когда появится сущность orders
const ORDERS_COUNT_STUB = '0';
const EARNINGS_STUB = '0 ₽';

export enum AnalyticsSummaryIcon {
  Orders = 'orders',
  Pending = 'pending',
  Completed = 'completed',
  Earnings = 'earnings',
  Draft = 'draft',
}

export enum AnalyticsRequestStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

export type AnalyticsSummaryCard = {
  label: string;
  value: string;
  icon: AnalyticsSummaryIcon;
};

export type AnalyticsRecentApplication = {
  id: string;
  taskId: string;
  taskTitle: string;
  status: TaskApplicationStatus;
  createdAt: string;
  proposedPrice: number | null;
};

export function freelancerSummaryCards(
  stats: TaskApplicationStatsResponse,
): readonly AnalyticsSummaryCard[] {
  return [
    {
      label: 'Активные заказы',
      value: ORDERS_COUNT_STUB,
      icon: AnalyticsSummaryIcon.Orders,
    },
    {
      label: 'Отклики на рассмотрении',
      value: String(stats.pending),
      icon: AnalyticsSummaryIcon.Pending,
    },
    {
      label: 'Завершено',
      value: ORDERS_COUNT_STUB,
      icon: AnalyticsSummaryIcon.Completed,
    },
    {
      label: 'Общий доход',
      value: EARNINGS_STUB,
      icon: AnalyticsSummaryIcon.Earnings,
    },
  ];
}

export function selectRecentApplications(
  applications: readonly TaskApplicationResponse[],
  limit = ANALYTICS_RECENT_APPLICATIONS_LIMIT,
): readonly AnalyticsRecentApplication[] {
  return [...applications]
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    )
    .slice(0, limit)
    .map((application) => ({
      id: application.id,
      taskId: application.taskId,
      taskTitle: '',
      status: application.status,
      createdAt: application.createdAt,
      proposedPrice: application.proposedPrice,
    }));
}
