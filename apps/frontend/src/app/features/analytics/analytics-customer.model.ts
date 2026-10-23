import {
  CustomerTaskStats,
  TaskApplicationResponse,
  TaskApplicationStatus,
  TaskResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { formatUserName } from '../../format';
import {
  ANALYTICS_RECENT_APPLICATIONS_LIMIT,
  AnalyticsSummaryCard,
  AnalyticsSummaryIcon,
} from './analytics-freelancer.model';

export const ANALYTICS_RECENT_TASKS_LIMIT = 4;

export type AnalyticsRecentTask = {
  id: string;
  title: string;
  description: string;
  status: TaskResponse['status'];
  applicationsCount: number;
  createdAt: string;
  budgetMin: number;
  budgetMax: number;
};

export type AnalyticsCustomerApplication = {
  id: string;
  taskId: string;
  taskTitle: string;
  performerName: string;
  performerRole: UserRole;
  message: string;
  proposedPrice: number | null;
  timeline: string | null;
};

export function customerSummaryCards(
  stats: CustomerTaskStats,
): readonly AnalyticsSummaryCard[] {
  return [
    {
      label: 'Активные задачи',
      value: String(stats.open),
      icon: AnalyticsSummaryIcon.Orders,
    },
    {
      label: 'Отклики на рассмотрении',
      value: String(stats.pendingApplications),
      icon: AnalyticsSummaryIcon.Pending,
    },
    {
      label: 'Завершенные задачи',
      value: String(stats.closed),
      icon: AnalyticsSummaryIcon.Completed,
    },
    {
      label: 'Черновики',
      value: String(stats.draft),
      icon: AnalyticsSummaryIcon.Draft,
    },
  ];
}

export function selectRecentTasks(
  tasks: readonly TaskResponse[],
  limit = ANALYTICS_RECENT_TASKS_LIMIT,
): readonly AnalyticsRecentTask[] {
  return [...tasks]
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    )
    .slice(0, limit)
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      applicationsCount: task.applicationsCount,
      createdAt: task.createdAt,
      budgetMin: task.budgetMin,
      budgetMax: task.budgetMax,
    }));
}

export function selectCustomerApplications(
  applications: readonly TaskApplicationResponse[],
  limit = ANALYTICS_RECENT_APPLICATIONS_LIMIT,
): readonly AnalyticsCustomerApplication[] {
  return [...applications]
    .filter((application) => application.status === TaskApplicationStatus.Pending)
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    )
    .slice(0, limit)
    .map((application) => ({
      id: application.id,
      taskId: application.taskId,
      taskTitle: '',
      performerName: formatUserName(application.user),
      performerRole: application.user.role,
      message: application.message,
      proposedPrice: application.proposedPrice,
      timeline: application.timeline,
    }));
}
