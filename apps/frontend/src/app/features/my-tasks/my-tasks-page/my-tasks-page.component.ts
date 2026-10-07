import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskCategoryResponse,
  TaskResponse,
  TaskSort,
} from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TaskItemComponent } from '../../tasks/task-item/task-item.component';
import { TasksFiltersComponent } from '../../tasks/tasks-filters/tasks-filters.component';
import {
  TasksFiltersSelection,
  toPublicTasksQuery,
} from '../../tasks/tasks-filters/tasks-filters.model';
import { TasksPageContainerComponent } from '../../tasks/tasks-page-container/tasks-page-container.component';
import { ApplicationsPageView } from '../../applications/applications-list.model';
import {
  categoryTitleById,
  filterMyTasks,
  hasAppliedFilters,
  isSameTasksQuery,
  toMyTaskListItem,
} from '../my-tasks.model';

@Component({
  selector: 'app-my-tasks-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    TasksPageContainerComponent,
    TasksFiltersComponent,
    TaskItemComponent,
  ],
  templateUrl: './my-tasks-page.component.html',
  styleUrl: './my-tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTasksPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly taskApi = inject(TaskApi);
  private readonly taskCategoryApi = inject(TaskCategoryApi);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;
  private loadedQuery: FindTasksQuery | null = null;

  private readonly filters = signal<TasksFiltersSelection>({ sort: TaskSort.Newest });
  private readonly loadedTasks = signal<readonly TaskResponse[]>([]);
  private readonly loadedCategories = signal<readonly TaskCategoryResponse[]>([]);

  protected readonly isLoading = signal(false);
  protected readonly ApplicationsPageView = ApplicationsPageView;
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly categories = this.loadedCategories;

  // TODO: бэкенд должен добавить запрос списка задач пользователя. Сейчас невозможно получить задачи в раздел «Мои задачи»
  protected readonly ownTasks = computed(() => {
    const userId = this.authStore.user()?.id;
    const titles = categoryTitleById(this.loadedCategories());

    if (!userId) {
      return [];
    }

    return this.loadedTasks()
      .filter((task) => task.customerId === userId)
      .map((task) => toMyTaskListItem(task, titles));
  });

  protected readonly tasks = computed(() => filterMyTasks(this.ownTasks(), this.filters()));

  protected readonly shownCount = computed(() => this.tasks().length);

  protected readonly totalCount = computed(() => this.ownTasks().length);

  protected readonly view = computed(() => {
    if (this.isLoading() && this.loadedTasks().length === 0) {
      return ApplicationsPageView.Loading;
    }

    if (this.errorMessage() && this.loadedTasks().length === 0) {
      return ApplicationsPageView.Error;
    }

    return this.tasks().length === 0 ? ApplicationsPageView.Empty : ApplicationsPageView.Content;
  });

  protected readonly emptyTitle = computed(() =>
    hasAppliedFilters(this.filters())
      ? 'По заданным фильтрам ничего не найдено'
      : 'У вас пока нет задач',
  );

  constructor() {
    this.taskCategoryApi
      .findAll()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (categories) => {
          this.loadedCategories.set(categories);
        },
        error: () => {
          this.loadedCategories.set([]);
        },
      });

    this.loadTasks(this.filters());
  }

  protected onFiltersChange(filters: TasksFiltersSelection): void {
    this.filters.set(filters);
    this.loadTasks(filters);
  }

  private loadTasks(filters: TasksFiltersSelection): void {
    const query: FindTasksQuery = {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      ...toPublicTasksQuery(filters),
    };

    if (this.loadedQuery && isSameTasksQuery(this.loadedQuery, query)) {
      return;
    }

    const request = ++this.requestId;
    this.loadedQuery = query;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskApi
      .findAll(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items }) => {
          if (request !== this.requestId) {
            return;
          }

          this.loadedTasks.set(items);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (request !== this.requestId) {
            return;
          }

          this.isLoading.set(false);
          this.errorMessage.set(
            resolveHttpErrorMessage(error, 'Не удалось загрузить задачи'),
          );
        },
      });
  }
}
