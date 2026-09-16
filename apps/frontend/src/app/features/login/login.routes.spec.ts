import { guestGuard } from '../../auth/guest.guard';
import { loginRoutes } from './login.routes';

describe('loginRoutes testing', () => {
  it('should protect login route with guestGuard', () => {
    const loginRoute = loginRoutes.find((route) => route.path === '');

    expect(loginRoute?.canActivate).toContain(guestGuard);
  });
});
