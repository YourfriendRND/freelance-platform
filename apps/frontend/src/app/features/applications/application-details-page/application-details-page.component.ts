import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskApplicationStore } from '@freelance-platform/client-state';
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

  protected readonly ApplicationsPageView = ApplicationsPageView;
  protected readonly errorMessage = this.taskApplicationStore.selectedError;

  protected readonly application = computed<ApplicationDetailsView | null>(() => {
    const selected = this.taskApplicationStore.selectedApplication();

    if (!selected) {
      return null;
    }

    const task = selected.task;

    return {
      id: selected.id,
      status: selected.status,
      taskTitle: task?.title ?? MISSING_LABEL,
      submittedAt: selected.createdAt,
      proposedPrice: selected.proposedPrice,
      timelineLabel: selected.timeline?.trim() || MISSING_LABEL,
      taskBudgetLabel: task
        ? formatTaskBudget(task.budgetMin, task.budgetMax)
        : MISSING_LABEL,
      message: selected.message,
      client: {
        name: task ? formatUserName(task.author) : MISSING_LABEL,
        avatarUrl: task?.author.avatarUrl ?? null,
        ratingLabel: task ? formatAuthorRating(task.author) : MISSING_LABEL,
      },
      task: {
        id: task?.id ?? selected.taskId,
        deadlineLabel: task ? formatTaskDate(task.deadline) : MISSING_LABEL,
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

      this.taskApplicationStore.loadById(id);
    });

    this.destroyRef.onDestroy(() => {
      this.taskApplicationStore.clearSelected();
    });
  }
}
