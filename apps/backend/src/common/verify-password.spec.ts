import { hashPassword } from './hash-password';
import { verifyPassword } from './verify-password';

describe('verifyPassword testing', () => {
  const saltWord = 'test-salt-word';
  const password = 'securePassword123';

  it('should return true for a matching password and hash', async () => {
    const passwordHash = await hashPassword(password, saltWord);

    await expect(verifyPassword(password, passwordHash, saltWord)).resolves.toBe(
      true,
    );
  });

  it('should return false for a wrong password', async () => {
    const passwordHash = await hashPassword(password, saltWord);

    await expect(
      verifyPassword('wrong-password', passwordHash, saltWord),
    ).resolves.toBe(false);
  });

  it('should return false for a malformed password hash', async () => {
    await expect(
      verifyPassword(password, 'not-a-valid-hash', saltWord),
    ).resolves.toBe(false);
  });
});
