import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity, UserRole, SessionEntity } from '@freelance-platform/shared-types';

import { hashPassword } from '../../common/hash-password';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService testing', () => {
  const saltWord = 'test-salt-word';
  const appPrefix = 'fp';
  const authConfiguration = {
    saltWord,
    appPrefix,
  } as ConstructorParameters<typeof AuthService>[1];

  let userService: {
    findByEmail: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    findAuthCredentialsById: ReturnType<typeof vi.fn>;
  };
  let sessionService: {
    createUserSession: ReturnType<typeof vi.fn>;
    findByIdAndToken: ReturnType<typeof vi.fn>;
    deleteByIdAndUserId: ReturnType<typeof vi.fn>;
  };
  let service: AuthService;

  const user = new UserEntity({
    id: 'c49a08da-f665-4533-8b4f-ac30b5e4de19',
    email: 'user@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    createdAt: new Date('2026-08-03'),
    updatedAt: new Date('2026-08-03'),
  });

  const session = new SessionEntity({
    id: 'd4dd953b-ac9a-4fe9-b74e-423f396b6a01',
    userId: 'c49a08da-f665-4533-8b4f-ac30b5e4de19',
    token: 'token-1',
    refreshAfter: new Date(Date.now() + 60000),
    expiresAt: new Date(Date.now() + 120000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    userService = {
      findByEmail: vi.fn(),
      createUser: vi.fn(),
      findAuthCredentialsById: vi.fn(),
    };
    sessionService = {
      createUserSession: vi.fn(),
      findByIdAndToken: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    };

    service = new AuthService(
      userService as unknown as UserService,
      authConfiguration,
      sessionService as unknown as SessionService,
    );
  });

  it('should join a new user when email is free', async () => {
    userService.findByEmail.mockRejectedValue(
      new NotFoundException('Пользователь не найден'),
    );
    userService.createUser.mockResolvedValue(user);

    const dto = {
      email: 'user@example.com',
      firstName: 'Ivan',
      password: 'securePassword123',
      role: UserRole.Client,
    };

    await expect(service.joinUser(dto)).resolves.toBe(user);
    expect(userService.createUser).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when email is already registered', async () => {
    userService.findByEmail.mockResolvedValue(user);

    await expect(
      service.joinUser({
        email: 'user@example.com',
        firstName: 'Ivan',
        password: 'securePassword123',
        role: UserRole.Client,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should login with valid credentials and return cookieKey', async () => {
    const passwordHash = await hashPassword('securePassword123', saltWord);

    userService.findByEmail.mockResolvedValue(user);
    userService.findAuthCredentialsById.mockResolvedValue({
      id: user.id,
      passwordHash,
    });
    sessionService.createUserSession.mockResolvedValue(session);

    const result = await service.loginUser({
      email: 'user@example.com',
      password: 'securePassword123',
    });

    expect(result).toEqual({
      user,
      sessionId: session.id,
      token: session.token,
      refreshAfter: session.refreshAfter,
      cookieKey: `${appPrefix}_${session.id}`,
    });
  });

  it('should throw UnauthorizedException for invalid password', async () => {
    const passwordHash = await hashPassword('securePassword123', saltWord);

    userService.findByEmail.mockResolvedValue(user);
    userService.findAuthCredentialsById.mockResolvedValue({
      id: user.id,
      passwordHash,
    });

    await expect(
      service.loginUser({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw NotFoundException when email is unknown', async () => {
    userService.findByEmail.mockRejectedValue(
      new NotFoundException('Пользователь с "not-found-user@example.com" не найден'),
    );

    await expect(
      service.loginUser({
        email: 'not-found-user@example.com',
        password: 'securePassword123',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(userService.findAuthCredentialsById).not.toHaveBeenCalled();
  });
});
