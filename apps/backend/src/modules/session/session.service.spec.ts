import { SessionEntity } from '@freelance-platform/shared-types';

import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';

describe('SessionService testing', () => {
  const authConfiguration = {
    refreshAfterSeconds: 60,
    sessionLifetimeSeconds: 120,
  } as ConstructorParameters<typeof SessionService>[1];

  let sessionRepository: {
    createSession: ReturnType<typeof vi.fn>;
    findByIdAndToken: ReturnType<typeof vi.fn>;
    deleteByIdAndUserId: ReturnType<typeof vi.fn>;
  };
  let service: SessionService;

  beforeEach(() => {
    sessionRepository = {
      createSession: vi.fn(),
      findByIdAndToken: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    };

    service = new SessionService(
      sessionRepository as unknown as SessionRepository,
      authConfiguration,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a session with 128-char token and config TTLs', async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const created = new SessionEntity({
      id: '3c38f915-8b09-4358-805f-ed9f5d7e81ca',
      userId: '1b8ab07e-499a-4ff6-a54c-a6a17b869900',
      token: 'a'.repeat(128),
      refreshAfter: new Date(now + (authConfiguration.refreshAfterSeconds * 1000)),
      expiresAt: new Date(now + (authConfiguration.sessionLifetimeSeconds * 1000)),
      createdAt: new Date(now),
      updatedAt: new Date(now),
    });
    sessionRepository.createSession.mockResolvedValue(created);

    const result = await service.createUserSession('1b8ab07e-499a-4ff6-a54c-a6a17b869900');

    expect(result).toBe(created);
    expect(sessionRepository.createSession).toHaveBeenCalledWith({
      userId: '1b8ab07e-499a-4ff6-a54c-a6a17b869900',
      token: expect.stringMatching(/^[a-f0-9]{128}$/),
      refreshAfter: new Date(now + (authConfiguration.refreshAfterSeconds * 1000)),
      expiresAt: new Date(now + (authConfiguration.sessionLifetimeSeconds * 1000)),
    });
  });

  it('should return null when session is not found', async () => {
    sessionRepository.findByIdAndToken.mockResolvedValue(null);

    await expect(
      service.findByIdAndToken('3c38f915-8b09-4358-805f-ed9f5d7e81ca', 'token'),
    ).resolves.toBeNull();
  });
});
