import { UserRole } from '@freelance-platform/shared-types';
import { welcomeHeroActions } from './welcome-hero.model';

describe('welcome hero model', () => {
  it('should show both actions to a guest', () => {
    expect(welcomeHeroActions(null)).toEqual([
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
    ]);
  });

  it('should show only find work to a freelancer', () => {
    expect(welcomeHeroActions(UserRole.Freelancer)).toEqual([
      {
        label: 'Найти работу',
        route: '/tasks',
        variant: 'muted',
      },
    ]);
  });

  it('should show only publish task to a customer', () => {
    expect(welcomeHeroActions(UserRole.Client)).toEqual([
      {
        label: 'Опубликовать задачу',
        route: '/tasks/create',
        variant: 'primary',
      },
    ]);
  });
});
