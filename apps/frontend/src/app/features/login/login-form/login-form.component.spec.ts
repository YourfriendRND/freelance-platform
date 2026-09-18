import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
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
  let authError: string | null;

  const user: UserResponse = mockClientUserResponse;

  beforeEach(async () => {
    login = vi.fn().mockReturnValue(of(user));
    authError = null;

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            login,
            error: () => authError,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function setInput(selector: string, value: string): void {
    const input = root().querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function fillValidForm(): void {
    setInput('#login-email', MOCK_USER_EMAIL);
    setInput('#login-password', 'password1');
    fixture.detectChanges();
  }

  function submit(): void {
    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('should navigate to /tasks after a successful login', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    submit();

    expect(login).toHaveBeenCalledWith({
      email: MOCK_USER_EMAIL,
      password: 'password1',
    });
    expect(navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should show validation messages and skip submit when form is empty', () => {
    submit();

    expect(login).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Обязательное поле');
  });

  it('should validate email and password', () => {
    setInput('#login-email', 'not-an-email');
    setInput('#login-password', 'short');
    fixture.detectChanges();
    submit();

    expect(login).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Введите корректный email');
    expect(root().textContent).toContain('Минимум 8 символа');
  });

  it('should show a submit error when login fails', () => {
    authError = 'Неверный email или пароль';
    login.mockReturnValue(throwError(() => new Error('login failed')));

    fillValidForm();
    submit();

    expect(login).toHaveBeenCalledTimes(1);
    expect(root().querySelector('.login-form__submit-error')?.textContent).toBe(
      'Неверный email или пароль',
    );
  });

  it('should disable submit while login is in progress', () => {
    const request = new Subject<UserResponse>();
    const router = TestBed.inject(Router);
    login.mockReturnValue(request.asObservable());
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    submit();

    const submitButton = root().querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent?.trim()).toBe('Вход…');

    request.next(user);
    request.complete();
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent?.trim()).toBe('Войти');
  });
});
