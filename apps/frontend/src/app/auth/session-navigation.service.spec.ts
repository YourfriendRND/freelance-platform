import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { SessionNavigationService } from './session-navigation.service';

describe('SessionNavigationService testing', () => {
  let routerEvents: Subject<unknown>;
  let ensureSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    routerEvents = new Subject();
    ensureSession = vi.fn().mockReturnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        SessionNavigationService,
        {
          provide: AuthStore,
          useValue: { ensureSession },
        },
        {
          provide: Router,
          useValue: { events: routerEvents.asObservable() },
        },
      ],
    });
  });

  it('should refresh session on NavigationStart', () => {
    TestBed.inject(SessionNavigationService);

    routerEvents.next(new NavigationStart(1, '/welcome'));

    expect(ensureSession).toHaveBeenCalledTimes(1);
  });

  it('should ignore non-NavigationStart router events', () => {
    TestBed.inject(SessionNavigationService);

    routerEvents.next({ id: 1, type: 'NavigationEnd' });

    expect(ensureSession).not.toHaveBeenCalled();
  });
});
