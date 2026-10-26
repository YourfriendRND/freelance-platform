import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserApi } from '@freelance-platform/client-api';
import { createMockUserResponse } from '@freelance-platform/shared-mock';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { of, throwError } from 'rxjs';
import { findButtonByLabel } from '../../../testing/button-by-label';
import { setField } from '../../../testing/set-field';
import { ProfileEditFormComponent } from './profile-edit-form.component';

describe('ProfileEditFormComponent testing', () => {
  let fixture: ComponentFixture<ProfileEditFormComponent>;
  let update: ReturnType<typeof vi.fn>;
  let saved: UserResponse | null;
  let cancelled: boolean;

  const user: UserResponse = createMockUserResponse({
    bio: 'Ищу исполнителей для своих проектов',
    birthday: '1988-07-14',
  });

  beforeEach(async () => {
    update = vi.fn(() => of(user));
    saved = null;
    cancelled = false;

    await TestBed.configureTestingModule({
      imports: [ProfileEditFormComponent],
      providers: [{ provide: UserApi, useValue: { update } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditFormComponent);
    fixture.componentRef.setInput('user', user);
    fixture.componentInstance.saved.subscribe((nextUser) => {
      saved = nextUser;
    });
    fixture.componentInstance.cancelled.subscribe(() => {
      cancelled = true;
    });
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should show validation errors and skip the update', () => {
    setField(fixture, '#profile-first-name', ' ');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(update).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Обязательное поле');
    expect(saved).toBeNull();
  });

  it('should reject a future birthday', () => {
    setField(fixture, '#profile-birthday', '2099-01-01');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(update).not.toHaveBeenCalled();
    expect(root().textContent).toContain('Дата рождения не может быть в будущем');
  });

  it('should send null for cleared fields and omit the rate', () => {
    setField(fixture, '#profile-last-name', ' ');
    setField(fixture, '#profile-bio', ' ');
    setField(fixture, '#profile-birthday', '');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(root().querySelector('#profile-rate')).toBeNull();
    expect(update).toHaveBeenCalledWith(user.id, {
      firstName: 'Иван',
      lastName: null,
      bio: null,
      birthday: null,
    });
    expect(saved).toEqual(user);
  });

  it('should send the freelancer rate and keep skills unavailable', () => {
    const freelancer = createMockUserResponse({
      role: UserRole.Freelancer,
      rate: 2500,
      bio: user.bio,
      birthday: user.birthday,
    });
    fixture.componentRef.setInput('user', freelancer);
    fixture.detectChanges();

    expect(root().querySelector('#profile-rate')).not.toBeNull();
    expect(root().textContent).toContain('Навыки пока недоступны');
    expect(root().textContent).not.toContain('Добавить навык');

    setField(fixture, '#profile-rate', '1800');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(update).toHaveBeenCalledWith(freelancer.id, {
      firstName: 'Иван',
      lastName: 'Петров',
      bio: 'Ищу исполнителей для своих проектов',
      birthday: '1988-07-14',
      rate: 1800,
    });
  });

  it('should clear an empty freelancer rate', () => {
    fixture.componentRef.setInput(
      'user',
      createMockUserResponse({
        role: UserRole.Freelancer,
        rate: 2500,
        bio: user.bio,
        birthday: user.birthday,
      }),
    );
    fixture.detectChanges();
    setField(fixture, '#profile-rate', '');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(update).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ rate: null }),
    );
  });

  it('should cancel without a request', () => {
    findButtonByLabel(root(), 'Отмена').click();

    expect(update).not.toHaveBeenCalled();
    expect(cancelled).toBe(true);
  });

  it('should show the save error', () => {
    update.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Некорректная дата рождения' },
          }),
      ),
    );

    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(root().textContent).toContain('Некорректная дата рождения');
    expect(saved).toBeNull();
  });
});
