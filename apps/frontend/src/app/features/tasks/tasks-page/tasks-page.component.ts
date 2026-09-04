import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TaskStore } from '@freelance-platform/client-state';
import { TaskViewData } from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TasksFiltersComponent } from '../tasks-filters/tasks-filters.component';
import { TasksPaginationComponent } from '../tasks-pagination/tasks-pagination.component';

type TasksPageView = 'loading' | 'empty' | 'error' | 'list';

const TASKS_PAGE_SIZE = 3;
const UNKNOWN_CATEGORY_TITLE = 'Без категории';

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

  protected readonly currentPage = signal(1);
  protected readonly categories = this.taskStore.categories;
  protected readonly errorMessage = this.taskStore.error;

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

  constructor() {
    this.taskStore.load();
  }

  protected onPageChange(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());

    this.currentPage.set(nextPage);
  }
}
