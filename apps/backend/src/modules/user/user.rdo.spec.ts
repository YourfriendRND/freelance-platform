import { UserRdo } from '@freelance-platform/shared-rdo';
import { UserEntity, UserRole } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';

describe('UserRdo testing', () => {
  const user = new UserEntity({
    id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
    email: 'user@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    password: 'secret-password',
    createdAt: new Date('2026-08-03T00:00:00.000Z'),
    updatedAt: new Date('2026-08-03T00:00:00.000Z'),
    birthday: new Date(1994, 4, 12),
    bio: 'Верстаю интерфейсы',
    rate: 2500,
  });

  it('should keep bio and format birthday as a calendar date', () => {
    const result = fillRdo(UserRdo, user);

    expect(result.bio).toBe('Верстаю интерфейсы');
    expect(result.birthday).toBe('1994-05-12');
    expect(result.rate).toBe(2500);
  });

  it('should return null when bio, birthday and rate are empty', () => {
    const result = fillRdo(
      UserRdo,
      new UserEntity({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );

    expect(result.bio).toBeNull();
    expect(result.birthday).toBeNull();
    expect(result.rate).toBeNull();
  });

  it('should hide the password', () => {
    const result = fillRdo(UserRdo, user);

    expect(result).not.toHaveProperty('password');
  });
});
