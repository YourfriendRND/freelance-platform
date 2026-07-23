import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AUTH_USER_KEY, AuthUserPayload } from '@freelance-platform/shared-types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ [AUTH_USER_KEY]?: AuthUserPayload }>();
    return request[AUTH_USER_KEY] as AuthUserPayload;
  },
);
