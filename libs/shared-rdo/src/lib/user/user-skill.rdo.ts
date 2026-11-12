import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserSkillRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор навыка',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Название навыка',
    example: 'typescript',
  })
  name!: string;
}
