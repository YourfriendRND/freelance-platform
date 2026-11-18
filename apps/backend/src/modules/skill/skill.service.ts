import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  AuthUserPayload,
  SKILL_NAME_MAX_LENGTH,
  SKILL_QUERY_MIN_LENGTH,
  USER_SKILL_MAX_COUNT,
  UserRole,
  UserSkill,
} from '@freelance-platform/shared-types';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async findByUserId(userId: string): Promise<UserSkill[]> {
    return this.skillRepository.findByUserId(userId);
  }

  async replaceForUser(userId: string, names: string[], role: UserRole): Promise<UserSkill[]> {
    if (role !== UserRole.Freelancer) {
      throw new ForbiddenException('Навыки может сохранять только исполнитель');
    }

    return this.skillRepository.replaceForUser(userId, this.normalizeSkillNames(names));
  }

  async findSuggestions(
    query: string | undefined,
    authUser: AuthUserPayload,
  ): Promise<UserSkill[]> {
    const {
      user: { role },
    } = authUser;

    if (role !== UserRole.Freelancer) {
      throw new ForbiddenException('Искать навыки может только исполнитель');
    }

    const normalized = query?.trim() ?? '';

    if (normalized.length < SKILL_QUERY_MIN_LENGTH) {
      return [];
    }

    return this.skillRepository.findSuggestions(normalized);
  }

  private normalizeSkillNames(names: string[]): string[] {
    const uniqueNames: string[] = [];
    const seen = new Set<string>();

    for (const name of names) {
      const trimmed = name.trim();

      if (!trimmed) {
        throw new BadRequestException('Название навыка не может быть пустым');
      }

      if (trimmed.length > SKILL_NAME_MAX_LENGTH) {
        throw new BadRequestException(
          `Название навыка не длиннее ${SKILL_NAME_MAX_LENGTH} символов`,
        );
      }

      const key = trimmed.toLowerCase();

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      uniqueNames.push(trimmed);
    }

    if (uniqueNames.length > USER_SKILL_MAX_COUNT) {
      throw new BadRequestException(`Не больше ${USER_SKILL_MAX_COUNT} навыков`);
    }

    return uniqueNames;
  }
}
