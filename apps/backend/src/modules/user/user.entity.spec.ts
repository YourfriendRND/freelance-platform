import { UserEntity, UserRole } from '@freelance-platform/shared-types';

describe('UserEntity rate testing', () => {
  it('should keep a null rate from the database', () => {
    const user = UserEntity.fromDb({
      id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      email: 'user@example.com',
      first_name: 'Ivan',
      role: UserRole.Client,
      rate: null,
    });

    expect(user.rate).toBeNull();
    expect(user.toDb().rate).toBeNull();
    expect(user.toObject().rate).toBeNull();
  });

  it('should keep an hourly rate from the database', () => {
    const user = UserEntity.fromDb({
      rate: 2500,
    });

    expect(user.rate).toBe(2500);
    expect(user.toObject().rate).toBe(2500);
  });
});
