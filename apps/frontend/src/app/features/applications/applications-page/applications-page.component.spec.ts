import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TaskApi, TaskCategoryApi, UserApi } from '@freelance-platform/client-api';
import { AuthStore, TaskApplicationStore } from '@freelance-platform/client-state';
import {
  createMockTaskApplicationResponse,
  createMockTaskCategoryResponse,
  createMockTaskResponse,
  createMockUserResponse,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import {
  TaskApplicationResponse,
  TaskApplicationStatus,
  UserResponse,
} from '@freelance-platform/shared-types';
import { of } from 'rxjs';
import { ApplicationsPageComponent } from './applications-page.component';

describe('ApplicationsPageComponent testing', () => {
  let fixture: ComponentFixture<ApplicationsPageComponent>;
  let applications: ReturnType<typeof signal<TaskApplicationResponse[]>>;
  let isLoading: ReturnType<typeof signal<boolean>>;
  let isLoaded: ReturnType<typeof signal<boolean>>;
  let error: ReturnType<typeof signal<string | null>>;
  let load: ReturnType<typeof vi.fn>;

  const category = createMockTaskCategoryResponse({
    title: 'Дизайн и творчество',
  });

  const ivan = createMockUserResponse({
    id: 'c8f25b13-a2d4-5e69-b337-2d3e4f5a6b01',
    firstName: 'Иван',
    lastName: 'Смирнов',
  });

  const maria = createMockUserResponse({
    id: 'c8f25b13-a2d4-5e69-b337-2d3e4f5a6b02',
    firstName: 'Мария',
    lastName: 'Волкова',
  });

  const designTask = createMockTaskResponse({
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c11',
    title: 'Дизайн современного интернет-магазина',
    customerId: ivan.id,
    categoryId: category.id,
  });

  const campaignTask = createMockTaskResponse({
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c12',
    title: 'Кампания в социальных сетях',
    customerId: maria.id,
    categoryId: category.id,
  });

  const pendingApplication = createMockTaskApplicationResponse({
    id: 'b4252672-a116-41ee-b78c-d694b236db01',
    taskId: designTask.id,
    status: TaskApplicationStatus.Pending,
  });

  const acceptedApplication = createMockTaskApplicationResponse({
    id: 'b4252672-a116-41ee-b78c-d694b236db02',
    taskId: campaignTask.id,
    status: TaskApplicationStatus.Accept,
  });

  beforeEach(async () => {
    applications = signal<TaskApplicationResponse[]>([]);
    isLoading = signal(false);
    isLoaded = signal(false);
    error = signal<string | null>(null);
    load = vi.fn();

    const authStore = {
      isAuthenticated: signal(true),
      user: signal<UserResponse | null>(mockFreelancerUserResponse),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: TaskApplicationStore,
          useValue: { applications, isLoading, isLoaded, error, load },
        },
        {
          provide: TaskApi,
          useValue: {
            findOne: (id: string) =>
              of(id === campaignTask.id ? campaignTask : designTask),
          },
        },
        {
          provide: UserApi,
          useValue: {
            findOne: (id: string) => of(id === maria.id ? maria : ivan),
          },
        },
        {
          provide: TaskCategoryApi,
          useValue: { findAll: () => of([category]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationsPageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function showApplications(): void {
    isLoading.set(false);
    isLoaded.set(true);
    applications.set([pendingApplication, acceptedApplication]);
    fixture.detectChanges();
    fixture.detectChanges();
  }

  function clickTab(label: string): void {
    const tab = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes(label),
    ) as HTMLButtonElement;

    tab.click();
    fixture.detectChanges();
  }

  it('should load applications', () => {
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should render loaded applications and summary', () => {
    showApplications();

    expect(root().textContent).toContain('Мои отклики');
    expect(root().textContent).toContain('Всего');
    expect(root().textContent).toContain(designTask.title);
    expect(root().textContent).toContain('Иван Смирнов');
    expect(root().textContent).toContain(campaignTask.title);
    expect(root().textContent).toContain('Мария Волкова');
    expect(root().textContent).toContain(category.title);
  });

  it('should filter applications by status tab', () => {
    showApplications();
    clickTab('Приняты');

    expect(root().textContent).toContain(campaignTask.title);
    expect(root().textContent).not.toContain(designTask.title);
  });

  it('should filter applications by search', () => {
    showApplications();

    const search = root().querySelector('input') as HTMLInputElement;
    search.value = 'Мария';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(root().textContent).toContain(campaignTask.title);
    expect(root().textContent).not.toContain(designTask.title);
  });

  it('should show an empty filter state', () => {
    showApplications();

    const search = root().querySelector('input') as HTMLInputElement;
    search.value = 'нет таких откликов';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(root().textContent).toContain('Отклики не найдены');
  });

  it('should show an empty list state', () => {
    isLoaded.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('У вас пока нет откликов');
  });

  it('should show the load error', () => {
    error.set('Не удалось загрузить отклики');
    fixture.detectChanges();

    expect(root().textContent).toContain('Не удалось загрузить отклики');
  });

  it('should navigate to tasks from the find button', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const button = Array.from(root().querySelectorAll('button')).find((item) =>
      item.textContent?.includes('Найти задачи'),
    ) as HTMLButtonElement;

    button.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks');
  });
});
