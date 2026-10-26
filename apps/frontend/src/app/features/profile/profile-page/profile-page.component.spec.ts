import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { createMockUserResponse, MOCK_USER_EMAIL } from '@freelance-platform/shared-mock';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { Observable, of, throwError } from 'rxjs';
import { findButtonByLabel } from '../../../testing/button-by-label';
import { setField } from '../../../testing/set-field';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent testing', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;
  let setUser: ReturnType<typeof vi.fn>;
  let userApi: {
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  const sessionUser: UserResponse = createMockUserResponse({
    firstName: 'Сессия',
    lastName: 'Пользователь',
  });

  const profileUser: UserResponse = createMockUserResponse({
    createdAt: '2026-09-04T10:00:00.000Z',
    bio: 'Ищу исполнителей для своих проектов',
    birthday: '1988-07-14',
    rating: 4.8,
    reviewsCount: 24,
  });

  async function setup(
    user: UserResponse | null,
    response: Observable<UserResponse> = of(profileUser),
  ): Promise<void> {
    setUser = vi.fn();
    userApi = {
      findOne: vi.fn(() => response),
      update: vi.fn(() => of(profileUser)),
    };

    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: signal(user !== null),
            user: signal<UserResponse | null>(user),
            logout: vi.fn(),
            setUser,
          },
        },
        { provide: UserApi, useValue: userApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.detectChanges();
  }

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function profileCard(): ProfileCardComponent | null {
    return (
      fixture.debugElement.query(By.directive(ProfileCardComponent))
        ?.componentInstance as ProfileCardComponent | undefined
    ) ?? null;
  }

  it('should render dashboard layout with profile navigation active', async () => {
    await setup(sessionUser);

    const activeItem = root().querySelector('.ui-dashboard-sidebar__item--active');

    expect(root().querySelector('ui-dashboard-wrapper')).not.toBeNull();
    expect(activeItem?.textContent).toContain('Профиль');
  });

  it('should load the profile by the session id', async () => {
    await setup(sessionUser);

    const card = profileCard();

    expect(userApi.findOne).toHaveBeenCalledTimes(1);
    expect(userApi.findOne).toHaveBeenCalledWith(sessionUser.id);
    expect(card?.displayName()).toBe('Иван Петров');
    expect(card?.email()).toBe(MOCK_USER_EMAIL);
    expect(card?.roleLabel()).toBe('Заказчик');
    expect(card?.registrationLabel()).toBe('На платформе с 04.09.2026');
    expect(card?.bio()).toBe('Ищу исполнителей для своих проектов');
    expect(card?.birthdayLabel()).toBe('День рождения 14.07.1988');
    expect(card?.rating()).toBe(4.8);
    expect(card?.reviewsCount()).toBe(24);
    expect(root().textContent).toContain('Подтвержден');
    expect(root().textContent).not.toContain('Навыки');

    const statisticValues = Array.from(
      root().querySelectorAll('.profile-statistics__value'),
      (element) => element.textContent?.trim(),
    );

    expect(statisticValues).toEqual(['4.8', 'Недоступно', '24']);
    expect(card?.isFreelancer()).toBe(false);
  });

  it('should show the freelancer rate and skills from the profile response', async () => {
    const freelancer = createMockUserResponse({
      role: UserRole.Freelancer,
      rate: 2500,
      createdAt: '2026-09-04T10:00:00.000Z',
    });

    await setup(sessionUser, of(freelancer));

    const card = profileCard();
    const formattedRate = `${new Intl.NumberFormat('ru-RU').format(2500)} ₽/час`;

    expect(card?.isFreelancer()).toBe(true);
    expect(card?.rateLabel()).toBe(formattedRate);
    expect(root().textContent).toContain(formattedRate);
    expect(root().textContent).toContain('Навыки пока не указаны');
  });

  it('should skip the request when the session has no user id', async () => {
    await setup(null);

    expect(userApi.findOne).not.toHaveBeenCalled();
    expect(profileCard()).toBeNull();
    expect(root().textContent).toContain('Не удалось загрузить профиль');
  });

  it('should show the request error and hide the profile card', async () => {
    await setup(
      sessionUser,
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'Пользователь не найден' },
          }),
      ),
    );

    expect(userApi.findOne).toHaveBeenCalledWith(sessionUser.id);
    expect(profileCard()).toBeNull();
    expect(root().querySelector('app-profile-statistics')).toBeNull();
    expect(root().textContent).toContain('Пользователь не найден');
  });

  it('should cancel editing without a request', async () => {
    await setup(sessionUser);

    findButtonByLabel(root(), 'Редактировать').click();
    fixture.detectChanges();
    findButtonByLabel(root(), 'Отмена').click();
    fixture.detectChanges();

    expect(userApi.update).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
    expect(findButtonByLabel(root(), 'Редактировать').textContent?.trim()).toBe('Редактировать');
  });

  it('should save the customer profile and update the session', async () => {
    const updatedUser: UserResponse = {
      ...profileUser,
      firstName: 'Мария',
      lastName: undefined,
      bio: null,
      birthday: null,
    };
    await setup(sessionUser);
    userApi.update.mockReturnValue(of(updatedUser));

    findButtonByLabel(root(), 'Редактировать').click();
    fixture.detectChanges();
    setField(fixture, '#profile-last-name', '');
    setField(fixture, '#profile-bio', '');
    setField(fixture, '#profile-birthday', '');
    findButtonByLabel(root(), 'Сохранить').click();
    fixture.detectChanges();

    expect(userApi.update).toHaveBeenCalledWith(profileUser.id, {
      firstName: 'Иван',
      lastName: null,
      bio: null,
      birthday: null,
    });
    expect(setUser).toHaveBeenCalledWith(updatedUser);
    expect(profileCard()?.displayName()).toBe('Мария');
  });
});
