import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';

export const OptionalAuthCheck = () => applyDecorators(UseGuards(OptionalAuthGuard));
