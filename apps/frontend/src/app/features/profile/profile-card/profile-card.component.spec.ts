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
    fixture.componentRef.setInput('roleLabel', 'Заказчик');
    fixture.componentRef.setInput(
      'registrationLabel',
      'На платформе с 08.09.2026',
    );
    fixture.componentRef.setInput('bio', 'Ищу исполнителей для своих проектов');
    fixture.componentRef.setInput('birthdayLabel', 'День рождения 14.07.1988');
    fixture.componentRef.setInput('rating', 4.8);
    fixture.componentRef.setInput('reviewsCount', 24);
    fixture.componentRef.setInput('isFreelancer', false);
    fixture.componentRef.setInput('rateLabel', 'Ставка не указана');
    fixture.detectChanges();
  }

  it('should render customer profile data from inputs', () => {
    setProfileInputs();

    expect(root().textContent).toContain('Анна Смирнова');
    expect(root().textContent).toContain('anna@example.com');
    expect(root().textContent).toContain('Заказчик');
    expect(root().textContent).toContain('На платформе с 08.09.2026');
    expect(root().textContent).toContain('Подтвержден');
    expect(root().textContent).toContain('Ищу исполнителей для своих проектов');
    expect(root().textContent).toContain('День рождения 14.07.1988');
    expect(root().textContent).toContain('4.8 (24)');
    expect(root().querySelector('.profile-card__avatar')?.getAttribute('aria-label')).toBe(
      'Аватар не добавлен',
    );
    expect(root().querySelectorAll('.profile-card__star[data-fill="full"]')).toHaveLength(4);
    expect(root().querySelectorAll('.profile-card__star[data-fill="half"]')).toHaveLength(1);
    expect(root().textContent).not.toContain('Навыки');
    expect(root().textContent).not.toContain('Ставка не указана');
  });

  it('should render the freelancer rate and skills placeholder', () => {
    setProfileInputs();
    fixture.componentRef.setInput('roleLabel', 'Исполнитель');
    fixture.componentRef.setInput('isFreelancer', true);
    fixture.componentRef.setInput('rateLabel', '2 500 ₽/час');
    fixture.detectChanges();

    expect(root().textContent).toContain('2 500 ₽/час');
    expect(root().textContent).toContain('Навыки');
    expect(root().textContent).toContain('Навыки пока не указаны');
  });

  it('should mark freelancer skills unavailable while editing', () => {
    setProfileInputs();
    fixture.componentRef.setInput('roleLabel', 'Исполнитель');
    fixture.componentRef.setInput('isFreelancer', true);
    fixture.componentRef.setInput('rateLabel', '2 500 ₽/час');
    fixture.componentRef.setInput('editing', true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Навыки пока недоступны');
    expect(root().textContent).not.toContain('2 500 ₽/час');
    expect(root().textContent).not.toContain('Навыки пока не указаны');
  });

  it('should render empty bio and birthday labels', () => {
    fixture.componentRef.setInput('displayName', 'Анна Смирнова');
    fixture.componentRef.setInput('email', 'anna@example.com');
    fixture.componentRef.setInput('roleLabel', 'Заказчик');
    fixture.componentRef.setInput('registrationLabel', 'На платформе с 08.09.2026');
    fixture.componentRef.setInput('bio', 'О себе пока ничего не указано');
    fixture.componentRef.setInput('birthdayLabel', 'Дата рождения не указана');
    fixture.componentRef.setInput('rating', 0);
    fixture.componentRef.setInput('reviewsCount', 0);
    fixture.componentRef.setInput('isFreelancer', false);
    fixture.componentRef.setInput('rateLabel', 'Ставка не указана');
    fixture.detectChanges();

    expect(root().textContent).toContain('О себе пока ничего не указано');
    expect(root().textContent).toContain('Дата рождения не указана');
    expect(root().textContent).toContain('0.0 (0)');
  });

  it('should request profile editing', () => {
    setProfileInputs();

    const edit = vi.fn();
    fixture.componentInstance.edit.subscribe(edit);

    const editButton = root().querySelector('button') as HTMLButtonElement;
    editButton.click();

    expect(editButton.textContent?.trim()).toBe('Редактировать');
    expect(editButton.disabled).toBe(false);
    expect(edit).toHaveBeenCalledTimes(1);
  });

  it('should show a disabled avatar action while editing', () => {
    setProfileInputs();
    fixture.componentRef.setInput('editing', true);
    fixture.detectChanges();

    const avatarAction = root().querySelector('.profile-card__avatar-action') as HTMLButtonElement;

    expect(root().textContent).not.toContain('Редактировать');
    expect(avatarAction.disabled).toBe(true);
    expect(avatarAction.getAttribute('aria-label')).toBe('Изменение аватара недоступно');
  });
});
