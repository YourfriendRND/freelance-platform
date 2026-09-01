import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import { TaskViewData, USER_ROLE_LABEL } from '@freelance-platform/shared-types';
import {
  UiDashboardNavItem,
  UiDashboardSidebarComponent,
  UiDashboardWrapperComponent,
  UiHeaderComponent,
  UiHeaderMode,
} from '@freelance-platform/ui';
import { TaskDetailsAsideComponent } from '../task-details-aside/task-details-aside.component';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';

type TaskDetailsPageView = 'loading' | 'error' | 'content';

const UNKNOWN_CATEGORY_TITLE = 'Без категории';

@Component({
  selector: 'app-task-details-page',
  imports: [
    RouterLink,
    UiHeaderComponent,
    UiDashboardWrapperComponent,
    UiDashboardSidebarComponent,
    TasksPageContainerComponent,
    TaskDetailsComponent,
    TaskDetailsAsideComponent,
  ],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly taskStore = inject(TaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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

  protected onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/welcome']);
  }
}
