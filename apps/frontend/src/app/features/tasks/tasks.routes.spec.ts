import { tasksRoutes } from './tasks.routes';

describe('tasksRoutes testing', () => {
  it('should register create route before the dynamic id route', () => {
    const createRouteIndex = tasksRoutes.findIndex((route) => route.path === 'create');
    const detailsRouteIndex = tasksRoutes.findIndex((route) => route.path === ':id');

    expect(createRouteIndex).toBeGreaterThan(-1);
    expect(detailsRouteIndex).toBeGreaterThan(-1);
    expect(createRouteIndex).toBeLessThan(detailsRouteIndex);
  });
});
