import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';

import { TaskDetailsResponsesComponent } from './task-details-responses.component';

describe('TaskDetailsResponsesComponent', () => {
  let fixture: ComponentFixture<TaskDetailsResponsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsResponsesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsResponsesComponent);
    fixture.componentRef.setInput('applicationsCount', 3);
    fixture.componentRef.setInput('responses', [
      {
        id: 'response-1',
        performerName: 'Мария Сидорова',
        rating: 4.8,
        reviewsCount: 12,
        price: 45000,
        timeline: '2 недели',
        message: 'Готова взяться за задачу',
        status: TaskApplicationStatus.Pending,
        error: null,
        isUpdating: false,
      },
    ]);
    fixture.detectChanges();
  });

  it('should show the responses count and a card', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = (element.textContent ?? '').replace(/\s/g, ' ');
    const accept = vi.fn();
    const decline = vi.fn();

    fixture.componentInstance.accept.subscribe(accept);
    fixture.componentInstance.decline.subscribe(decline);

    expect(element.querySelector('.task-responses__title')?.textContent).toContain('Отклики (3)');
    expect(text).toContain('Мария Сидорова');
    expect(element.querySelector('.task-response__avatar')?.textContent).toContain('М');
    expect(text).toContain('4.8 (12)');
    expect(
      Array.from(element.querySelectorAll('.task-response__star')).map((star) =>
        star.getAttribute('data-fill'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(text).toContain('45 000 ₽');
    expect(text).toContain('2 недели');
    expect(text).toContain('Готова взяться за задачу');
    expect(element.querySelector('button[disabled]')?.textContent).toContain('Написать');

    const buttons = Array.from(element.querySelectorAll('button'));
    const acceptButton = buttons.find((button) => button.textContent?.includes('Принять'));
    const declineButton = buttons.find((button) => button.textContent?.includes('Отклонить'));

    acceptButton?.click();
    declineButton?.click();

    expect(accept).toHaveBeenCalledWith('response-1');
    expect(decline).toHaveBeenCalledWith('response-1');
  });

  it('should show a card error and disable decision buttons while updating', () => {
    fixture.componentRef.setInput('responses', [
      {
        id: 'response-1',
        performerName: 'Мария Сидорова',
        rating: 0,
        reviewsCount: 0,
        price: null,
        timeline: null,
        message: 'Готова взяться за задачу',
        status: TaskApplicationStatus.Pending,
        error: 'Не удалось обновить отклик',
        isUpdating: true,
      },
    ]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(element.querySelectorAll('button'));

    expect(element.textContent).toContain('—');
    expect(element.textContent).toContain('Не удалось обновить отклик');
    expect(buttons.filter((button) => button.disabled)).toHaveLength(3);
  });

  it('should replace decision buttons with the chosen status', () => {
    fixture.componentRef.setInput('responses', [
      {
        id: 'response-1',
        performerName: 'Мария Сидорова',
        rating: 4.8,
        reviewsCount: 12,
        price: 45000,
        timeline: '2 недели',
        message: 'Готова взяться за задачу',
        status: TaskApplicationStatus.Accept,
        error: null,
        isUpdating: false,
      },
    ]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector('.task-response__status');

    expect(status?.textContent).toContain('Принят');
    expect(status?.getAttribute('data-status')).toBe('accept');
    expect(element.textContent).not.toContain('Принять');
    expect(element.textContent).not.toContain('Отклонить');
    expect(element.querySelector('button[disabled]')?.textContent).toContain('Написать');
  });
});
