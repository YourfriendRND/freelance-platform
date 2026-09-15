import axios from 'axios';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRole } from '@freelance-platform/shared-types';
import { hasSessionCookie, toCookieHeader } from './cookies';

export function uniqueEmail(label: string): string {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function createJoinPayload(
  email: string,
  role: UserRole = UserRole.Client,
): CreateUserDto {
  return {
    email,
    firstName: 'E2E',
    password: 'securePassword123',
    role,
  };
}

export async function joinAndLogin(role: UserRole = UserRole.Client) {
  const email = uniqueEmail(role);
  const payload = createJoinPayload(email, role);
  const joinRes = await axios.post('/api/auth/join', payload);

  expect(joinRes.status).toBe(201);

  const loginRes = await axios.post('/api/auth/login', {
    email,
    password: payload.password,
  });

  expect(loginRes.status).toBe(200);
  expect(hasSessionCookie(loginRes.headers['set-cookie'])).toBe(true);

  return {
    userId: joinRes.data.id as string,
    sessionCookie: toCookieHeader(loginRes.headers['set-cookie']),
  };
}
