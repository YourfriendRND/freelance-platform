import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore, TaskApplicationStore } from '@freelance-platform/client-state';
import {
  createMockTaskApplicationResponse,
  MOCK_TASK_ID,
  mockClientUserResponse,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import { TaskApplicationResponse, TaskStatus, UserResponse } from '@freelance-platform/shared-types';
import { TaskDetailsApplyButtonComponent } from './task-details-apply-button.component';

describe('TaskDetailsApplyButtonComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsApplyButtonComponent>;
  let authStore: {
    user: ReturnType<typeof signal<UserResponse | null>>;
  };
  let applications: ReturnType<typeof signal<TaskApplicationResponse[]>>;
  let load: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    authStore = {
      user: signal<UserResponse | null>(null),
    };
    applications = signal<TaskApplicationResponse[]>([]);
    load = vi.fn();

    const taskApplicationStore = {
      applications,
      load,
      hasApplied: (taskId: string) =>
        applications().some((item) => item.taskId === taskId),
    };

    await TestBed.configureTestingModule({
      imports: [TaskDetailsApplyButtonComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: TaskApplicationStore, useValue: taskApplicationStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsApplyButtonComponent);
    fixture.componentRef.setInput('status', TaskStatus.Open);
    fixture.componentRef.setInput('taskId', MOCK_TASK_ID);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function applyButton(): HTMLButtonElement | null {
    return root().querySelector('button');
  }

  it('should render the apply button for a guest on an open task', () => {
    expect(applyButton()?.textContent).toContain('Откликнуться на заявку');
  });

  it('should navigate a guest to login', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    applyButton()?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should render the apply button for a freelancer on an open task', () => {
    authStore.user.set(mockFreelancerUserResponse);
    fixture.detectChanges();

    expect(applyButton()?.textContent).toContain('Откликнуться на заявку');
  });

  it('should emit apply when a freelancer clicks the apply button', () => {
    authStore.user.set(mockFreelancerUserResponse);
    fixture.detectChanges();

    const apply = vi.fn();
    fixture.componentInstance.apply.subscribe(apply);

    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    applyButton()?.click();

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should show an applied state and skip opening the form', () => {
    authStore.user.set(mockFreelancerUserResponse);
    applications.set([createMockTaskApplicationResponse({ taskId: MOCK_TASK_ID })]);
    fixture.detectChanges();

    const apply = vi.fn();
    fixture.componentInstance.apply.subscribe(apply);

    expect(root().querySelector('.task-details-apply-button__status')?.textContent).toContain(
      'Отклик отправлен',
    );
    expect(root().textContent).toContain('Вы уже откликались на эту задачу');
    expect(applyButton()).toBeNull();

    expect(apply).not.toHaveBeenCalled();
  });

  it('should hide the apply button for a client', () => {
    authStore.user.set(mockClientUserResponse);
    fixture.detectChanges();

    expect(applyButton()).toBeNull();
  });

  it('should hide the apply button on a closed task', () => {
    fixture.componentRef.setInput('status', TaskStatus.Closed);
    fixture.detectChanges();

    expect(applyButton()).toBeNull();
  });

  it('should hide the apply button on a draft task', () => {
    fixture.componentRef.setInput('status', TaskStatus.Draft);
    fixture.detectChanges();

    expect(applyButton()).toBeNull();
  });
});
