import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthStore, TaskApplicationStore } from '@freelance-platform/client-state';
import {
  createMockShortTaskResponse,
  createMockTaskApplicationResponse,
  createMockUserResponse,
  MOCK_TASK_APPLICATION_ID,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import { TaskApplicationResponse, UserResponse } from '@freelance-platform/shared-types';
import { of } from 'rxjs';
import { ApplicationDetailsPageComponent } from './application-details-page.component';

describe('ApplicationDetailsPageComponent testing', () => {
  let fixture: ComponentFixture<ApplicationDetailsPageComponent>;
  let selectedApplication: ReturnType<typeof signal<TaskApplicationResponse | null>>;
  let isSelectedLoading: ReturnType<typeof signal<boolean>>;
  let selectedError: ReturnType<typeof signal<string | null>>;
  let loadById: ReturnType<typeof vi.fn>;
  let clearSelected: ReturnType<typeof vi.fn>;

  const task = createMockShortTaskResponse({
    author: createMockUserResponse({
      rating: 4.8,
      reviewsCount: 12,
    }),
  });

  const application = createMockTaskApplicationResponse({ task });

  beforeEach(async () => {
    selectedApplication = signal<TaskApplicationResponse | null>(null);
    isSelectedLoading = signal(false);
    selectedError = signal<string | null>(null);
    loadById = vi.fn();
    clearSelected = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: MOCK_TASK_APPLICATION_ID })),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: signal(true),
            user: signal<UserResponse | null>(mockFreelancerUserResponse),
            logout: vi.fn(),
          },
        },
        {
          provide: TaskApplicationStore,
          useValue: {
            selectedApplication,
            isSelectedLoading,
            selectedError,
            loadById,
            clearSelected,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsPageComponent);
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should load the application by route id', () => {
    fixture.detectChanges();

    expect(loadById).toHaveBeenCalledWith(MOCK_TASK_APPLICATION_ID);
  });

  it('should render the loading state', () => {
    isSelectedLoading.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Загрузка');
    expect(root().querySelector('app-application-details-card')).toBeNull();
  });

  it('should render a forbidden application error', () => {
    selectedError.set('Нет доступа к этому отклику');
    fixture.detectChanges();

    expect(root().textContent).toContain('Нет доступа к этому отклику');
    expect(root().querySelector('app-application-details-card')).toBeNull();
  });

  it('should render the application with the task and client', () => {
    selectedApplication.set(application);
    fixture.detectChanges();

    const text = (root().textContent ?? '').replace(/\s/g, ' ');
    const links = Array.from(root().querySelectorAll('a')).map((link) => link.getAttribute('href'));
    const messageButton = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Написать клиенту'),
    );

    expect(text).toContain(task.title);
    expect(text).toContain(application.message);
    expect(text).toContain('2 500 ₽');
    expect(text).toContain('25 000 – 40 000 ₽');
    expect(text).toContain('Ждём ответа заказчика');
    expect(text).toContain('Иван Петров');
    expect(root().querySelector('.application-details-client__avatar')?.textContent?.trim()).toBe('И');
    expect(root().querySelector('.application-details-client__avatar-image')).toBeNull();
    expect(text).toContain('Удалённо');
    expect(text).toContain('2 недели');
    expect(text).toContain('4.8 · 12 отзывов');
    expect(links).toContain('/applications');
    expect(links).toContain(`/tasks/${task.id}`);
    expect(messageButton?.disabled).toBe(true);
  });

  it('should show the client photo when the avatar address is set', () => {
    selectedApplication.set(
      createMockTaskApplicationResponse({
        task: createMockShortTaskResponse({
          author: createMockUserResponse({
            avatarUrl: ' https://cdn.example/avatar.jpg ',
          }),
        }),
      }),
    );
    fixture.detectChanges();

    const image = root().querySelector(
      '.application-details-client__avatar-image',
    ) as HTMLImageElement | null;

    expect(image?.getAttribute('src')).toBe('https://cdn.example/avatar.jpg');
    expect(image?.closest('.application-details-client__avatar')?.textContent?.trim()).toBe('');
  });

  it('should show a dash when the application has no timeline', () => {
    selectedApplication.set(createMockTaskApplicationResponse({ task, timeline: null }));
    fixture.detectChanges();

    expect(root().textContent).toContain('—');
    expect(root().textContent).toContain('4.8 · 12 отзывов');
  });

  it('should show dashes when the nested task is missing', () => {
    selectedApplication.set(createMockTaskApplicationResponse({ task: undefined }));
    fixture.detectChanges();

    expect(root().querySelector('.application-details-card__title')?.textContent).toBe('—');
    expect(root().querySelector('.application-details-client__name')?.textContent).toBe('—');
    expect(root().querySelector('.application-details-client__rating')?.textContent).toBe('—');
  });

  it('should clear the selected application on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();

    expect(clearSelected).toHaveBeenCalled();
  });
});
