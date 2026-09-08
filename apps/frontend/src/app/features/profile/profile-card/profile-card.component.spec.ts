import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileCardComponent } from './profile-card.component';

describe('ProfileCardComponent testing', () => {
  let fixture: ComponentFixture<ProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileCardComponent);
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function setProfileInputs(): void {
    fixture.componentRef.setInput('displayName', 'Анна Смирнова');
    fixture.componentRef.setInput('email', 'anna@example.com');
    fixture.componentRef.setInput('roleLabel', 'Исполнитель');
    fixture.componentRef.setInput(
      'registrationLabel',
      'На платформе с 08.09.2026',
    );
    fixture.detectChanges();
  }

  it('should render profile data from inputs', () => {
    setProfileInputs();

    expect(root().textContent).toContain('Анна Смирнова');
    expect(root().textContent).toContain('anna@example.com');
    expect(root().textContent).toContain('Исполнитель');
    expect(root().textContent).toContain('На платформе с 08.09.2026');
    expect(root().textContent).toContain('О себе пока ничего не указано');
    expect(root().textContent).toContain('Навыки пока не указаны');
  });

  it('should keep profile editing unavailable', () => {
    setProfileInputs();

    const editButton = root().querySelector('button') as HTMLButtonElement;

    expect(editButton.textContent?.trim()).toBe('Редактировать');
    expect(editButton.disabled).toBe(true);
  });
});
