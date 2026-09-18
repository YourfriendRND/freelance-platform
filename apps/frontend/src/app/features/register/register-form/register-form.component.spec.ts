import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthApi } from '@freelance-platform/client-api';
import { MOCK_USER_EMAIL, mockClientUserResponse } from '@freelance-platform/shared-mock';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { RegisterFormComponent } from './register-form.component';
import { passwordMatchValidator } from './register-form.validation';

describe('RegisterFormComponent testing', () => {
  let fixture: ComponentFixture<RegisterFormComponent>;
  let join: ReturnType<typeof vi.fn>;

  const user: UserResponse = mockClientUserResponse;

  beforeEach(async () => {
    join = vi.fn().mockReturnValue(of(user));

    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: { join } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
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

  function setSelect(selector: string, value: string): void {
    const select = root().querySelector(selector) as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setCheckbox(selector: string, checked: boolean): void {
    const checkbox = root().querySelector(selector) as HTMLInputElement;
    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillValidForm(): void {
    setSelect('#register-role', UserRole.Client);
    setInput('#register-first-name', user.firstName);
    setInput('#register-email', MOCK_USER_EMAIL);
    setInput('#register-password', 'password1');
    setInput('#register-confirm-password', 'password1');
    setCheckbox('#register-accept-terms', true);
    fixture.detectChanges();
  }

  function submit(): void {
    (root().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('should show validation messages and skip submit when form is invalid', () => {
    submit();

    expect(join).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Выберите тип аккаунта');
    expect(root().textContent).toContain('Обязательное поле');
    expect(root().textContent).toContain('Подтвердите пароль');
    expect(root().querySelector('.ui-checkbox__error')?.textContent?.trim()).toBe(
      'Обязательное поле',
    );
  });

  it('should show a mismatch error when passwords do not match', () => {
    fillValidForm();
    setInput('#register-confirm-password', 'password2');
    fixture.detectChanges();
    submit();

    expect(join).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Пароли не совпадают');
  });

  it('should join without lastName and navigate to /login', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    submit();

    expect(join).toHaveBeenCalledWith({
      role: UserRole.Client,
      firstName: user.firstName,
      email: MOCK_USER_EMAIL,
      password: 'password1',
    });
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should join with lastName when it is filled', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    setInput('#register-last-name', 'Петров');
    fixture.detectChanges();
    submit();

    expect(join).toHaveBeenCalledWith({
      role: UserRole.Client,
      firstName: user.firstName,
      email: MOCK_USER_EMAIL,
      password: 'password1',
      lastName: 'Петров',
    });
  });

  it('should show a submit error when join fails', () => {
    join.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Пользователь уже существует' },
          }),
      ),
    );

    fillValidForm();
    submit();

    expect(join).toHaveBeenCalledTimes(1);
    expect(root().querySelector('.register-form__submit-error')?.textContent).toBe(
      'Пользователь уже существует',
    );
  });

  it('should disable submit while registration is in progress', () => {
    const request = new Subject<UserResponse>();
    const router = TestBed.inject(Router);
    join.mockReturnValue(request.asObservable());
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidForm();
    submit();

    const submitButton = root().querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent?.trim()).toBe('Создание…');

    request.next(user);
    request.complete();
    fixture.detectChanges();

    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent?.trim()).toBe('Создать аккаунт');
  });
});

describe('passwordMatchValidator testing', () => {
  const formBuilder = new FormBuilder();

  function createGroup(password: string, confirmPassword: string) {
    return formBuilder.group(
      {
        password: [password],
        confirmPassword: [confirmPassword],
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword'),
      },
    );
  }

  it('should return null when passwords match', () => {
    expect(createGroup('password1', 'password1').errors).toBeNull();
  });

  it('should return passwordMismatch when passwords differ', () => {
    expect(createGroup('password1', 'password2').errors).toEqual({
      passwordMismatch: true,
    });
  });

  it('should return null when either password is empty', () => {
    expect(createGroup('', 'password1').errors).toBeNull();
    expect(createGroup('password1', '').errors).toBeNull();
  });
});
