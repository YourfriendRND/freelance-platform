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
  readonly rating = input.required<number>();
  readonly reviewsCount = input.required<number>();

  private readonly router = inject(Router);

  // TODO: Подставить описание профиля, когда бэкенд начнет отдавать bio
  protected readonly bioLabel = 'О себе пока ничего не указано';

  // TODO: Подставить число завершенных заказов, когда появится сущность orders
  protected readonly completedLabel = '0 завершено';

  // TODO: Подставить ставку, когда бэкенд начнет ее отдавать
  protected readonly rateLabel = '0 ₽/час';

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
}
