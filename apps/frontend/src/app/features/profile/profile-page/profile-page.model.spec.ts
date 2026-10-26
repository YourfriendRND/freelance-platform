import { createMockUserResponse } from '@freelance-platform/shared-mock';
import { UserRole } from '@freelance-platform/shared-types';
import { toProfileCardView } from './profile-page.model';

describe('toProfileCardView testing', () => {
  it('should map profile fields from the user response', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        createdAt: '2026-09-04T10:00:00.000Z',
      }),
    );

    expect(view).toEqual({
      displayName: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      roleLabel: 'Заказчик',
      registrationLabel: 'На платформе с 04.09.2026',
      bio: 'О себе пока ничего не указано',
      birthdayLabel: 'Дата рождения не указана',
      rating: 0,
      reviewsCount: 0,
      isFreelancer: false,
      rateLabel: 'Ставка не указана',
    });
  });

  it('should map a freelancer rate and hide it from a customer', () => {
    const freelancer = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Freelancer,
        rate: 2500,
      }),
    );
    const customer = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Client,
        rate: 2500,
      }),
    );
    const formattedRate = `${new Intl.NumberFormat('ru-RU').format(2500)} ₽/час`;

    expect(freelancer.isFreelancer).toBe(true);
    expect(freelancer.rateLabel).toBe(formattedRate);
    expect(customer.isFreelancer).toBe(false);

    const missingRate = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Freelancer,
        rate: null,
      }),
    );

    expect(missingRate.rateLabel).toBe('Ставка не указана');
  });

  it('should map bio, birthday and rating from the user response', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        bio: '  Ищу исполнителей для своих проектов  ',
        birthday: '1988-07-14',
        rating: 4.8,
        reviewsCount: 24,
      }),
    );

    expect(view.bio).toBe('Ищу исполнителей для своих проектов');
    expect(view.birthdayLabel).toBe('День рождения 14.07.1988');
    expect(view.rating).toBe(4.8);
    expect(view.reviewsCount).toBe(24);
  });

  it('should use fallbacks for an empty name, email, birthday and invalid registration date', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        firstName: '',
        lastName: '',
        email: '',
        bio: '   ',
        birthday: '14.07.1988',
        createdAt: 'invalid-date',
      }),
    );

    expect(view.displayName).toBe('Имя не указано');
    expect(view.email).toBe('Email не указан');
    expect(view.bio).toBe('О себе пока ничего не указано');
    expect(view.birthdayLabel).toBe('Дата рождения не указана');
    expect(view.registrationLabel).toBe('Дата регистрации не указана');
  });
});
