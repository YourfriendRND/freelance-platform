import axios from 'axios';
import { joinAndLogin } from '../support/users';

const UNKNOWN_USER_ID = 'b4252672-a116-41ee-b78c-d694b236db32';

describe('Review module e2e testing', () => {
  it('should return an empty list for a user without reviews', async () => {
    const { userId } = await joinAndLogin();
    const response = await axios.get(`/api/users/${userId}/reviews`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });

  it('should return 404 for an unknown user', async () => {
    const response = await axios.get(`/api/users/${UNKNOWN_USER_ID}/reviews`);

    expect(response.status).toBe(404);
    expect(response.data.message).toBe(`Пользователь с "${UNKNOWN_USER_ID}" не найден`);
  });
});
