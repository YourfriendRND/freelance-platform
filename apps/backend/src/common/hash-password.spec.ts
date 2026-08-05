import { hashPassword } from './hash-password';
import { verifyPassword } from './verify-password';

describe('hashPassword testing', () => {
  const saltWord = 'test-salt-word';
  const password = 'securePassword123';

  it('should return salt and hash separated by a colon', async () => {
    const passwordHash = await hashPassword(password, saltWord);

    expect(passwordHash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
  });

  it('should produce a hash that verifyPassword accepts', async () => {
    const passwordHash = await hashPassword(password, saltWord);

    await expect(verifyPassword(password, passwordHash, saltWord)).resolves.toBe(
      true,
    );
  });
});
