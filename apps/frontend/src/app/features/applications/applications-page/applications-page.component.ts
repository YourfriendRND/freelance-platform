import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TaskApi, TaskCategoryApi, UserApi } from '@freelance-platform/client-api';
import { TaskApplicationStore } from '@freelance-platform/client-state';
import {
  TaskApplicationResponse,
  TaskApplicationStatus,
  TaskCategoryResponse,
  TaskResponse,
  UserResponse,
} from '@freelance-platform/shared-types';
import { formatUserName } from '../../../format';
import { UiButtonComponent, UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { ApplicationItemComponent } from '../application-item/application-item.component';
import {
  APPLICATIONS_ALL_TAB,
  ApplicationListItem,
  ApplicationsPageView,
  ApplicationsTab,
} from '../applications-list.model';
import { ApplicationsPageContainerComponent } from '../applications-page-container/applications-page-container.component';
import { ApplicationsSummaryComponent } from '../applications-summary/applications-summary.component';
import { ApplicationsToolbarComponent } from '../applications-toolbar/applications-toolbar.component';

const UNKNOWN_CATEGORY_TITLE = 'Без категории';
const PENDING_TASK_TITLE = 'Загрузка';
const PENDING_CLIENT_NAME = 'Загрузка';
const MISSING_TIMELINE_LABEL = '—';

@Component({
  selector: 'app-applications-page',
  imports: [
    UiDashboardWrapperComponent,
    UiButtonComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    ApplicationsPageContainerComponent,
    ApplicationsSummaryComponent,
    ApplicationsToolbarComponent,
    ApplicationItemComponent,
  ],
  templateUrl: './applications-page.component.html',
  styleUrl: './applications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsPageComponent {
  private readonly router = inject(Router);
  private readonly taskApplicationStore = inject(TaskApplicationStore);
  private readonly taskApi = inject(TaskApi);
  private readonly taskCategoryApi = inject(TaskCategoryApi);
  private readonly userApi = inject(UserApi);
  private readonly requestedTaskIds = new Set<string>();
  private readonly requestedUserIds = new Set<string>();

  protected readonly activeTab = signal<ApplicationsTab>(APPLICATIONS_ALL_TAB);
  protected readonly search = signal('');
  private readonly tasksById = signal<ReadonlyMap<string, TaskResponse>>(new Map());
  private readonly usersById = signal<ReadonlyMap<string, UserResponse>>(new Map());
  private readonly categories = signal<readonly TaskCategoryResponse[]>([]);

  protected readonly ApplicationsPageView = ApplicationsPageView;
  protected readonly errorMessage = this.taskApplicationStore.error;

  // TODO: убрать клиентский подсчёт, когда бэкенд начнёт отдавать статистику откликов пользователя
  protected readonly totalCount = computed(
    () => this.taskApplicationStore.applications().length,
  );

  protected readonly pendingCount = computed(
    () =>
      this.taskApplicationStore
        .applications()
        .filter((item) => item.status === TaskApplicationStatus.Pending).length,
  );

  protected readonly acceptedCount = computed(
    () =>
      this.taskApplicationStore
        .applications()
        .filter((item) => item.status === TaskApplicationStatus.Accept).length,
  );

  protected readonly applications = computed<readonly ApplicationListItem[]>(() => {
    const tab = this.activeTab();
    const query = this.search().trim().toLowerCase();
    const tasksById = this.tasksById();
    const usersById = this.usersById();
    const categoryTitleById = new Map(
      this.categories().map(({ id, title }) => [id, title]),
    );

    return this.taskApplicationStore.applications().flatMap((application) => {
      const item = this.toListItem(application, tasksById, usersById, categoryTitleById);
      const matchesTab = tab === APPLICATIONS_ALL_TAB || item.status === tab;

      if (!matchesTab) {
        return [];
      }

      if (!query) {
        return [item];
      }

      const matchesSearch =
        item.taskTitle.toLowerCase().includes(query) ||
        item.clientName.toLowerCase().includes(query);

      return matchesSearch ? [item] : [];
    });
  });

  protected readonly view = computed(() => {
    if (this.taskApplicationStore.isLoading() && this.taskApplicationStore.applications().length === 0) {
      return ApplicationsPageView.Loading;
    }

    if (this.errorMessage() && this.taskApplicationStore.applications().length === 0) {
      return ApplicationsPageView.Error;
    }

    if (
      this.taskApplicationStore.isLoaded() &&
      this.taskApplicationStore.applications().length === 0
    ) {
      return ApplicationsPageView.Empty;
    }

    return ApplicationsPageView.Content;
  });

  constructor() {
    this.taskCategoryApi.findAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.categories.set([]);
      },
    });

    this.taskApplicationStore.load();

    effect(() => {
      this.loadTasks(this.taskApplicationStore.applications());
    });
  }

  protected onTabChange(tab: ApplicationsTab): void {
    this.activeTab.set(tab);
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onFindTasks(): void {
    void this.router.navigateByUrl('/tasks');
  }

  private loadTasks(applications: readonly TaskApplicationResponse[]): void {
    const missingTaskIds = [...new Set(applications.map((item) => item.taskId))].filter(
      (taskId) => !this.requestedTaskIds.has(taskId),
    );

    if (missingTaskIds.length === 0) {
      return;
    }

    missingTaskIds.forEach((taskId) => this.requestedTaskIds.add(taskId));

    forkJoin(
      missingTaskIds.map((taskId) =>
        this.taskApi.findOne(taskId).pipe(
          map((task) => ({ taskId, task })),
          catchError(() => {
            this.requestedTaskIds.delete(taskId);
            return of({ taskId, task: null });
          }),
        ),
      ),
    ).subscribe((results) => {
      const nextTasks = new Map(this.tasksById());

      results.forEach(({ task }) => {
        if (task) {
          nextTasks.set(task.id, task);
        }
      });

      this.tasksById.set(nextTasks);
      this.loadClients(
        results.flatMap(({ task }) => (task ? [task.customerId] : [])),
      );
    });
  }

  // TODO: убрать отдельный запрос пользователя, когда бэкенд начнёт отдавать его вместе с откликом
  private loadClients(customerIds: readonly string[]): void {
    const missingUserIds = [...new Set(customerIds)].filter(
      (userId) => !this.requestedUserIds.has(userId),
    );

    if (missingUserIds.length === 0) {
      return;
    }

    missingUserIds.forEach((userId) => this.requestedUserIds.add(userId));

    forkJoin(
      missingUserIds.map((userId) =>
        this.userApi.findOne(userId).pipe(
          catchError(() => {
            this.requestedUserIds.delete(userId);
            return of(null);
          }),
        ),
      ),
    ).subscribe((users) => {
      const nextUsers = new Map(this.usersById());

      users.forEach((user) => {
        if (user) {
          nextUsers.set(user.id, user);
        }
      });

      this.usersById.set(nextUsers);
    });
  }

  private toListItem(
    application: TaskApplicationResponse,
    tasksById: ReadonlyMap<string, TaskResponse>,
    usersById: ReadonlyMap<string, UserResponse>,
    categoryTitleById: ReadonlyMap<string, string>,
  ): ApplicationListItem {
    const task = tasksById.get(application.taskId);
    const client = task ? usersById.get(task.customerId) : undefined;

    return {
      id: application.id,
      taskTitle: task?.title ?? PENDING_TASK_TITLE,
      status: application.status,
      clientName: client ? formatUserName(client) : PENDING_CLIENT_NAME,
      clientDetails: task
        ? (categoryTitleById.get(task.categoryId) ?? UNKNOWN_CATEGORY_TITLE)
        : '',
      message: application.message,
      proposedPrice: application.proposedPrice,
      timelineLabel: MISSING_TIMELINE_LABEL,
      submittedAt: application.createdAt,
    };
  }
}
