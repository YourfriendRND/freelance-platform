import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { findButtonByLabel } from '../../../testing/button-by-label';
import { AnalyticsProfileComponent } from './analytics-profile.component';

describe('AnalyticsProfileComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsProfileComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsProfileComponent);
    fixture.componentRef.setInput('displayName', 'Иван Петров');
    fixture.componentRef.setInput('rating', 4.9);
    fixture.componentRef.setInput('reviewsCount', 87);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the name, rating and missing profile fields', () => {
    const text = root().textContent ?? '';

    expect(text).toContain('Ваш профиль');
    expect(text).toContain('Иван Петров');
    expect(text).toContain('И');
    expect(text).toContain('4.9');
    expect(text).toContain('(87)');
    expect(text).toContain('О себе пока ничего не указано');
    expect(text).toContain('0 завершено');
    expect(text).toContain('0 ₽/час');
    expect(text).toContain('Навыки не указаны');
    expect(root().querySelector('.ui-button--muted')).not.toBeNull();
    expect(root().querySelectorAll('.analytics-profile__star[data-fill="full"]')).toHaveLength(4);
  });

  it('should navigate to the profile page', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    findButtonByLabel(root(), 'Редактировать профиль').click();

    expect(navigate).toHaveBeenCalledWith(['/profile']);
  });
});
