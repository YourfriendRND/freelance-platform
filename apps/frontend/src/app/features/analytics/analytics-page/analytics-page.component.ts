import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TaskApi, TaskApplicationApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { TaskSort, UserRole } from '@freelance-platform/shared-types';
import { catchError, forkJoin, map, of } from 'rxjs';
import { formatUserName } from '../../../format';
import { UiButtonComponent, UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { AnalyticsActiveOrdersComponent } from '../analytics-active-orders/analytics-active-orders.component';
import {
  ANALYTICS_RECENT_TASKS_LIMIT,
  AnalyticsCustomerApplication,
  AnalyticsRecentTask,
  customerSummaryCards,
  selectCustomerApplications,
  selectRecentTasks,
} from '../analytics-customer.model';
import {
  AnalyticsRecentApplication,
  AnalyticsRequestStatus,
  AnalyticsSummaryCard,
  freelancerSummaryCards,
  selectRecentApplications,
} from '../analytics-freelancer.model';
import { AnalyticsPageContainerComponent } from '../analytics-page-container/analytics-page-container.component';
import { AnalyticsPendingApplicationsComponent } from '../analytics-pending-applications/analytics-pending-applications.component';
import { AnalyticsProfileComponent } from '../analytics-profile/analytics-profile.component';
import { AnalyticsRecentApplicationsComponent } from '../analytics-recent-applications/analytics-recent-applications.component';
import { AnalyticsRecentTasksComponent } from '../analytics-recent-tasks/analytics-recent-tasks.component';
import { AnalyticsSummaryComponent } from '../analytics-summary/analytics-summary.component';

@Component({
  selector: 'app-analytics-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    UiButtonComponent,
    AnalyticsPageContainerComponent,
    AnalyticsSummaryComponent,
    AnalyticsProfileComponent,
    AnalyticsActiveOrdersComponent,
    AnalyticsRecentApplicationsComponent,
    AnalyticsRecentTasksComponent,
    AnalyticsPendingApplicationsComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskApi = inject(TaskApi);
  private readonly taskApplicationApi = inject(TaskApplicationApi);

  protected readonly AnalyticsRequestStatus = AnalyticsRequestStatus;
  protected readonly summaryCards = signal<readonly AnalyticsSummaryCard[]>([]);
  protected readonly statsStatus = signal<AnalyticsRequestStatus>(AnalyticsRequestStatus.Idle);
  protected readonly recentApplications = signal<readonly AnalyticsRecentApplication[]>([]);
  protected readonly applicationsStatus = signal<AnalyticsRequestStatus>(AnalyticsRequestStatus.Idle);
  protected readonly recentTasks = signal<readonly AnalyticsRecentTask[]>([]);
  protected readonly tasksStatus = signal<AnalyticsRequestStatus>(AnalyticsRequestStatus.Idle);
  protected readonly pendingApplications = signal<readonly AnalyticsCustomerApplication[]>([]);
  protected readonly pendingStatus = signal<AnalyticsRequestStatus>(AnalyticsRequestStatus.Idle);

  protected readonly userName = computed(() => {
    const user = this.authStore.user();

    return user ? formatUserName(user) : '';
  });

  protected readonly greeting = computed(() => {
    const name = this.userName();

    return name ? `С возвращением, ${name}!` : 'С возвращением!';
  });

  protected readonly isFreelancer = computed(
    () => this.authStore.user()?.role === UserRole.Freelancer,
  );

  protected readonly isCustomer = computed(
    () => this.authStore.user()?.role === UserRole.Client,
  );

  protected readonly subtitle = computed(() =>
    this.isFreelancer()
      ? 'Обзор вашей активности'
      : 'Вот что происходит с вашими задачами',
  );

  protected readonly headerActionLabel = computed(() =>
    this.isFreelancer() ? 'Смотреть задачи' : 'Новая задача',
  );

  protected readonly rating = computed(() => this.authStore.user()?.rating ?? 0);

  protected readonly reviewsCount = computed(
    () => this.authStore.user()?.reviewsCount ?? 0,
  );

  constructor() {
    const role = this.authStore.user()?.role;

    if (role === UserRole.Freelancer) {
      this.loadFreelancerAnalytics();
    }

    if (role === UserRole.Client) {
      this.loadCustomerAnalytics();
    }
  }

  protected onHeaderAction(): void {
    this.router.navigate([this.isFreelancer() ? '/tasks' : '/tasks/create']);
  }

  private loadFreelancerAnalytics(): void {
    this.statsStatus.set(AnalyticsRequestStatus.Loading);
    this.applicationsStatus.set(AnalyticsRequestStatus.Loading);

    this.taskApplicationApi
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.summaryCards.set(freelancerSummaryCards(stats));
          this.statsStatus.set(AnalyticsRequestStatus.Ready);
        },
        error: () => {
          this.summaryCards.set([]);
          this.statsStatus.set(AnalyticsRequestStatus.Error);
        },
      });

    this.taskApplicationApi
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const recent = selectRecentApplications(list.items);

          this.recentApplications.set(recent);
          this.applicationsStatus.set(AnalyticsRequestStatus.Ready);
          this.loadTaskTitles(recent, (titleByTaskId) => {
            this.recentApplications.update((items) =>
              items.map((item) => ({
                ...item,
                taskTitle: titleByTaskId.get(item.taskId) ?? item.taskTitle,
              })),
            );
          });
        },
        error: () => {
          this.recentApplications.set([]);
          this.applicationsStatus.set(AnalyticsRequestStatus.Error);
        },
      });
  }

  private loadCustomerAnalytics(): void {
    this.statsStatus.set(AnalyticsRequestStatus.Loading);
    this.tasksStatus.set(AnalyticsRequestStatus.Loading);
    this.pendingStatus.set(AnalyticsRequestStatus.Loading);

    this.taskApi
      .getCustomerStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.summaryCards.set(customerSummaryCards(stats));
          this.statsStatus.set(AnalyticsRequestStatus.Ready);
        },
        error: () => {
          this.summaryCards.set([]);
          this.statsStatus.set(AnalyticsRequestStatus.Error);
        },
      });

    this.taskApi
      .findMine({
        page: 1,
        limit: ANALYTICS_RECENT_TASKS_LIMIT,
        sort: TaskSort.Newest,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.recentTasks.set(selectRecentTasks(list.items));
          this.tasksStatus.set(AnalyticsRequestStatus.Ready);
        },
        error: () => {
          this.recentTasks.set([]);
          this.tasksStatus.set(AnalyticsRequestStatus.Error);
        },
      });

    this.taskApplicationApi
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const pending = selectCustomerApplications(list.items);

          this.pendingApplications.set(pending);
          this.pendingStatus.set(AnalyticsRequestStatus.Ready);
          this.loadTaskTitles(pending, (titleByTaskId) => {
            this.pendingApplications.update((items) =>
              items.map((item) => ({
                ...item,
                taskTitle: titleByTaskId.get(item.taskId) ?? item.taskTitle,
              })),
            );
          });
        },
        error: () => {
          this.pendingApplications.set([]);
          this.pendingStatus.set(AnalyticsRequestStatus.Error);
        },
      });
  }

  private loadTaskTitles(
    applications: readonly { taskId: string }[],
    applyTitles: (titleByTaskId: ReadonlyMap<string, string>) => void,
  ): void {
    const taskIds = [...new Set(applications.map((item) => item.taskId))];

    if (taskIds.length === 0) {
      return;
    }

    forkJoin(
      taskIds.map((taskId) =>
        this.taskApi.findOne(taskId).pipe(
          map((task) => ({ taskId, title: task.title })),
          // TODO: Название задачи приходит отдельным запросом и может не загрузиться
          catchError(() => of({ taskId, title: 'Без названия' })),
        ),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        applyTitles(new Map(results.map((result) => [result.taskId, result.title])));
      });
  }
}
