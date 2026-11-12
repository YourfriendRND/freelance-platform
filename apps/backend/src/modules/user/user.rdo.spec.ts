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

  it('should expose an empty skill list', () => {
    const profile = new UserEntity({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    profile.skills = [];

    const result = fillRdo(UserRdo, profile);

    expect(result.skills).toEqual([]);
  });

  it('should keep skill order', () => {
    const profile = new UserEntity({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    profile.skills = [
      { id: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101', name: 'nodejs' },
      { id: '2c2a8e14-5d93-4f1b-9b27-2e5d8c01f102', name: 'typescript' },
    ];

    const result = fillRdo(UserRdo, profile);

    expect(result.skills).toEqual(profile.skills);
  });

  it('should omit skills when they were not loaded', () => {
    const result = fillRdo(UserRdo, user);
    const serialized = JSON.parse(JSON.stringify(result)) as Record<string, unknown>;

    expect(result.skills).toBeUndefined();
    expect(serialized).not.toHaveProperty('skills');
  });

  it('should hide the password', () => {
    const result = fillRdo(UserRdo, user);

    expect(result).not.toHaveProperty('password');
  });

  it('should stub avatarUrl as null and verified as true', () => {
    const filledUser = fillRdo(UserRdo, user);
    const emptyUser = fillRdo(
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

    expect(filledUser.avatarUrl).toBeNull();
    expect(filledUser.verified).toBe(true);
    expect(emptyUser.avatarUrl).toBeNull();
    expect(emptyUser.verified).toBe(true);
  });
});
