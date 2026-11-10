import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { UiButtonComponent } from '@freelance-platform/ui';
import { ratingStars } from '../../../format';

@Component({
  selector: 'app-analytics-profile',
  imports: [UiButtonComponent],
  templateUrl: './analytics-profile.component.html',
  styleUrl: './analytics-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsProfileComponent {
  readonly displayName = input.required<string>();
  readonly bio = input<string | null>(null);
  readonly avatarUrl = input<string | null>(null);
  readonly rating = input.required<number>();
  readonly reviewsCount = input.required<number>();
  readonly rate = input<number | null>(null);

  private readonly router = inject(Router);
  private readonly missingBioLabel = 'О себе пока ничего не указано';
  private readonly missingRateLabel = 'Ставка не указана';
  private readonly rateFormatter = new Intl.NumberFormat('ru-RU');

  protected readonly bioLabel = computed(() => {
    const bio = this.bio()?.trim();

    return bio ? bio : this.missingBioLabel;
  });

  protected readonly avatarAddress = computed(() => {
    const avatarUrl = this.avatarUrl()?.trim();

    return avatarUrl ? avatarUrl : null;
  });

  // TODO: Подставить число завершенных заказов, когда появится сущность orders
  protected readonly completedLabel = '0 завершено';

  protected readonly rateLabel = computed(() => this.formatRate(this.rate()));

  // TODO: Подставить навыки, когда бэкенд начнет их отдавать
  protected readonly skillsLabel = 'Навыки не указаны';

  protected readonly initial = computed(() => {
    const [firstLetter] = this.displayName().trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  });

  protected readonly ratingLabel = computed(() => this.rating().toFixed(1));

  protected readonly stars = computed(() => ratingStars(this.rating()));

  protected readonly ratingAriaLabel = computed(
    () => `Рейтинг: ${this.ratingLabel()} из 5, ${this.reviewsCount()} отзывов`,
  );

  protected onEditProfile(): void {
    this.router.navigate(['/profile']);
  }

  private formatRate(rate: number | null): string {
    if (rate === null) {
      return this.missingRateLabel;
    }

    return `${this.rateFormatter.format(rate)} ₽/час`;
  }
}
