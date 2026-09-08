import { ChangeDetectionStrategy, Component } from '@angular/core';

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
  protected readonly profileStatisticIcon = ProfileStatisticIcon;

  // TODO: Заменить заглушки данными rating, completedProjects и reviews из API профиля
  protected readonly statistics: readonly ProfileStatistic[] = [
    {
      label: 'Средний рейтинг',
      value: '0.0',
      icon: ProfileStatisticIcon.Rating,
    },
    {
      label: 'Завершённые проекты',
      value: '0',
      icon: ProfileStatisticIcon.Projects,
    },
    {
      label: 'Полученные отзывы',
      value: '0',
      icon: ProfileStatisticIcon.Reviews,
    },
  ];
}
