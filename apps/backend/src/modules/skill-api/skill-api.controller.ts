import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FindSkillsQueryDto } from '@freelance-platform/shared-dto';
import { UserSkillRdo } from '@freelance-platform/shared-rdo';
import { AuthUserPayload } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';
import { AuthCheck } from '../auth/decorators/auth-check.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkillService } from '../skill/skill.service';

@ApiTags('Навыки')
@Controller('skills')
export class SkillApiController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @AuthCheck()
  @ApiOperation({
    summary: 'Подсказки навыков',
    description:
      'Поиск по началу названия без учета регистра. Доступен только исполнителю. Короче 2 символов возвращает пустой список. Точное совпадение возвращает один навык, иначе до 5 названий',
  })
  @ApiOkResponse({
    description: 'Подходящие навыки',
    type: UserSkillRdo,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Cookie не найден',
      error: 'Unauthorized',
    },
  })
  @ApiForbiddenResponse({
    description: 'Искать навыки может только исполнитель',
    example: {
      statusCode: 403,
      message: 'Искать навыки может только исполнитель',
      error: 'Forbidden',
    },
  })
  async findSuggestions(
    @Query() query: FindSkillsQueryDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<UserSkillRdo[]> {
    const skills = await this.skillService.findSuggestions(query.query, authUser);

    return fillRdo(UserSkillRdo, skills);
  }
}
