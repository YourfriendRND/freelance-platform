import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUserPayload, UserEntity, UserRole } from '@freelance-platform/shared-types';

import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService testing', () => {
  const saltWord = 'test-salt-word';
  const authConfiguration = { saltWord } as ConstructorParameters<
    typeof UserService
  >[1];

  let userRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findAuthCredentialsById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let service: UserService;

  const user = new UserEntity({
    id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
    email: 'user@example.com',
    firstName: 'Ivan',
    role: UserRole.Client,
    createdAt: new Date('2026-08-03'),
    updatedAt: new Date('2026-08-03'),
  });

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAuthCredentialsById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    service = new UserService(
      userRepository as unknown as UserRepository,
      authConfiguration,
    );
  });

  it('should create a user with hashed password', async () => {
    userRepository.create.mockResolvedValue(user);

    const result = await service.createUser({
      email: 'user@example.com',
      firstName: 'Ivan',
      password: 'securePassword123',
      role: UserRole.Client,
    });

    expect(result).toBe(user);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        firstName: 'Ivan',
        role: UserRole.Client,
        passwordHash: expect.stringMatching(/^[a-f0-9]+:[a-f0-9]+$/),
      }),
    );
  });

  it('should throw NotFoundException when user is missing', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('update', () => {
    const authUser: AuthUserPayload = {
      user,
      sessionId: 'session-id',
      token: 'token',
    };

    it('should update only provided profile fields', async () => {
      const updated = new UserEntity({ ...user.toObject(), firstName: 'Anna' });
      userRepository.update.mockResolvedValue(updated);

      const result = await service.update(user.id, { firstName: 'Anna' }, authUser);

      expect(result).toBe(updated);
      expect(userRepository.update).toHaveBeenCalledWith(user.id, { firstName: 'Anna' });
    });

    it('should clear bio when it is null', async () => {
      userRepository.update.mockResolvedValue(user);

      await service.update(user.id, { bio: null }, authUser);

      expect(userRepository.update).toHaveBeenCalledWith(user.id, { bio: null });
    });

    it('should reject an update of another user', async () => {
      await expect(
        service.update('other-user-id', { bio: 'Чужой текст' }, authUser),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return the current user without writing an empty patch', async () => {
      userRepository.findById.mockResolvedValue(user);

      const result = await service.update(user.id, {}, authUser);

      expect(result).toBe(user);
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userRepository.findById).toHaveBeenCalledWith(user.id);
    });
  });
});
