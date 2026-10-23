import { UserRole } from '@freelance-platform/shared-types';

export type WelcomeHeroAction = {
  label: string;
  route: string;
  variant: 'primary' | 'muted';
};

export function welcomeHeroActions(role: UserRole | null): readonly WelcomeHeroAction[] {
  if (role === UserRole.Freelancer) {
    return [
      {
        label: 'Найти работу',
        route: '/tasks',
        variant: 'muted',
      },
    ];
  }

  if (role === UserRole.Client) {
    return [
      {
        label: 'Опубликовать задачу',
        route: '/tasks/create',
        variant: 'primary',
      },
    ];
  }

  return [
    {
      label: 'Опубликовать задачу',
      route: '/register',
      variant: 'primary',
    },
    {
      label: 'Найти работу',
      route: '/tasks',
      variant: 'muted',
    },
  ];
}
