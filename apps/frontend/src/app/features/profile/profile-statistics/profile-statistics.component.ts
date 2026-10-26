import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

enum ProfileStatisticIcon {
  Rating = 'Rating',
  Projects = 'Projects',
  Reviews = 'Reviews',
}

type ProfileStatisticIconName = keyof typeof ProfileStatisticIcon;

type ProfileStatistic = {
  readonly label: string;
  readonly value: string;
  readonly icon: ProfileStatisticIconName;
};

@Component({
  selector: 'app-profile-statistics',
  templateUrl: './profile-statistics.component.html',
  styleUrl: './profile-statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatisticsComponent {
  readonly rating = input.required<number>();
  readonly reviewsCount = input.required<number>();

  protected readonly profileStatisticIcon = ProfileStatisticIcon;

  protected readonly statistics = computed<readonly ProfileStatistic[]>(() => [
    {
      label: 'Средний рейтинг',
      value: this.rating().toFixed(1),
      icon: ProfileStatisticIcon.Rating,
    },
    {
      label: 'Завершённые проекты',
      value: 'Недоступно',
      icon: ProfileStatisticIcon.Projects,
    },
    {
      label: 'Полученные отзывы',
      value: String(this.reviewsCount()),
      icon: ProfileStatisticIcon.Reviews,
    },
  ]);
}
