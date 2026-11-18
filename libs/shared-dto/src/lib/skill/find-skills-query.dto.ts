import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindSkillsQueryDto {
  @ApiPropertyOptional({
    description: 'Начало названия навыка',
    example: 'type',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
