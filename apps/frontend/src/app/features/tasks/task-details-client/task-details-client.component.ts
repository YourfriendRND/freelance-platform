import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UserResponse } from '@freelance-platform/shared-types';
import { formatUserName, ratingStars } from '../../../format';

@Component({
  selector: 'app-task-details-client',
  templateUrl: './task-details-client.component.html',
  styleUrl: './task-details-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsClientComponent {
  readonly author = input.required<UserResponse>();

  protected readonly verifiedLabel = 'Подтвержден';

  protected readonly authorName = computed(() => formatUserName(this.author()));

  protected readonly authorAvatarUrl = computed(() => {
    const avatarUrl = this.author().avatarUrl?.trim();

    return avatarUrl ? avatarUrl : null;
  });

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
