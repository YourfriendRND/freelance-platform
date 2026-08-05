import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_USER_KEY,
  SessionEntity,
  UserEntity,
  UserRole,
} from '@freelance-platform/shared-types';

import { SessionService } from '../../session/session.service';
import { UserService } from '../../user/user.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard testing', () => {
  const appPrefix = 'fp';
  const authConfiguration = { appPrefix } as ConstructorParameters<
    typeof AuthGuard
  >[0];

  let sessionService: {
    findByIdAndToken: ReturnType<typeof vi.fn>;
  };
  let userService: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
  };
  let guard: AuthGuard;

  const user = new UserEntity({
    id: '29d8ee87-6644-42bb-84b4-8054fc8f0fb4',
    email: 'user@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    createdAt: new Date('2026-08-03'),
    updatedAt: new Date('2026-08-03'),
  });

  const session = new SessionEntity({
    id: 'f6e519ad-4eab-4e90-8871-cbaf31738b71',
    userId: '29d8ee87-6644-42bb-84b4-8054fc8f0fb4',
    token: 'token-1',
    refreshAfter: new Date(Date.now() + 60000),
    expiresAt: new Date(Date.now() + 120000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createContext = (
    cookies: Record<string, string>,
  ): { context: ExecutionContext; request: Record<string, unknown> } => {
    const request: Record<string, unknown> = { cookies };

    return {
      request,
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext,
    };
  };

  beforeEach(() => {
    sessionService = {
      findByIdAndToken: vi.fn(),
    };
    userService = {
      findOne: vi.fn(),
    };
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    };

    guard = new AuthGuard(
      authConfiguration,
      sessionService as unknown as SessionService,
      userService as unknown as UserService,
      reflector as unknown as Reflector,
    );
  });

  it('should allow request with valid cookie and attach auth user', async () => {
    sessionService.findByIdAndToken.mockResolvedValue(session);
    userService.findOne.mockResolvedValue(user);

    const { context, request } = createContext({
      [`${appPrefix}_f6e519ad-4eab-4e90-8871-cbaf31738b71`]: 'token-1',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request[AUTH_USER_KEY]).toEqual({
      user,
      sessionId: 'f6e519ad-4eab-4e90-8871-cbaf31738b71',
      token: 'token-1',
    });
  });

  it('should throw when auth cookie is missing', async () => {
    const { context } = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should throw when session is expired', async () => {
    sessionService.findByIdAndToken.mockResolvedValue(
      new SessionEntity({
        ...session.toObject(),
        expiresAt: new Date(Date.now() - 1000),
      }),
    );

    const { context } = createContext({
      [`${appPrefix}_f6e519ad-4eab-4e90-8871-cbaf31738b71`]: 'token-1',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
