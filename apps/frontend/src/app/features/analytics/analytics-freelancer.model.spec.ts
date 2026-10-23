import { createMockTaskApplicationResponse } from '@freelance-platform/shared-mock';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';
import {
  AnalyticsSummaryIcon,
  getFreelancerSummaryCards,
  selectRecentApplications,
} from './analytics-freelancer.model';

describe('freelancer analytics model', () => {
  it('should keep order counters at zero until orders exist', () => {
    expect(
      getFreelancerSummaryCards({ total: 12, pending: 1, accepted: 3 }),
    ).toEqual([
      {
        label: 'Активные заказы',
        value: '0',
        icon: AnalyticsSummaryIcon.Orders,
      },
      {
        label: 'Отклики на рассмотрении',
        value: '1',
        icon: AnalyticsSummaryIcon.Pending,
      },
      {
        label: 'Завершено',
        value: '0',
        icon: AnalyticsSummaryIcon.Completed,
      },
      {
        label: 'Общий доход',
        value: '0 ₽',
        icon: AnalyticsSummaryIcon.Earnings,
      },
    ]);
  });

  it('should keep the four newest applications', () => {
    const applications = [1, 2, 3, 4, 5].map((day) =>
      createMockTaskApplicationResponse({
        id: `b4252672-a116-41ee-b78c-d694b236db0${day}`,
        createdAt: `2026-09-0${day}T12:00:00.000Z`,
        status:
          day === 5 ? TaskApplicationStatus.Accept : TaskApplicationStatus.Pending,
      }),
    );

    const recent = selectRecentApplications(applications);

    expect(recent.map((item) => item.id)).toEqual([
      'b4252672-a116-41ee-b78c-d694b236db05',
      'b4252672-a116-41ee-b78c-d694b236db04',
      'b4252672-a116-41ee-b78c-d694b236db03',
      'b4252672-a116-41ee-b78c-d694b236db02',
    ]);
    expect(recent[0]?.taskTitle).toBe('');
    expect(recent[0]?.status).toBe(TaskApplicationStatus.Accept);
  });
});
