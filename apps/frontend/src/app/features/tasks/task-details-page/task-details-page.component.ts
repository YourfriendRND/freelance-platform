import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskStore } from '@freelance-platform/client-state';
import { TaskViewData } from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TaskDetailsAsideComponent } from '../task-details-aside/task-details-aside.component';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';

type TaskDetailsPageView = 'loading' | 'error' | 'content';

const UNKNOWN_CATEGORY_TITLE = 'Без категории';

@Component({
  selector: 'app-task-details-page',
  imports: [
    RouterLink,
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    TasksPageContainerComponent,
    TaskDetailsComponent,
    TaskDetailsAsideComponent,
  ],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsPageComponent {
  private readonly taskStore = inject(TaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = this.taskStore.selectedError;

  protected readonly task = computed<TaskViewData | null>(() => {
    const selectedTask = this.taskStore.selectedTask();

    if (!selectedTask) {
      return null;
    }

    const categoryTitleById = this.taskStore.categoryTitleById();

    return {
      id: selectedTask.id,
      title: selectedTask.title,
      description: selectedTask.description,
      status: selectedTask.status,
      budgetMin: selectedTask.budgetMin,
      budgetMax: selectedTask.budgetMax,
      executionType: selectedTask.executionType,
      deadline: selectedTask.deadline,
      createdAt: selectedTask.createdAt,
      categoryTitle:
        categoryTitleById.get(selectedTask.categoryId) ?? UNKNOWN_CATEGORY_TITLE,
      // TODO: подставить applicationsCount, viewsCount и author, когда бэкенд начнёт их отдавать
      applicationsCount: 0,
      viewsCount: 0,
      author: null,
    };
  });

  protected readonly view = computed<TaskDetailsPageView>(() => {
    if (this.taskStore.isSelectedLoading()) {
      return 'loading';
    }

    if (this.errorMessage()) {
      return 'error';
    }

    return this.task() ? 'content' : 'loading';
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        return;
      }

      this.taskStore.loadById(id);
    });

    this.destroyRef.onDestroy(() => {
      this.taskStore.clearSelected();
    });
  }

}
