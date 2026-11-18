import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  AuthUserPayload,
  SKILL_NAME_MAX_LENGTH,
  USER_SKILL_MAX_COUNT,
  UserEntity,
  UserRole,
} from '@freelance-platform/shared-types';
import { SkillRepository } from './skill.repository';
import { SkillService } from './skill.service';

describe('SkillService testing', () => {
  let repository: {
    findByUserId: ReturnType<typeof vi.fn>;
    findSuggestions: ReturnType<typeof vi.fn>;
    replaceForUser: ReturnType<typeof vi.fn>;
  };
  let service: SkillService;

  const userId = '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2';
  const skill = {
    id: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
    name: 'TypeScript',
  };

  function authUser(role: UserRole): AuthUserPayload {
    return {
      user: new UserEntity({
        id: userId,
        email: 'user@example.com',
        firstName: 'Ivan',
        role,
      }),
      sessionId: 'session-id',
      token: 'token',
    };
  }

  beforeEach(() => {
    repository = {
      findByUserId: vi.fn(),
      findSuggestions: vi.fn(),
      replaceForUser: vi.fn(),
    };
    service = new SkillService(repository as unknown as SkillRepository);
  });

  describe('findSuggestions', () => {
    it('should reject a customer', async () => {
      await expect(
        service.findSuggestions('type', authUser(UserRole.Client)),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.findSuggestions).not.toHaveBeenCalled();
    });

    it('should skip the database for a short query', async () => {
      const result = await service.findSuggestions(' t ', authUser(UserRole.Freelancer));

      expect(result).toEqual([]);
      expect(repository.findSuggestions).not.toHaveBeenCalled();
    });

    it('should search by the trimmed query', async () => {
      repository.findSuggestions.mockResolvedValue([skill]);

      const result = await service.findSuggestions('  type ', authUser(UserRole.Freelancer));

      expect(repository.findSuggestions).toHaveBeenCalledWith('type');
      expect(result).toEqual([skill]);
    });
  });

  describe('replaceForUser', () => {
    it('should reject a customer before writing', async () => {
      await expect(
        service.replaceForUser(userId, ['TypeScript'], UserRole.Client),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.replaceForUser).not.toHaveBeenCalled();
    });

    it('should trim names and collapse case-insensitive duplicates', async () => {
      repository.replaceForUser.mockResolvedValue([skill]);

      await service.replaceForUser(
        userId,
        [' TypeScript ', 'typescript', ' Angular '],
        UserRole.Freelancer,
      );

      expect(repository.replaceForUser).toHaveBeenCalledWith(userId, ['TypeScript', 'Angular']);
    });

    it('should reject an empty name', async () => {
      await expect(
        service.replaceForUser(userId, ['   '], UserRole.Freelancer),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.replaceForUser).not.toHaveBeenCalled();
    });

    it('should reject more skills than the limit', async () => {
      const names = Array.from(
        { length: USER_SKILL_MAX_COUNT + 1 },
        (_, index) => `skill-${index}`,
      );

      await expect(
        service.replaceForUser(userId, names, UserRole.Freelancer),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.replaceForUser).not.toHaveBeenCalled();
    });

    it('should reject a name longer than the limit', async () => {
      const name = 'a'.repeat(SKILL_NAME_MAX_LENGTH + 1);

      await expect(
        service.replaceForUser(userId, [name], UserRole.Freelancer),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.replaceForUser).not.toHaveBeenCalled();
    });

    it('should clear links when the list is empty', async () => {
      repository.replaceForUser.mockResolvedValue([]);

      const result = await service.replaceForUser(userId, [], UserRole.Freelancer);

      expect(repository.replaceForUser).toHaveBeenCalledWith(userId, []);
      expect(result).toEqual([]);
    });
  });
});
