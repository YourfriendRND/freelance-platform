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

    it('find: should return empty bio and birthday and hide the password', async () => {
      const userRes = await axios.get(`/api/users/${userId}`);

      expect(userRes.status).toBe(200);
      expect(userRes.data).toMatchObject({
        id: userId,
        email,
        firstName: 'E2E',
        bio: null,
        birthday: null,
        rate: null,
      });
      expect(userRes.data).not.toHaveProperty('password');
    });
  });

  describe('update own profile', () => {
    let ownerId: string;
    let ownerCookie: string;
    let otherCookie: string;

    it('join and login: should authorize two users', async () => {
      const owner = await joinAndLogin();
      const other = await joinAndLogin();

      ownerId = owner.userId;
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
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
      });
    });

    it('find and me: should return the updated profile', async () => {
      const profile = await axios.get(`/api/users/${ownerId}`);
      const me = await axios.get('/api/auth/me', {
        headers: { Cookie: ownerCookie },
      });

      expect(profile.status).toBe(200);
      expect(me.status).toBe(200);
      expect(profile.data).toMatchObject({
        firstName: 'Мария',
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
      });
      expect(me.data).toMatchObject({
        firstName: 'Мария',
        bio: 'Делаю интерфейсы',
        birthday: '1994-05-12',
        rate: 2500,
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
