import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { UiButtonComponent } from '@freelance-platform/ui';
import { AnalyticsRequestStatus } from '../analytics-freelancer.model';
import { AnalyticsCustomerApplication } from '../analytics-customer.model';

// TODO: Подставить bio пользователя, когда бэкенд начнет отдавать его в отклике
const PERFORMER_BIO_STUB = 'О себе пока ничего не указано';

type AnalyticsCustomerApplicationRow = AnalyticsCustomerApplication & {
  titleLabel: string;
  initial: string;
  priceLabel: string;
  timelineLabel: string;
  bioLabel: string;
};

@Component({
  selector: 'app-analytics-pending-applications',
  imports: [UiButtonComponent],
  templateUrl: './analytics-pending-applications.component.html',
  styleUrl: './analytics-pending-applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPendingApplicationsComponent {
  protected readonly AnalyticsRequestStatus = AnalyticsRequestStatus;
  readonly applications = input.required<readonly AnalyticsCustomerApplication[]>();
  readonly status = input.required<AnalyticsRequestStatus>();

  private readonly router = inject(Router);
  private readonly priceFormatter = new Intl.NumberFormat('ru-RU');

  protected readonly rows = computed<readonly AnalyticsCustomerApplicationRow[]>(() =>
    this.applications().map((application) => ({
      ...application,
      titleLabel: application.taskTitle || 'Загрузка',
      initial: this.applicationInitial(application.performerName),
      priceLabel: this.formatProposedPrice(application.proposedPrice),
      timelineLabel: application.timeline?.trim() || '—',
      bioLabel: PERFORMER_BIO_STUB,
    })),
  );

  protected onOpenDetails(applicationId: string): void {
    this.router.navigate(['/applications', applicationId]);
  }

  private applicationInitial(name: string): string {
    const [firstLetter] = name.trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  }

  private formatProposedPrice(proposedPrice: number | null): string {
    if (proposedPrice === null) {
      return '—';
    }

    return `${this.priceFormatter.format(proposedPrice)} ₽`;
  }
}
