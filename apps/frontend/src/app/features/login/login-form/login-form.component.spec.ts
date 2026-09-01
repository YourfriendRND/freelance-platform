import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent testing', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let login: ReturnType<typeof vi.fn>;

  const user: UserResponse = {
    id: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    login = vi.fn().mockReturnValue(of(user));

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            login,
            error: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();
  });

  it('should navigate to /tasks after a successful login', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const root = fixture.nativeElement as HTMLElement;

    const emailInput = root.querySelector('#login-email') as HTMLInputElement;
    emailInput.value = 'ivan.petrov@example.com';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));

    const passwordInput = root.querySelector('#login-password') as HTMLInputElement;
    passwordInput.value = 'password1';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

    fixture.detectChanges();

    (root.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(login).toHaveBeenCalledWith({
      email: 'ivan.petrov@example.com',
      password: 'password1',
    });
    expect(navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
