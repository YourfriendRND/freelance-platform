import axios from 'axios';
import { createE2eUser, uniqueEmail } from '@freelance-platform/shared-mock';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRole } from '@freelance-platform/shared-types';
import { hasSessionCookie, toCookieHeader } from './cookies';

export { uniqueEmail };

export function createJoinPayload(
  email: string,
  role: UserRole = UserRole.Client,
): CreateUserDto {
  return createE2eUser({ email, role });
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
