import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  TASK_APPLICATION_STATUS_LABEL,
  TaskApplicationStatus,
} from '@freelance-platform/shared-types';

import { ratingStars } from '../../../format';
import { TaskDetailsResponseCard } from './task-details-responses.model';

@Component({
  selector: 'app-task-details-responses',
  templateUrl: './task-details-responses.component.html',
  styleUrl: './task-details-responses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsResponsesComponent {
  private readonly priceFormatter = new Intl.NumberFormat('ru-RU');

  readonly applicationsCount = input(0);
  readonly responses = input<TaskDetailsResponseCard[]>([]);
  readonly loadError = input<string | null>(null);
  readonly isLoading = input(false);

  readonly accept = output<string>();
  readonly decline = output<string>();

  protected priceLabel(price: number | null): string {
    return price === null ? '—' : `${this.priceFormatter.format(price)} ₽`;
  }

  protected timelineLabel(timeline: string | null): string {
    const value = timeline?.trim();

    return value ? value : '—';
  }

  // TODO: подставить фото исполнителя, когда бэкенд начнёт отдавать avatarUrl
  protected performerInitial(name: string): string {
    const [firstLetter] = name.trim();

    return firstLetter ? firstLetter.toUpperCase() : '?';
  }

  protected ratingLabel(rating: number, reviewsCount: number): string {
    return `${rating.toFixed(1)} (${reviewsCount})`;
  }

  protected ratingAriaLabel(rating: number, reviewsCount: number): string {
    return `Рейтинг: ${rating.toFixed(1)} из 5, ${reviewsCount} отзывов`;
  }

  protected isPending(status: TaskApplicationStatus): boolean {
    return status === TaskApplicationStatus.Pending;
  }

  protected statusLabel(status: TaskApplicationStatus): string {
    return TASK_APPLICATION_STATUS_LABEL[status];
  }

  protected readonly stars = ratingStars;
}
