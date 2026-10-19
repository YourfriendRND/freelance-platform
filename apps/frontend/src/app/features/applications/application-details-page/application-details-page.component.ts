import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskApi } from '@freelance-platform/client-api';
import { TaskApplicationStore } from '@freelance-platform/client-state';
import { TaskResponse } from '@freelance-platform/shared-types';
import {
  formatAuthorRating,
  formatTaskBudget,
  formatTaskDate,
  formatUserName,
} from '../../../format';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { ApplicationDetailsView } from '../application-details.model';
import { ApplicationDetailsCardComponent } from '../application-details-card/application-details-card.component';
import { ApplicationDetailsClientComponent } from '../application-details-client/application-details-client.component';
import { ApplicationDetailsOverviewComponent } from '../application-details-overview/application-details-overview.component';
import { ApplicationsPageContainerComponent } from '../applications-page-container/applications-page-container.component';
import { ApplicationsPageView } from '../applications-list.model';

const PENDING_LABEL = 'Загрузка';
const MISSING_LABEL = '—';

@Component({
  selector: 'app-application-details-page',
  imports: [
    RouterLink,
    UiDashboardWrapperComponent,
    DashboardSidebarComponent,
    AppHeaderComponent,
    ApplicationsPageContainerComponent,
    ApplicationDetailsCardComponent,
    ApplicationDetailsClientComponent,
    ApplicationDetailsOverviewComponent,
  ],
  templateUrl: './application-details-page.component.html',
  styleUrl: './application-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskApplicationStore = inject(TaskApplicationStore);
  private readonly taskApi = inject(TaskApi);
  private requestedTaskId: string | null = null;

  private readonly task = signal<TaskResponse | null>(null);
  private readonly taskUnavailable = signal(false);

  protected readonly ApplicationsPageView = ApplicationsPageView;
  protected readonly errorMessage = this.taskApplicationStore.selectedError;

  protected readonly application = computed<ApplicationDetailsView | null>(() => {
    const selected = this.taskApplicationStore.selectedApplication();

    if (!selected) {
      return null;
    }

    const task = this.task();
    const taskUnavailable = this.taskUnavailable();
    const taskLabel = task ? null : taskUnavailable ? MISSING_LABEL : PENDING_LABEL;

    return {
      id: selected.id,
      status: selected.status,
      taskTitle: task?.title ?? taskLabel ?? PENDING_LABEL,
      submittedAt: selected.createdAt,
      proposedPrice: selected.proposedPrice,
      timelineLabel: selected.timeline?.trim() || MISSING_LABEL,
      taskBudgetLabel: task
        ? formatTaskBudget(task.budgetMin, task.budgetMax)
        : (taskLabel ?? MISSING_LABEL),
      message: selected.message,
      client: {
        name: task
          ? formatUserName(task.author)
          : taskUnavailable
            ? MISSING_LABEL
            : PENDING_LABEL,
        ratingLabel: task
          ? formatAuthorRating(task.author)
          : taskUnavailable
            ? MISSING_LABEL
            : PENDING_LABEL,
      },
      task: {
        id: selected.taskId,
        deadlineLabel: task ? formatTaskDate(task.deadline) : (taskLabel ?? MISSING_LABEL),
        executionType: task?.executionType ?? null,
      },
    };
  });

  protected readonly view = computed(() => {
    if (this.taskApplicationStore.isSelectedLoading()) {
      return ApplicationsPageView.Loading;
    }

    if (this.errorMessage()) {
      return ApplicationsPageView.Error;
    }

    return this.application() ? ApplicationsPageView.Content : ApplicationsPageView.Loading;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        return;
      }

      this.task.set(null);
      this.taskUnavailable.set(false);
      this.requestedTaskId = null;
      this.taskApplicationStore.loadById(id);
    });

    effect(() => {
      const selected = this.taskApplicationStore.selectedApplication();

      if (!selected) {
        return;
      }

      this.loadTask(selected.taskId);
    });

    this.destroyRef.onDestroy(() => {
      this.taskApplicationStore.clearSelected();
    });
  }

  private loadTask(taskId: string): void {
    if (this.requestedTaskId === taskId) {
      return;
    }

    this.requestedTaskId = taskId;

    this.taskApi
      .findOne(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          if (this.taskApplicationStore.selectedApplication()?.taskId !== taskId) {
            return;
          }

          this.task.set(task);
        },
        error: () => {
          if (this.taskApplicationStore.selectedApplication()?.taskId !== taskId) {
            return;
          }

          this.taskUnavailable.set(true);
        },
      });
  }
}
