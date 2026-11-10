import {
  createMockTaskApplicationResponse,
  createMockTaskResponse,
  createMockUserResponse,
} from '@freelance-platform/shared-mock';
import { TaskApplicationStatus, TaskStatus } from '@freelance-platform/shared-types';
import {
  getCustomerSummaryCards,
  selectCustomerApplications,
  selectRecentTasks,
} from './analytics-customer.model';
import { AnalyticsSummaryIcon } from './analytics-freelancer.model';

describe('customer analytics model', () => {
  it('should map customer counters without a total applications card', () => {
    expect(
      getCustomerSummaryCards({
        open: 2,
        closed: 1,
        draft: 3,
        pendingApplications: 4,
      }),
    ).toEqual([
      {
        label: 'Активные задачи',
        value: '2',
        icon: AnalyticsSummaryIcon.Orders,
      },
      {
        label: 'Отклики на рассмотрении',
        value: '4',
        icon: AnalyticsSummaryIcon.Pending,
      },
      {
        label: 'Завершенные задачи',
        value: '1',
        icon: AnalyticsSummaryIcon.Completed,
      },
      {
        label: 'Черновики',
        value: '3',
        icon: AnalyticsSummaryIcon.Draft,
      },
    ]);
  });

  it('should keep the four newest tasks', () => {
    const tasks = [1, 2, 3, 4, 5].map((day) =>
      createMockTaskResponse({
        id: `5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c0${day}`,
        createdAt: `2026-09-0${day}T12:00:00.000Z`,
        status: day === 1 ? TaskStatus.Draft : TaskStatus.Open,
      }),
    );

    expect(selectRecentTasks(tasks).map((task) => task.id)).toEqual([
      '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c05',
      '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c04',
      '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c03',
      '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c02',
    ]);
  });

  it('should keep only pending applications', () => {
    const pending = createMockTaskApplicationResponse({
      id: 'b4252672-a116-41ee-b78c-d694b236db01',
      status: TaskApplicationStatus.Pending,
      createdAt: '2026-05-02T12:00:00.000Z',
    });
    const accepted = createMockTaskApplicationResponse({
      id: 'b4252672-a116-41ee-b78c-d694b236db02',
      status: TaskApplicationStatus.Accept,
      createdAt: '2026-05-03T12:00:00.000Z',
    });

    const selected = selectCustomerApplications([accepted, pending]);

    expect(selected.map((item) => item.id)).toEqual([pending.id]);
    expect(selected[0]?.performerName).toBe('Иван Петров');
    expect(selected[0]?.avatarUrl).toBeNull();
    expect(selected[0]?.rating).toBe(0);
    expect(selected[0]?.reviewsCount).toBe(0);
    expect(selected[0]?.performerRole).toBe('freelancer');
    expect(selected[0]?.timeline).toBe('2 недели');
    expect(selected[0]?.taskTitle).toBe('Разработка адаптивного лендинга');
  });

  it('should use a fallback title when the nested task is missing', () => {
    const [selected] = selectCustomerApplications([
      createMockTaskApplicationResponse({ task: undefined }),
    ]);

    expect(selected?.taskTitle).toBe('Без названия');
  });

  it('should keep the performer avatar address', () => {
    const [selected] = selectCustomerApplications([
      createMockTaskApplicationResponse({
        user: createMockUserResponse({
          avatarUrl: 'https://cdn.example/avatar.jpg',
        }),
      }),
    ]);

    expect(selected?.avatarUrl).toBe('https://cdn.example/avatar.jpg');
  });

  it('should keep the performer rating and review count', () => {
    const [selected] = selectCustomerApplications([
      createMockTaskApplicationResponse({
        user: createMockUserResponse({
          rating: 4.8,
          reviewsCount: 12,
        }),
      }),
    ]);

    expect(selected?.rating).toBe(4.8);
    expect(selected?.reviewsCount).toBe(12);
  });
});
