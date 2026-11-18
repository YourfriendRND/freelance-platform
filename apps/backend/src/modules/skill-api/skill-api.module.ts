import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SkillModule } from '../skill/skill.module';
import { SkillApiController } from './skill-api.controller';

@Module({
  imports: [AuthModule, SkillModule],
  controllers: [SkillApiController],
})
export class SkillApiModule {}
