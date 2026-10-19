import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UserResponse } from '@freelance-platform/shared-types';
import { formatUserName, ratingStars } from '../../../format';

// TODO: подставить описание заказчика, когда бэкенд начнёт отдавать bio
const BIO_STUB = 'О себе пока ничего не указано';

// TODO: подставить признак верификации, когда бэкенд начнёт его отдавать
const VERIFIED_STUB = 'Подтвержден';

@Component({
  selector: 'app-task-details-client',
  templateUrl: './task-details-client.component.html',
  styleUrl: './task-details-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsClientComponent {
  readonly author = input.required<UserResponse>();

  protected readonly bioLabel = BIO_STUB;
  protected readonly verifiedLabel = VERIFIED_STUB;

  protected readonly authorName = computed(() => formatUserName(this.author()));

  // TODO: подставить фото заказчика, когда бэкенд начнёт отдавать avatarUrl
  protected readonly authorInitial = computed(() => {
    const name = this.authorName();

    return name ? name.charAt(0).toUpperCase() : '?';
  });

  protected readonly ratingLabel = computed(
    () => this.author().rating.toFixed(1),
  );

  protected readonly reviewsLabel = computed(() => `(${this.author().reviewsCount})`);

  protected readonly ratingAriaLabel = computed(
    () => `Рейтинг: ${this.ratingLabel()} из 5, ${this.author().reviewsCount} отзывов`,
  );

  protected readonly stars = computed(() => ratingStars(this.author().rating));

  protected readonly memberSinceLabel = computed(() => {
    const year = new Date(this.author().createdAt).getFullYear();

    return `На площадке с ${year}`;
  });
}
