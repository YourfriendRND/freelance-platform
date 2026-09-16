import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import {
  MOCK_USER_EMAIL,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import { UserResponse } from '@freelance-platform/shared-types';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent testing', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let login: ReturnType<typeof vi.fn>;

  const user: UserResponse = mockClientUserResponse;

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
    emailInput.value = MOCK_USER_EMAIL;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));

    const passwordInput = root.querySelector('#login-password') as HTMLInputElement;
    passwordInput.value = 'password1';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

    fixture.detectChanges();

    (root.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(login).toHaveBeenCalledWith({
      email: MOCK_USER_EMAIL,
      password: 'password1',
    });
    expect(navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
