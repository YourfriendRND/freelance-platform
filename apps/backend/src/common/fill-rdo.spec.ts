import { Expose } from 'class-transformer';

import { fillRdo } from './fill-rdo';
import { UserEntity } from '@freelance-platform/shared-types';

class TestRdo {
  @Expose()
  id!: string;

  @Expose()
  email!: string;
}

const testUserEntity = new UserEntity({
  id: 'e78856c8-0d98-44e9-89b0-e2602032c3ed',
  email: 'user@example.com',
  password: 'secret-password',
});

describe('fillRdo testing', () => {
  it('should map exposed fields', () => {
    const result = fillRdo(TestRdo, testUserEntity);

    expect(result).toEqual({
      id: 'e78856c8-0d98-44e9-89b0-e2602032c3ed',
      email: 'user@example.com',
    });
  });

  it('should exclude non-exposed fields', () => {
    const result = fillRdo(TestRdo, testUserEntity);

    expect(result).not.toHaveProperty('password');
  });
});
