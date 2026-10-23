import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TASK_APPLICATION_STATUS_LABEL } from '@freelance-platform/shared-types';
import { formatTaskDate } from '../../../format';
import {
  AnalyticsRecentApplication,
  AnalyticsRequestStatus,
} from '../analytics-freelancer.model';

type AnalyticsRecentApplicationRow = AnalyticsRecentApplication & {
  titleLabel: string;
  statusLabel: string;
  dateLabel: string;
  priceLabel: string;
};

@Component({
  selector: 'app-analytics-recent-applications',
  imports: [RouterLink],
  templateUrl: './analytics-recent-applications.component.html',
  styleUrl: './analytics-recent-applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsRecentApplicationsComponent {
  protected readonly AnalyticsRequestStatus = AnalyticsRequestStatus;
  readonly applications = input.required<readonly AnalyticsRecentApplication[]>();
  readonly status = input.required<AnalyticsRequestStatus>();

  private readonly priceFormatter = new Intl.NumberFormat('ru-RU');

  protected readonly rows = computed<readonly AnalyticsRecentApplicationRow[]>(() =>
    this.applications().map((application) => ({
      ...application,
      titleLabel: application.taskTitle || 'Загрузка',
      statusLabel: TASK_APPLICATION_STATUS_LABEL[application.status],
      dateLabel: `Отправлен ${formatTaskDate(application.createdAt)}`,
      priceLabel: this.formatProposedPrice(application.proposedPrice),
    })),
  );

  private formatProposedPrice(proposedPrice: number | null): string {
    if (proposedPrice === null) {
      return '—';
    }

    return `${this.priceFormatter.format(proposedPrice)} ₽`;
  }
}
