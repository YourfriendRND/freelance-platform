import axios from 'axios';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRole } from '@freelance-platform/shared-types';

import { hasSessionCookie, toCookieHeader } from '../support/cookies';

function createJoinPayload(email: string): CreateUserDto {
  return {
    email,
    firstName: 'E2E',
    password: 'securePassword123',
    role: UserRole.Client,
  };
}

function uniqueEmail(label: string): string {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

describe('Auth e2e', () => {
  describe('positive: join - login - me - refresh - logout', () => {
    const email = uniqueEmail('happy');
    const payload = createJoinPayload(email);

    let userId: string;
    let sessionCookie: string;

    it('join: should register user without session cookie', async () => {
      const joinRes = await axios.post('/api/auth/join', payload);

      expect(joinRes.status).toBe(201);
      expect(joinRes.data).toMatchObject({
        email,
        firstName: 'E2E',
        role: UserRole.Client,
      });
      expect(joinRes.data).toHaveProperty('id');
      expect(hasSessionCookie(joinRes.headers['set-cookie'])).toBe(false);

      userId = joinRes.data.id;
    });

    it('login: should authorize and set session cookie', async () => {
      const loginRes = await axios.post('/api/auth/login', {
        email,
        password: payload.password,
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.data).toMatchObject({ email, id: userId });
      expect(hasSessionCookie(loginRes.headers['set-cookie'])).toBe(true);

      sessionCookie = toCookieHeader(loginRes.headers['set-cookie']);
    });

    it('me: should return current user by session cookie', async () => {
      const meRes = await axios.get('/api/auth/me', {
        headers: { Cookie: sessionCookie },
      });

      expect(meRes.status).toBe(200);
      expect(meRes.data).toMatchObject({
        email,
        id: userId,
      });
    });

    it('refresh: should rotate session cookie', async () => {
      const refreshRes = await axios.post(
        '/api/auth/refresh',
        {},
        { headers: { Cookie: sessionCookie } },
      );

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.data).toMatchObject({
        email,
        id: userId,
      });
      expect(hasSessionCookie(refreshRes.headers['set-cookie'])).toBe(true);

      sessionCookie = toCookieHeader(refreshRes.headers['set-cookie']);
    });

    it('logout: should clear session', async () => {
      const logoutRes = await axios.post(
        '/api/auth/logout',
        {},
        { headers: { Cookie: sessionCookie } },
      );

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data).toEqual({ message: 'Выход выполнен успешно' });
    });

    it('me after logout: should reject old session cookie', async () => {
      const meAfterLogoutRes = await axios.get('/api/auth/me', {
        headers: { Cookie: sessionCookie },
      });

      expect(meAfterLogoutRes.status).toBe(401);
    });
  });

  describe('negative', () => {
    it('join: should reject duplicate email', async () => {
      const email = uniqueEmail('duplicate');
      const payload = createJoinPayload(email);

      const firstJoinRes = await axios.post('/api/auth/join', payload);
      expect(firstJoinRes.status).toBe(201);

      const secondJoinRes = await axios.post('/api/auth/join', payload);

      expect(secondJoinRes.status).toBe(409);
    });

    it('login: should reject wrong password', async () => {
      const email = uniqueEmail('bad-password');
      const payload = createJoinPayload(email);

      const joinRes = await axios.post('/api/auth/join', payload);
      expect(joinRes.status).toBe(201);

      const loginRes = await axios.post('/api/auth/login', {
        email,
        password: 'wrong-password',
      });

      expect(loginRes.status).toBe(401);
    });

    it('me: should reject request without cookie', async () => {
      const meRes = await axios.get('/api/auth/me');

      expect(meRes.status).toBe(401);
    });
  });
});
