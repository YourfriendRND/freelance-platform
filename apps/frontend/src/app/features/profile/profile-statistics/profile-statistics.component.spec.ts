import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileStatisticsComponent } from './profile-statistics.component';

describe('ProfileStatisticsComponent testing', () => {
  let fixture: ComponentFixture<ProfileStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatisticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileStatisticsComponent);
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

  it('should render zero-value placeholders', () => {
    const values = Array.from(
      root().querySelectorAll('.profile-statistics__value'),
      (element) => element.textContent?.trim(),
    );

    expect(values).toEqual(['0.0', '0', '0']);
  });
});
