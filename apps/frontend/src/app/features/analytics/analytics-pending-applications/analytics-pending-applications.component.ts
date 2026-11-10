import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { UiButtonComponent } from '@freelance-platform/ui';
import { ratingStars, RatingStar } from '../../../format';
import { AnalyticsRequestStatus } from '../analytics-freelancer.model';
import { AnalyticsCustomerApplication } from '../analytics-customer.model';

type AnalyticsCustomerApplicationRow = AnalyticsCustomerApplication & {
  titleLabel: string;
  avatarAddress: string | null;
  initial: string;
  priceLabel: string;
  timelineLabel: string;
  ratingLabel: string;
  ratingAriaLabel: string;
  stars: readonly RatingStar[];
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
      avatarAddress: this.applicationAvatarUrl(application.avatarUrl),
      initial: this.applicationInitial(application.performerName),
      priceLabel: this.formatProposedPrice(application.proposedPrice),
      timelineLabel: application.timeline?.trim() || '—',
      ratingLabel: this.formatRating(application.rating, application.reviewsCount),
      ratingAriaLabel: this.formatRatingAriaLabel(application.rating, application.reviewsCount),
      stars: ratingStars(application.rating),
    })),
  );

  protected onOpenDetails(applicationId: string): void {
    this.router.navigate(['/applications', applicationId]);
  }

  private applicationAvatarUrl(avatarUrl: string | null): string | null {
    const value = avatarUrl?.trim();

    return value ? value : null;
  }

  private applicationInitial(name: string): string {
    const [firstLetter] = name.trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  }

  private formatRating(rating: number, reviewsCount: number): string {
    return `${rating.toFixed(1)} (${reviewsCount})`;
  }

  private formatRatingAriaLabel(rating: number, reviewsCount: number): string {
    return `Рейтинг: ${rating.toFixed(1)} из 5, ${reviewsCount} отзывов`;
  }

  private formatProposedPrice(proposedPrice: number | null): string {
    if (proposedPrice === null) {
      return '—';
    }

    return `${this.priceFormatter.format(proposedPrice)} ₽`;
  }
}
