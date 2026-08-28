import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import { USER_ROLE_LABEL } from '@freelance-platform/shared-types';
import {
  UiDashboardNavItem,
  UiDashboardSidebarComponent,
  UiDashboardWrapperComponent,
  UiHeaderComponent,
  UiHeaderMode,
} from '@freelance-platform/ui';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskItemData } from '../task-item/task-item.model';
import { TasksFiltersComponent } from '../tasks-filters/tasks-filters.component';
import { TasksPaginationComponent } from '../tasks-pagination/tasks-pagination.component';

type TasksPageView = 'loading' | 'empty' | 'error' | 'list';

const TASKS_PAGE_SIZE = 3;
const UNKNOWN_CATEGORY_TITLE = 'Без категории';

@Component({
  selector: 'app-tasks-page',
  imports: [
    UiHeaderComponent,
    UiDashboardWrapperComponent,
    UiDashboardSidebarComponent,
    TasksPageContainerComponent,
    TaskItemComponent,
    TasksFiltersComponent,
    TasksPaginationComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly taskStore = inject(TaskStore);

  protected readonly currentPage = signal(1);
  protected readonly categories = this.taskStore.categories;
  protected readonly errorMessage = this.taskStore.error;

  protected readonly tasks = computed<readonly TaskItemData[]>(() => {
    const categoryTitleById = this.taskStore.categoryTitleById();

    return this.taskStore.tasks().map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      budgetMin: task.budgetMin,
      budgetMax: task.budgetMax,
      executionType: task.executionType,
      createdAt: task.createdAt,
      categoryTitle:
        categoryTitleById.get(task.categoryId) ?? UNKNOWN_CATEGORY_TITLE,
      // TODO: подставить applicationsCount, viewsCount и author, когда бэкенд начнёт их отдавать
      applicationsCount: 0,
      viewsCount: 0,
      author: null,
    }));
  });

  protected readonly availableCount = computed(() => this.tasks().length);

  protected readonly view = computed<TasksPageView>(() => {
    if (this.taskStore.isLoading()) {
      return 'loading';
    }

    if (this.errorMessage()) {
      return 'error';
    }

    return this.tasks().length === 0 ? 'empty' : 'list';
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.tasks().length / TASKS_PAGE_SIZE)),
  );

  protected readonly pagedTasks = computed(() => {
    const start = (this.currentPage() - 1) * TASKS_PAGE_SIZE;

    return this.tasks().slice(start, start + TASKS_PAGE_SIZE);
  });

  protected readonly sidebarItems: readonly UiDashboardNavItem[] = [
    {
      label: 'Задачи',
      href: '/tasks',
      active: true,
    },
  ];

  protected readonly headerMode = computed(() =>
    this.authStore.isAuthenticated()
      ? UiHeaderMode.Authenticated
      : UiHeaderMode.Guest,
  );

  protected readonly userName = computed(() => {
    const user = this.authStore.user();

    if (!user) {
      return '';
    }

    const { firstName, lastName } = user;

    return [firstName, lastName].filter(Boolean).join(' ');
  });

  protected readonly userRoleLabel = computed(() => {
    const user = this.authStore.user();

    if (!user) {
      return '';
    }

    return USER_ROLE_LABEL[user.role];
  });

  constructor() {
    this.authStore.bootstrap();
    this.taskStore.load();
  }

  protected onLogout(): void {
    this.authStore.logout();
  }

  protected onPageChange(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());

    this.currentPage.set(nextPage);
  }
}
