import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TaskApi, TaskApplicationApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import {
  createMockTaskApplicationResponse,
  createMockTaskListResponse,
  createMockTaskResponse,
  createMockUserResponse,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import {
  CustomerTaskStats,
  TaskApplicationListResponse,
  TaskApplicationStatsResponse,
  TaskApplicationStatus,
  TaskResponse,
  TaskSort,
  UserResponse,
} from '@freelance-platform/shared-types';
import { of, throwError } from 'rxjs';
import { findButtonByLabel } from '../../../testing/button-by-label';
import { formatTaskDate } from '../../../format';
import { AnalyticsPageComponent } from './analytics-page.component';

describe('AnalyticsPageComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsPageComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
    logout: ReturnType<typeof vi.fn>;
  };
  let getStats: ReturnType<typeof vi.fn>;
  let findAll: ReturnType<typeof vi.fn>;
  let findOne: ReturnType<typeof vi.fn>;
  let getCustomerStats: ReturnType<typeof vi.fn>;
  let findMine: ReturnType<typeof vi.fn>;

  const client: UserResponse = createMockUserResponse({
    createdAt: '2026-09-04T10:00:00.000Z',
  });

  const freelancer: UserResponse = createMockUserResponse({
    ...mockFreelancerUserResponse,
    firstName: 'Иван',
    lastName: 'Петров',
    rating: 4.9,
    reviewsCount: 87,
  });

  const task: TaskResponse = createMockTaskResponse({
    title: 'Современный интернет-магазин',
  });

  const olderApplication = createMockTaskApplicationResponse({
    id: 'b4252672-a116-41ee-b78c-d694b236db01',
    taskId: task.id,
    createdAt: '2026-05-01T12:00:00.000Z',
    proposedPrice: 1000,
  });

  const newestApplication = createMockTaskApplicationResponse({
    id: 'b4252672-a116-41ee-b78c-d694b236db02',
    taskId: task.id,
    createdAt: '2026-05-28T12:00:00.000Z',
    proposedPrice: 2800,
  });

  const acceptedApplication = createMockTaskApplicationResponse({
    id: 'b4252672-a116-41ee-b78c-d694b236db03',
    taskId: task.id,
    status: TaskApplicationStatus.Accept,
    createdAt: '2026-06-01T12:00:00.000Z',
    message: 'Этот отклик уже принят',
  });

  const stats: TaskApplicationStatsResponse = {
    total: 12,
    pending: 1,
    accepted: 3,
  };

  const customerStats: CustomerTaskStats = {
    open: 2,
    closed: 1,
    draft: 1,
    pendingApplications: 4,
  };

  async function setup(user: UserResponse): Promise<void> {
    authStore = {
      isAuthenticated: signal(true),
      user: signal<UserResponse | null>(user),
      logout: vi.fn(),
    };
    getStats = vi.fn(() => of(stats));
    findAll = vi.fn(() =>
      of<TaskApplicationListResponse>({
        items: [olderApplication, newestApplication, acceptedApplication],
      }),
    );
    findOne = vi.fn(() => of(task));
    getCustomerStats = vi.fn(() => of(customerStats));
    findMine = vi.fn(() => of(createMockTaskListResponse({ items: [task], total: 1 })));

    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: TaskApplicationApi,
          useValue: { getStats, findAll },
        },
        { provide: TaskApi, useValue: { findOne, getCustomerStats, findMine } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();
  }

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  describe('client', () => {
    beforeEach(async () => {
      await setup(client);
    });

    it('should render a personalized greeting and create button', () => {
      expect(root().textContent).toContain('С возвращением, Иван Петров!');
      expect(root().textContent).toContain('Вот что происходит с вашими задачами');
      expect(root().textContent).toContain('Новая задача');
      expect(root().textContent).not.toContain('Данных нет');
    });

    it('should navigate to task create page from the create button', () => {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      findButtonByLabel(root(), 'Новая задача').click();

      expect(navigate).toHaveBeenCalledWith(['/tasks/create']);
    });

    it('should render analytics and tasks sidebar items', () => {
      expect(root().textContent).toContain('Аналитика');
      expect(root().textContent).toContain('Задачи');
    });

    it('should render customer counters, recent tasks and only pending applications', () => {
      const summaryValues = Array.from(
        root().querySelectorAll('.analytics-summary__value'),
        (element) => element.textContent?.trim(),
      );
      const text = root().textContent ?? '';
      const tasksLink = root().querySelector('app-analytics-recent-tasks a[href="/my-tasks"]');
      const pendingViewAll = root().querySelector(
        'app-analytics-pending-applications .analytics-panel__action',
      );

      expect(summaryValues).toEqual(['2', '4', '1', '1']);
      expect(text).toContain('Активные задачи');
      expect(text).toContain('Черновики');
      expect(text).not.toContain('Всего откликов');
      expect(text).not.toContain('Ваш профиль');
      expect(text).toContain('Современный интернет-магазин');
      expect(text).toContain('Опубликовано');
      expect(text).toContain('О себе пока ничего не указано');
      expect(text).not.toContain('Готов выполнить задачу в указанные сроки и рассказать о подходе');
      expect(text).toContain('2 недели');
      expect(text).toContain('Смотреть детали');
      expect(text).not.toContain('Принять');
      expect(text).not.toContain('Этот отклик уже принят');
      expect(root().querySelector('app-analytics-pending-applications a')).toBeNull();
      expect(tasksLink?.textContent?.trim()).toBe('Смотреть все');
      expect(pendingViewAll?.hasAttribute('disabled')).toBe(true);
      expect(getStats).not.toHaveBeenCalled();
      expect(getCustomerStats).toHaveBeenCalled();
      expect(findMine).toHaveBeenCalledWith({
        page: 1,
        limit: 4,
        sort: TaskSort.Newest,
      });
    });

    it('should open the application card from the details button', () => {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const applications = root().querySelector('app-analytics-pending-applications');

      findButtonByLabel(applications as ParentNode, 'Смотреть детали').click();

      expect(navigate).toHaveBeenCalledWith(['/applications', newestApplication.id]);
    });
  });

  describe('freelancer', () => {
    beforeEach(async () => {
      await setup(freelancer);
    });

    it('should render freelancer counters, profile and the newest response', () => {
      const text = root().textContent ?? '';
      const summaryValues = Array.from(
        root().querySelectorAll('.analytics-summary__value'),
        (element) => element.textContent?.trim(),
      );

      expect(text).toContain('Обзор вашей активности');
      expect(text).toContain('Смотреть задачи');
      expect(summaryValues).toEqual(['0', '1', '0', '0 ₽']);
      expect(text).toContain('Ваш профиль');
      expect(text).toContain('4.9');
      expect(text).toContain('(87)');
      expect(text).toContain('Современный интернет-магазин');
      expect(text).toContain(`Отправлен ${formatTaskDate(newestApplication.createdAt)}`);
      expect(text).toContain('На рассмотрении');
      expect(root().querySelector('.analytics-panel__item-title')?.textContent).toContain(
        'Современный интернет-магазин',
      );
      const viewAll = root().querySelector('app-analytics-active-orders button');

      expect(viewAll?.textContent?.trim()).toBe('Смотреть все');
      expect(viewAll?.hasAttribute('disabled')).toBe(true);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith(task.id);
      expect(getCustomerStats).not.toHaveBeenCalled();
      expect(findMine).not.toHaveBeenCalled();
    });

    it('should navigate to the task list from the header button', () => {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      findButtonByLabel(root(), 'Смотреть задачи').click();

      expect(navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should show an error when stats request fails', () => {
      getStats.mockReturnValue(throwError(() => new Error('fail')));

      fixture.destroy();
      fixture = TestBed.createComponent(AnalyticsPageComponent);
      fixture.detectChanges();

      expect(root().textContent).toContain('Не удалось загрузить аналитику');
      expect(root().querySelector('app-analytics-summary')).toBeNull();
    });
  });
});
