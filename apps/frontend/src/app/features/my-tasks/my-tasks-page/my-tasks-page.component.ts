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
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  FindMyTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskCategoryResponse,
  TaskResponse,
  TaskSort,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { ApplicationsPageView } from '../../applications/applications-list.model';
import { TaskItemComponent } from '../../tasks/task-item/task-item.component';
import { TasksFiltersComponent } from '../../tasks/tasks-filters/tasks-filters.component';
import {
  TasksFiltersSelection,
  toMyTasksQuery,
} from '../../tasks/tasks-filters/tasks-filters.model';
import { TasksPageContainerComponent } from '../../tasks/tasks-page-container/tasks-page-container.component';
import { TasksPaginationComponent } from '../../tasks/tasks-pagination/tasks-pagination.component';
import {
  categoryTitleById,
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
    TasksPaginationComponent,
  ],
  templateUrl: './my-tasks-page.component.html',
  styleUrl: './my-tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTasksPageComponent {
  private readonly taskApi = inject(TaskApi);
  private readonly taskCategoryApi = inject(TaskCategoryApi);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;
  private loadedQuery: FindMyTasksQuery | null = null;

  private readonly filters = signal<TasksFiltersSelection>({ sort: TaskSort.Newest });
  private readonly page = signal(PAGINATION_DEFAULT_PAGE);
  private readonly loadedTasks = signal<readonly TaskResponse[]>([]);
  private readonly loadedCategories = signal<readonly TaskCategoryResponse[]>([]);
  private readonly total = signal(0);

  protected readonly isLoading = signal(false);
  protected readonly ApplicationsPageView = ApplicationsPageView;
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly categories = this.loadedCategories;
  protected readonly currentPage = this.page;

  protected readonly tasks = computed<readonly TaskViewData[]>(() => {
    const titles = categoryTitleById(this.loadedCategories());

    return this.loadedTasks().map((task) => toMyTaskListItem(task, titles));
  });

  protected readonly shownCount = computed(() => this.tasks().length);

  protected readonly totalCount = this.total;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / PAGINATION_DEFAULT_LIMIT)),
  );

  protected readonly view = computed(() => {
    if (this.isLoading()) {
      return ApplicationsPageView.Loading;
    }

    if (this.errorMessage()) {
      return ApplicationsPageView.Error;
    }

    return this.total() === 0 ? ApplicationsPageView.Empty : ApplicationsPageView.Content;
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

    this.loadTasks();
  }

  protected onFiltersChange(filters: TasksFiltersSelection): void {
    const previous = toMyTasksQuery(this.filters());
    const next = toMyTasksQuery(filters);

    this.filters.set(filters);

    if (isSameTasksQuery(previous, next)) {
      return;
    }

    this.page.set(PAGINATION_DEFAULT_PAGE);
    this.loadTasks();
  }

  protected onPageChange(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());

    if (nextPage === this.page()) {
      return;
    }

    this.page.set(nextPage);
    this.loadTasks();
  }

  private loadTasks(): void {
    const filters = this.filters();
    const filtersQuery = toMyTasksQuery(filters);
    const query: FindMyTasksQuery = {
      page: this.page(),
      limit: PAGINATION_DEFAULT_LIMIT,
      ...filtersQuery,
    };

    if (this.loadedQuery && isSameTasksQuery(this.loadedQuery, query)) {
      return;
    }

    const request = ++this.requestId;
    this.loadedQuery = query;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskApi
      .findMine(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total, page }) => {
          if (request !== this.requestId) {
            return;
          }

          this.loadedTasks.set(items);
          this.total.set(total);
          this.page.set(page);
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
