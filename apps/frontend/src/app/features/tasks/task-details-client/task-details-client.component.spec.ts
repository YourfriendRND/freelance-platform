import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockAuthorUserResponse } from '@freelance-platform/shared-mock';
import { TaskDetailsClientComponent } from './task-details-client.component';

describe('TaskDetailsClientComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsClientComponent>;

  const author = {
    ...mockAuthorUserResponse,
    rating: 4.8,
    reviewsCount: 24,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsClientComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsClientComponent);
  });

  it('should render the client card from the design', () => {
    fixture.componentRef.setInput('author', author);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const stars = Array.from(root.querySelectorAll('.task-details-client__star')).map((star) =>
      star.getAttribute('data-fill'),
    );

    expect(root.querySelector('.task-details-client__title')?.textContent).toContain(
      'О заказчике',
    );
    expect(root.querySelector('.task-details-client__name')?.textContent).toContain(
      'Иван Петров',
    );
    expect(root.querySelector('.task-details-client__rating')?.textContent).toContain(
      '4.8 (24)',
    );
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(root.querySelector('.task-details-client__bio')).toBeNull();
    expect(root.textContent).not.toContain('О себе пока ничего не указано');
    expect(root.querySelector('.task-details-client__since, .task-details-client__meta')?.textContent).toContain(
      'На площадке с 2026',
    );
    expect(root.querySelector('.task-details-client__verified')?.textContent).toContain(
      'Подтвержден',
    );
    expect(root.querySelector('.task-details-client__avatar')?.textContent).toContain('И');
    expect(root.querySelector('.task-details-client__avatar-image')).toBeNull();
  });

  it('should render the avatar image when avatarUrl is set', () => {
    fixture.componentRef.setInput('author', {
      ...author,
      avatarUrl: ' https://cdn.example/avatar.jpg ',
    });
    fixture.detectChanges();

    const image = (fixture.nativeElement as HTMLElement).querySelector(
      '.task-details-client__avatar-image',
    ) as HTMLImageElement | null;

    expect(image?.getAttribute('src')).toBe('https://cdn.example/avatar.jpg');
    expect(image?.closest('.task-details-client__avatar')?.textContent?.trim()).toBe('');
  });

  it('should hide the verified mark when the author is not verified', () => {
    fixture.componentRef.setInput('author', {
      ...author,
      verified: false,
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.task-details-client__verified')).toBeNull();
    expect(root.textContent).not.toContain('Подтвержден');
  });
});