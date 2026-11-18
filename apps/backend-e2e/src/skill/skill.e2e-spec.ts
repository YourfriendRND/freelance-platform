import axios from 'axios';
import { UserRole } from '@freelance-platform/shared-types';
import { joinAndLogin } from '../support/users';

type SkillResponse = {
  id: string;
  name: string;
};

describe('Skill search and profile e2e testing', () => {
  describe('access', () => {
    it('should reject a guest', async () => {
      const response = await axios.get('/api/skills', { params: { query: 'type' } });

      expect(response.status).toBe(401);
      expect(response.data.message).toBe('Пользователь не авторизован. Cookie не найден');
    });

    it('should reject a customer', async () => {
      const { sessionCookie } = await joinAndLogin(UserRole.Client);
      const response = await axios.get('/api/skills', {
        params: { query: 'type' },
        headers: { Cookie: sessionCookie },
      });

      expect(response.status).toBe(403);
      expect(response.data.message).toBe('Искать навыки может только исполнитель');
    });

    it('should return an empty list for a short query', async () => {
      const { sessionCookie } = await joinAndLogin(UserRole.Freelancer);
      const response = await axios.get('/api/skills', {
        params: { query: ' t ' },
        headers: { Cookie: sessionCookie },
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });
  });

  describe('replace and search', () => {
    const stamp = Date.now().toString(36);
    const firstName = `Zp${stamp}Skill`;
    const foldedName = `zp${stamp}skill`;
    const secondName = `Zp${stamp}Other`;

    let freelancerId: string;
    let freelancerCookie: string;
    let clientId: string;
    let clientCookie: string;

    it('should authorize a freelancer and a customer', async () => {
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const client = await joinAndLogin(UserRole.Client);

      freelancerId = freelancer.userId;
      freelancerCookie = freelancer.sessionCookie;
      clientId = client.userId;
      clientCookie = client.sessionCookie;
    });

    it('should replace the set and collapse duplicates', async () => {
      const response = await axios.patch(
        `/api/users/${freelancerId}`,
        { skills: [` ${firstName} `, foldedName, secondName] },
        { headers: { Cookie: freelancerCookie } },
      );

      expect(response.status).toBe(200);
      expect(response.data.skills).toEqual([
        expect.objectContaining({ name: firstName }),
        expect.objectContaining({ name: secondName }),
      ]);
      expect(Object.keys(response.data.skills[0]).sort()).toEqual(['id', 'name']);
    });

    it('should show the same skills in the profile and the session', async () => {
      const profile = await axios.get(`/api/users/${freelancerId}`);
      const me = await axios.get('/api/auth/me', {
        headers: { Cookie: freelancerCookie },
      });

      expect(profile.data.skills.map((skill: SkillResponse) => skill.name)).toEqual([
        firstName,
        secondName,
      ]);
      expect(me.data.skills.map((skill: SkillResponse) => skill.name)).toEqual([
        firstName,
        secondName,
      ]);
    });

    it('should return only the exact skill', async () => {
      const response = await axios.get('/api/skills', {
        params: { query: foldedName },
        headers: { Cookie: freelancerCookie },
      });
      const [skill] = response.data as SkillResponse[];

      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(1);
      expect(skill.name).toBe(firstName);
      expect(Object.keys(skill).sort()).toEqual(['id', 'name']);
    });

    it('should return prefix matches without the exact sibling', async () => {
      const response = await axios.get('/api/skills', {
        params: { query: `${firstName.slice(0, -1)}` },
        headers: { Cookie: freelancerCookie },
      });

      expect(response.status).toBe(200);
      expect(response.data.map((skill: SkillResponse) => skill.name)).toContain(firstName);
      expect(response.data.map((skill: SkillResponse) => skill.name)).not.toContain(secondName);
    });

    it('should replace the previous set', async () => {
      const response = await axios.patch(
        `/api/users/${freelancerId}`,
        { skills: [secondName] },
        { headers: { Cookie: freelancerCookie } },
      );
      const me = await axios.get('/api/auth/me', {
        headers: { Cookie: freelancerCookie },
      });

      expect(response.data.skills.map((skill: SkillResponse) => skill.name)).toEqual([secondName]);
      expect(me.data.skills.map((skill: SkillResponse) => skill.name)).toEqual([secondName]);
    });

    it('should clear skills', async () => {
      const response = await axios.patch(
        `/api/users/${freelancerId}`,
        { skills: [] },
        { headers: { Cookie: freelancerCookie } },
      );

      expect(response.status).toBe(200);
      expect(response.data.skills).toEqual([]);
    });

    it('should reject skills from a customer', async () => {
      const response = await axios.patch(
        `/api/users/${clientId}`,
        { skills: [firstName] },
        { headers: { Cookie: clientCookie } },
      );
      const profile = await axios.get(`/api/users/${clientId}`);

      expect(response.status).toBe(403);
      expect(response.data.message).toBe('Навыки может сохранять только исполнитель');
      expect(profile.data.skills).toEqual([]);
    });
  });
});
