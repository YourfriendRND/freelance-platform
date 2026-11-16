import { createMockUserResponse } from '@freelance-platform/shared-mock';
import { UserRole } from '@freelance-platform/shared-types';
import { keepProfileSkills, toProfileCardView } from './profile-page.model';

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
      verified: true,
      avatarUrl: null,
      birthdayLabel: 'Дата рождения не указана',
      rating: 0,
      reviewsCount: 0,
      isFreelancer: false,
      rateLabel: 'Ставка не указана',
      skills: [],
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

  it('should map freelancer skill names in the given order', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Freelancer,
        skills: [
          { id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' },
          { id: 'c5363783-b227-52ff-c89d-e805c347ec43', name: 'Angular' },
        ],
      }),
    );

    expect(view.skills).toEqual(['TypeScript', 'Angular']);
  });

  it('should use an empty skill list when skills are missing', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Freelancer,
      }),
    );

    expect(view.skills).toEqual([]);
  });

  it('should hide skills for a customer', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        role: UserRole.Client,
        skills: [{ id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' }],
      }),
    );

    expect(view.skills).toEqual([]);
  });

  it('should keep loaded skills when the saved profile omits them', () => {
    const previous = createMockUserResponse({
      role: UserRole.Freelancer,
      skills: [{ id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' }],
    });
    const next = createMockUserResponse({
      role: UserRole.Freelancer,
      firstName: 'Мария',
    });

    expect(keepProfileSkills(previous, next).skills).toEqual(previous.skills);
    expect(keepProfileSkills(previous, next).firstName).toBe('Мария');
  });

  it('should prefer skills from the saved profile when they are present', () => {
    const previous = createMockUserResponse({
      skills: [{ id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' }],
    });
    const next = createMockUserResponse({
      skills: [],
    });

    expect(keepProfileSkills(previous, next)).toBe(next);
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

  it('should map the verification flag and trim the avatar address', () => {
    const view = toProfileCardView(
      createMockUserResponse({
        verified: false,
        avatarUrl: ' https://cdn.example/avatar.jpg ',
      }),
    );

    expect(view.verified).toBe(false);
    expect(view.avatarUrl).toBe('https://cdn.example/avatar.jpg');
  });
});
