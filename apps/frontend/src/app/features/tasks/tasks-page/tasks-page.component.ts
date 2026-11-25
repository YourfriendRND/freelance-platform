import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TaskStore } from '@freelance-platform/client-state';
import {
  FindTasksQuery,
  PAGINATION_DEFAULT_PAGE,
  TaskSort,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TasksFiltersComponent } from '../tasks-filters/tasks-filters.component';
import {
  TasksFiltersSelection,
  toPublicTasksQuery,
} from '../tasks-filters/tasks-filters.model';
import { TasksPaginationComponent } from '../tasks-pagination/tasks-pagination.component';
import {
  isCanonicalTasksListQuery,
  parseTasksListParams,
  TasksListParams,
  TasksListParamsMode,
  toTasksListQueryParams,
} from '../tasks-filters/tasks-list-params';

type TasksPageView = 'loading' | 'empty' | 'error' | 'list';

const UNKNOWN_CATEGORY_TITLE = 'Без категории';
const EMPTY_LIST_TITLE = 'Список задач пуст';
const EMPTY_FILTERS_TITLE = 'По заданным фильтрам ничего не найдено';

function hasAppliedListFilters(query: FindTasksQuery): boolean {
  return (
    query.categoryId !== undefined ||
    query.status !== undefined ||
    query.budgetMin !== undefined ||
    query.budgetMax !== undefined
  );
}

@Component({
  selector: 'app-tasks-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
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
  private readonly taskStore = inject(TaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listParams = signal<TasksListParams>({
    selection: { sort: TaskSort.Newest },
    page: PAGINATION_DEFAULT_PAGE,
  });

  protected readonly filtersSelection = computed(() => this.listParams().selection);

  protected readonly categories = this.taskStore.categories;
  protected readonly errorMessage = this.taskStore.error;
  protected readonly currentPage = this.taskStore.page;

  protected readonly tasks = computed<readonly TaskViewData[]>(() => {
    const categoryTitleById = this.taskStore.categoryTitleById();

    return this.taskStore.tasks().map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      budgetMin: task.budgetMin,
      budgetMax: task.budgetMax,
      executionType: task.executionType,
      deadline: task.deadline,
      createdAt: task.createdAt,
      categoryTitle:
        categoryTitleById.get(task.categoryId) ?? UNKNOWN_CATEGORY_TITLE,
      applicationsCount: task.applicationsCount,
      viewsCount: task.viewsCount,
      author: task.author,
    }));
  });

  protected readonly shownCount = computed(() => this.tasks().length);

  protected readonly totalCount = computed(() => this.taskStore.total());

  protected readonly emptyTitle = computed(() =>
    hasAppliedListFilters(this.taskStore.listQuery())
      ? EMPTY_FILTERS_TITLE
      : EMPTY_LIST_TITLE,
  );

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.taskStore.total() / this.taskStore.limit())),
  );

  protected readonly view = computed<TasksPageView>(() => {
    if (this.taskStore.isLoading()) {
      return 'loading';
    }

    if (this.errorMessage()) {
      return 'error';
    }

    return this.taskStore.total() === 0 ? 'empty' : 'list';
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((paramMap) => {
      this.applyQuery(paramMap);
    });
  }

  protected onPageChange(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());

    if (nextPage === this.listParams().page) {
      return;
    }

    this.replaceListUrl(this.listParams().selection, nextPage);
  }

  protected onFiltersChange(filters: TasksFiltersSelection): void {
    this.replaceListUrl(filters, PAGINATION_DEFAULT_PAGE);
  }

  private applyQuery(paramMap: ParamMap): void {
    const parsed = parseTasksListParams(paramMap, TasksListParamsMode.Public);

    if (!isCanonicalTasksListQuery(paramMap, TasksListParamsMode.Public)) {
      this.replaceListUrl(parsed.selection, parsed.page);
      return;
    }

    this.listParams.set(parsed);
    this.taskStore.load({
      page: parsed.page,
      limit: this.taskStore.limit(),
      ...toPublicTasksQuery(parsed.selection),
    });
  }

  private replaceListUrl(selection: TasksFiltersSelection, page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toTasksListQueryParams({ selection, page }),
      replaceUrl: true,
    });
  }
}
