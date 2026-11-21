import axios from 'axios';
import { createJoinPayload, joinAndLogin, uniqueEmail } from '../support/users';

const UNKNOWN_USER_ID = 'b4252672-a116-41ee-b78c-d694b236db32';

describe('User module e2e testing', () => {
  describe('positive: public profile', () => {
    const email = uniqueEmail('user-profile');
    const payload = createJoinPayload(email);

    let userId: string;

    it('join: should register user', async () => {
      const joinRes = await axios.post('/api/auth/join', payload);

      expect(joinRes.status).toBe(201);
      expect(joinRes.data).toHaveProperty('id');

      userId = joinRes.data.id;
    });

    it('find: should return a public profile without email and password', async () => {
      const userRes = await axios.get(`/api/users/${userId}`);

      expect(userRes.status).toBe(200);
      expect(userRes.data).toMatchObject({
        id: userId,
        firstName: 'E2E',
        avatarUrl: null,
        verified: true,
        bio: null,
        birthday: null,
        rate: null,
        skills: [],
      });
      expect(userRes.data).not.toHaveProperty('email');
      expect(userRes.data).not.toHaveProperty('password');
    });
  });

  describe('update own profile', () => {
    let ownerId: string;
    let ownerEmail: string;
    let ownerCookie: string;
    let otherCookie: string;

    it('join and login: should authorize two users', async () => {
      const owner = await joinAndLogin();
      const other = await joinAndLogin();

      ownerId = owner.userId;
      ownerEmail = owner.email;
      ownerCookie = owner.sessionCookie;
      otherCookie = other.sessionCookie;
    });

    it('update: should reject a request without a session', async () => {
      const response = await axios.patch(`/api/users/${ownerId}`, { firstName: 'Мария' });

      expect(response.status).toBe(401);
    });

    it('update: should reject another user', async () => {
      const response = await axios.patch(
        `/api/users/${ownerId}`,
        { bio: 'Чужое описание' },
        { headers: { Cookie: otherCookie } },
      );

      expect(response.status).toBe(403);
      expect(response.data.message).toBe('Изменять профиль может только владелец');
    });

    it('update: should reject a negative rate', async () => {
      const response = await axios.patch(
        `/api/users/${ownerId}`,
        { rate: -1 },
        { headers: { Cookie: ownerCookie } },
      );

      expect(response.status).toBe(400);
    });

    it('update: should change name, bio, birthday and rate', async () => {
      const response = await axios.patch(
        `/api/users/${ownerId}`,
        {
          firstName: 'Мария',
          bio: 'Делаю интерфейсы',
          birthday: '1994-05-12',
          rate: 2500,
        },
        { headers: { Cookie: ownerCookie } },
      );

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: ownerId,
        firstName: 'Мария',
        avatarUrl: null,
        verified: true,
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
      });
      expect(response.data).not.toHaveProperty('skills');
    });

    it('find: should hide email for the owner and for another user', async () => {
      const ownProfile = await axios.get(`/api/users/${ownerId}`, {
        headers: { Cookie: ownerCookie },
      });
      const otherProfile = await axios.get(`/api/users/${ownerId}`, {
        headers: { Cookie: otherCookie },
      });

      expect(ownProfile.status).toBe(200);
      expect(otherProfile.status).toBe(200);
      expect(otherProfile.data).toMatchObject({
        firstName: 'Мария',
        avatarUrl: null,
        verified: true,
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
        skills: [],
      });
      expect(ownProfile.data).not.toHaveProperty('email');
      expect(otherProfile.data).not.toHaveProperty('email');
      expect(otherProfile.data).not.toHaveProperty('password');
    });

    it('me: should reject a request without a session', async () => {
      const response = await axios.get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.data.message).toBe('Пользователь не авторизован. Cookie не найден');
    });

    it('me: should return personal data of the current user', async () => {
      const me = await axios.get('/api/users/me', {
        headers: { Cookie: ownerCookie },
      });
      const session = await axios.get('/api/auth/me', {
        headers: { Cookie: ownerCookie },
      });

      expect(me.status).toBe(200);
      expect(session.status).toBe(200);
      expect(me.data).toMatchObject({
        id: ownerId,
        email: ownerEmail,
        firstName: 'Мария',
        avatarUrl: null,
        verified: true,
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
        skills: [],
      });
      expect(me.data).not.toHaveProperty('password');
      expect(session.data).toMatchObject({
        email: ownerEmail,
        firstName: 'Мария',
        bio: 'Делаю интерфейсы',
      });
    });
  });

  describe('negative', () => {
    it('find: should return 404 for an unknown user', async () => {
      const userRes = await axios.get(`/api/users/${UNKNOWN_USER_ID}`);

      expect(userRes.status).toBe(404);
      expect(userRes.data.message).toBe(
        `Пользователь с "${UNKNOWN_USER_ID}" не найден`,
      );
    });
  });
});
