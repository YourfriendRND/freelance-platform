import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePageContainerComponent } from './profile-page-container.component';

@Component({
  imports: [ProfilePageContainerComponent],
  template: `
    <app-profile-page-container>
      <span data-testid="projected-content">Содержимое профиля</span>
    </app-profile-page-container>
  `,
})
class ProfilePageContainerTestHostComponent {}

describe('ProfilePageContainerComponent testing', () => {
  let fixture: ComponentFixture<ProfilePageContainerTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageContainerTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageContainerTestHostComponent);
    fixture.detectChanges();
  });

  it('should project profile page content', () => {
    const root = fixture.nativeElement as HTMLElement;
    const projectedContent = root.querySelector(
      '[data-testid="projected-content"]',
    );

    expect(projectedContent?.textContent).toContain('Содержимое профиля');
  });
});
