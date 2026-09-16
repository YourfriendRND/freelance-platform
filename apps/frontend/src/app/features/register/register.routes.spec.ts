import { guestGuard } from '../../auth/guest.guard';
import { registerRoutes } from './register.routes';

describe('registerRoutes testing', () => {
  it('should protect register route with guestGuard', () => {
    const registerRoute = registerRoutes.find((route) => route.path === '');

    expect(registerRoute?.canActivate).toContain(guestGuard);
  });
});
