import { UpdateUserRecord } from '@freelance-platform/shared-types';

export type ProfileEditValue = {
  firstName: string;
  lastName: string;
  bio: string;
  birthday: string;
  rate: string;
};

export function toProfileUpdateRecord(
  value: ProfileEditValue,
  isFreelancer: boolean,
): UpdateUserRecord {
  const record: UpdateUserRecord = {
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim() || null,
    bio: value.bio.trim() || null,
    birthday: value.birthday.trim() || null,
  };

  if (!isFreelancer) {
    return record;
  }

  return {
    ...record,
    rate: parseRate(value.rate),
  };
}

function parseRate(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return Number(trimmed);
}
