import { Injectable } from '@nestjs/common';
import { UserSkill } from '@freelance-platform/shared-types';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async findByUserId(userId: string): Promise<UserSkill[]> {
    return this.skillRepository.findByUserId(userId);
  }
}
