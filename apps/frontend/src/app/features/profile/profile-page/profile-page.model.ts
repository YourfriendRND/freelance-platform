import {
  readCalendarDate,
  USER_ROLE_LABEL,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { formatTaskDate, formatUserName } from '../../../format';

const MISSING_BIO = 'О себе пока ничего не указано';
const MISSING_BIRTHDAY = 'Дата рождения не указана';
const MISSING_RATE = 'Ставка не указана';
const rateFormatter = new Intl.NumberFormat('ru-RU');

export enum ProfilePageView {
  Loading = 'loading',
  Error = 'error',
  Content = 'content',
}

export type ProfileCardView = {
  readonly displayName: string;
  readonly email: string;
  readonly roleLabel: string;
  readonly registrationLabel: string;
  readonly bio: string;
  readonly birthdayLabel: string;
  readonly rating: number;
  readonly reviewsCount: number;
  readonly isFreelancer: boolean;
  readonly rateLabel: string;
};

export function toProfileCardView(user: UserResponse): ProfileCardView {
  const registrationDate = new Date(user.createdAt);
  const hasValidRegistrationDate = !Number.isNaN(registrationDate.getTime());
  const birthday = formatBirthday(user.birthday);

  return {
    displayName: formatUserName(user) || 'Имя не указано',
    email: user.email || 'Email не указан',
    roleLabel: USER_ROLE_LABEL[user.role],
    registrationLabel: hasValidRegistrationDate
      ? `На платформе с ${formatTaskDate(user.createdAt)}`
      : 'Дата регистрации не указана',
    bio: user.bio?.trim() || MISSING_BIO,
    birthdayLabel: birthday ? `День рождения ${birthday}` : MISSING_BIRTHDAY,
    rating: user.rating,
    reviewsCount: user.reviewsCount,
    isFreelancer: user.role === UserRole.Freelancer,
    rateLabel: formatRate(user.rate),
  };
}

function formatRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) {
    return MISSING_RATE;
  }

  return `${rateFormatter.format(rate)} ₽/час`;
}

function formatBirthday(birthday: string | null | undefined): string | null {
  const date = readCalendarDate(birthday);

  if (!date) {
    return null;
  }

  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');

  return `${day}.${month}.${date.year}`;
}
