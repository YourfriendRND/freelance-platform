import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileStatisticsComponent } from './profile-statistics.component';

describe('ProfileStatisticsComponent testing', () => {
  let fixture: ComponentFixture<ProfileStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatisticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileStatisticsComponent);
    fixture.componentRef.setInput('rating', 0);
    fixture.componentRef.setInput('reviewsCount', 0);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render all profile statistics', () => {
    expect(root().querySelectorAll('.profile-statistics__item')).toHaveLength(3);
    expect(root().textContent).toContain('Средний рейтинг');
    expect(root().textContent).toContain('Завершённые проекты');
    expect(root().textContent).toContain('Полученные отзывы');
  });

  it('should render rating and reviews from inputs and keep projects unavailable', () => {
    const values = Array.from(
      root().querySelectorAll('.profile-statistics__value'),
      (element) => element.textContent?.trim(),
    );

    expect(values).toEqual(['0.0', 'Недоступно', '0']);

    fixture.componentRef.setInput('rating', 4.8);
    fixture.componentRef.setInput('reviewsCount', 24);
    fixture.detectChanges();

    const updatedValues = Array.from(
      root().querySelectorAll('.profile-statistics__value'),
      (element) => element.textContent?.trim(),
    );

    expect(updatedValues).toEqual(['4.8', 'Недоступно', '24']);
  });
});
