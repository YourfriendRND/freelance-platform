import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockAuthorUserResponse } from '@freelance-platform/shared-mock';
import { TaskDetailsClientComponent } from './task-details-client.component';

describe('TaskDetailsClientComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsClientComponent>;

  const author = mockAuthorUserResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsClientComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsClientComponent);
  });

  it('should render client name, role and membership year', () => {
    fixture.componentRef.setInput('author', author);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.task-details-client__title')?.textContent).toContain(
      'О заказчике',
    );
    expect(root.querySelector('.task-details-client__name')?.textContent).toContain(
      'Иван Петров',
    );
    expect(root.querySelector('.task-details-client__role')?.textContent).toContain(
      'Заказчик',
    );
    expect(root.querySelector('.task-details-client__since')?.textContent).toContain(
      'На площадке с 2026',
    );
    expect(root.querySelector('.task-details-client__avatar')?.textContent).toContain(
      'И',
    );
  });
});
