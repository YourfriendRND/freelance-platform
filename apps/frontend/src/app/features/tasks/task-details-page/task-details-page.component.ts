import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskApplicationApi } from '@freelance-platform/client-api';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import { TaskApplicationStatus, TaskViewData } from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { TaskDetailsApplyButtonComponent } from '../task-details-apply-button/task-details-apply-button.component';
import { TaskDetailsApplyFormComponent } from '../task-details-apply-form/task-details-apply-form.component';
import { TaskDetailsAsideComponent } from '../task-details-aside/task-details-aside.component';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { TaskDetailsResponsesComponent } from '../task-details-responses/task-details-responses.component';
import {
  TaskDetailsResponseCard,
  toTaskDetailsResponseCard,
} from '../task-details-responses/task-details-responses.model';
import { TasksPageContainerComponent } from '../tasks-page-container/tasks-page-container.component';
import { ApplicationsPageView } from '../../applications/applications-list.model';

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
    TaskDetailsResponsesComponent,
    TaskDetailsAsideComponent,
    TaskDetailsApplyButtonComponent,
    TaskDetailsApplyFormComponent,
  ],
  templateUrl: './task-details-page.component.html',
  styleUrl: './task-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsPageComponent {
  private readonly taskStore = inject(TaskStore);
  private readonly authStore = inject(AuthStore);
  private readonly taskApplicationApi = inject(TaskApplicationApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private responsesRequestId = 0;

  protected readonly isApplyFormOpen = signal(false);
  protected readonly taskResponses = signal<TaskDetailsResponseCard[]>([]);
  protected readonly responsesLoading = signal(false);
  protected readonly responsesError = signal<string | null>(null);
  protected readonly taskHasApplied = computed(
    () => this.taskStore.selectedTask()?.hasApplied === true,
  );
  protected readonly isOwnTask = computed(() => {
    const userId = this.authStore.user()?.id;
    const customerId = this.taskStore.selectedTask()?.customerId;

    return Boolean(userId && customerId === userId);
  });
  private readonly ownedTaskId = computed(() =>
    this.isOwnTask() ? (this.taskStore.selectedTask()?.id ?? null) : null,
  );

  protected readonly ApplicationsPageView = ApplicationsPageView;
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
      applicationsCount: selectedTask.applicationsCount,
      viewsCount: selectedTask.viewsCount,
      author: selectedTask.author,
    };
  });

  protected readonly view = computed(() => {
    if (this.taskStore.isSelectedLoading()) {
      return ApplicationsPageView.Loading;
    }

    if (this.errorMessage()) {
      return ApplicationsPageView.Error;
    }

    return this.task() ? ApplicationsPageView.Content : ApplicationsPageView.Loading;
  });

  constructor() {
    toObservable(this.ownedTaskId)
      .pipe(takeUntilDestroyed())
      .subscribe((taskId) => this.loadResponses(taskId));

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

  protected onOpenApplyForm(): void {
    this.isApplyFormOpen.set(true);
  }

  protected onCloseApplyForm(): void {
    this.isApplyFormOpen.set(false);
  }

  protected onAcceptResponse(id: string): void {
    this.updateResponse(id, TaskApplicationStatus.Accept);
  }

  protected onDeclineResponse(id: string): void {
    this.updateResponse(id, TaskApplicationStatus.Decline);
  }

  private loadResponses(taskId: string | null): void {
    const request = ++this.responsesRequestId;

    if (!taskId) {
      this.taskResponses.set([]);
      this.responsesLoading.set(false);
      this.responsesError.set(null);
      return;
    }

    this.responsesLoading.set(true);
    this.responsesError.set(null);

    this.taskApplicationApi
      .findAll(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          if (request !== this.responsesRequestId) {
            return;
          }

          this.taskResponses.set(list.items.map(toTaskDetailsResponseCard));
          this.responsesLoading.set(false);
        },
        error: (error: unknown) => {
          if (request !== this.responsesRequestId) {
            return;
          }

          this.taskResponses.set([]);
          this.responsesLoading.set(false);
          this.responsesError.set(
            resolveHttpErrorMessage(error, 'Не удалось загрузить отклики'),
          );
        },
      });
  }

  private updateResponse(id: string, status: TaskApplicationStatus): void {
    const current = this.taskResponses().find((item) => item.id === id);

    if (!current || current.isUpdating) {
      return;
    }

    this.patchResponse(id, { isUpdating: true, error: null });

    this.taskApplicationApi
      .update(id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (application) => {
          this.patchResponse(id, toTaskDetailsResponseCard(application));
        },
        error: (error: unknown) => {
          this.patchResponse(id, {
            isUpdating: false,
            error: resolveHttpErrorMessage(error, 'Не удалось обновить отклик'),
          });
        },
      });
  }

  private patchResponse(id: string, patch: Partial<TaskDetailsResponseCard>): void {
    this.taskResponses.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }
}
