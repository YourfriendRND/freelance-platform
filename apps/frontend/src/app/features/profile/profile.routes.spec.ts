import { sessionGuard } from '../../auth/session.guard';
import { profileRoutes } from './profile.routes';

describe('profileRoutes testing', () => {
  it('should protect the profile page with session guard', () => {
    const profileRoute = profileRoutes.find((route) => route.path === '');

    expect(profileRoute?.canActivate).toContain(sessionGuard);
  });
});
