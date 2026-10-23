import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TASK_STATUS_LABEL } from '@freelance-platform/shared-types';
import { formatTaskBudget, formatTaskDate } from '../../../format';
import { AnalyticsRequestStatus } from '../analytics-freelancer.model';
import { AnalyticsRecentTask } from '../analytics-customer.model';

type AnalyticsRecentTaskRow = AnalyticsRecentTask & {
  statusLabel: string;
  dateLabel: string;
  budgetLabel: string;
  applicationsLabel: string;
};

@Component({
  selector: 'app-analytics-recent-tasks',
  imports: [RouterLink],
  templateUrl: './analytics-recent-tasks.component.html',
  styleUrl: './analytics-recent-tasks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsRecentTasksComponent {
  protected readonly AnalyticsRequestStatus = AnalyticsRequestStatus;
  readonly tasks = input.required<readonly AnalyticsRecentTask[]>();
  readonly status = input.required<AnalyticsRequestStatus>();

  protected readonly rows = computed<readonly AnalyticsRecentTaskRow[]>(() =>
    this.tasks().map((task) => ({
      ...task,
      statusLabel: TASK_STATUS_LABEL[task.status],
      dateLabel: `Опубликовано ${formatTaskDate(task.createdAt)}`,
      budgetLabel: formatTaskBudget(task.budgetMin, task.budgetMax),
      applicationsLabel: `${task.applicationsCount} откликов`,
    })),
  );
}
