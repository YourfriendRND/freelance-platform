import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewRdo } from '@freelance-platform/shared-rdo';
import { fillRdo } from '../../common/fill-rdo';
import { ReviewService } from './review.service';

@ApiTags('Отзывы')
@Controller('users')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':userId/reviews')
  @ApiOperation({
    summary: 'Отзывы о пользователе',
    description:
      'Публичный список отзывов о пользователе по его id. Заказчик это или исполнитель, роли не различает. У каждого отзыва есть автор: id, имя и фамилия. Новые отзывы идут первыми',
  })
  @ApiOkResponse({
    description: 'Отзывы о пользователе. Пустой массив, если отзывов нет',
    type: ReviewRdo,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    example: 'Пользователь с "b4252672-a116-41ee-b78c-d694b236db32" не найден',
  })
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<ReviewRdo[]> {
    const reviews = await this.reviewService.findByTargetId(userId);

    return fillRdo(ReviewRdo, reviews);
  }
}
