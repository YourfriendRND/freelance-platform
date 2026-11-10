import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserRole } from '@freelance-platform/shared-types';
import { AnalyticsCustomerApplication } from '../analytics-customer.model';
import { AnalyticsRequestStatus } from '../analytics-freelancer.model';
import { AnalyticsPendingApplicationsComponent } from './analytics-pending-applications.component';

describe('AnalyticsPendingApplicationsComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsPendingApplicationsComponent>;

  const application: AnalyticsCustomerApplication = {
    id: 'b4252672-a116-41ee-b78c-d694b236db02',
    taskId: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    taskTitle: 'Современный интернет-магазин',
    performerName: 'Иван Петров',
    avatarUrl: null,
    rating: 4.8,
    reviewsCount: 12,
    performerRole: UserRole.Freelancer,
    message: 'Готов выполнить задачу',
    proposedPrice: 2800,
    timeline: '2 недели',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsPendingApplicationsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPendingApplicationsComponent);
    fixture.componentRef.setInput('status', AnalyticsRequestStatus.Ready);
    fixture.componentRef.setInput('applications', [application]);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the performer initial when the avatar address is missing', () => {
    expect(root().querySelector('.analytics-panel__bio')).toBeNull();
    expect(root().textContent).not.toContain('О себе пока ничего не указано');
    expect(root().querySelector('.analytics-panel__name')?.textContent?.trim()).toBe('Иван Петров');
    expect(root().querySelector('.analytics-panel__rating')?.textContent).toContain('4.8 (12)');
    expect(root().querySelector('.analytics-panel__rating')?.getAttribute('aria-label')).toBe(
      'Рейтинг: 4.8 из 5, 12 отзывов',
    );
    expect(
      Array.from(root().querySelectorAll('.analytics-panel__star')).map((star) =>
        star.getAttribute('data-fill'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(root().querySelector('.analytics-panel__avatar')?.textContent?.trim()).toBe('И');
    expect(root().querySelector('.analytics-panel__avatar-image')).toBeNull();
  });

  it('should show the performer photo when the avatar address is set', () => {
    fixture.componentRef.setInput('applications', [
      {
        ...application,
        avatarUrl: ' https://cdn.example/avatar.jpg ',
      },
    ]);
    fixture.detectChanges();

    const image = root().querySelector('.analytics-panel__avatar-image') as HTMLImageElement | null;

    expect(image?.getAttribute('src')).toBe('https://cdn.example/avatar.jpg');
    expect(image?.closest('.analytics-panel__avatar')?.textContent?.trim()).toBe('');
  });
});
