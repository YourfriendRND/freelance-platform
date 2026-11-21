import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillApi } from '@freelance-platform/client-api';
import { USER_SKILL_MAX_COUNT, UserSkill } from '@freelance-platform/shared-types';
import { of, Subject, throwError } from 'rxjs';
import { findButtonByLabel } from '../../../testing/button-by-label';
import { setField } from '../../../testing/set-field';
import { ProfileSkillsEditorComponent } from './profile-skills-editor.component';
import {
  SKILL_LIMIT_MESSAGE,
  SKILL_NAME_DUPLICATE_MESSAGE,
  SKILL_NAME_TOO_LONG_MESSAGE,
  SKILL_NAME_TOO_SHORT_MESSAGE,
  SKILL_SEARCH_DEBOUNCE_MS,
} from './profile-skills-editor.model';

describe('ProfileSkillsEditorComponent testing', () => {
  let fixture: ComponentFixture<ProfileSkillsEditorComponent>;
  let findSuggestions: ReturnType<typeof vi.fn>;
  let added: string | null;
  let removed: string | null;

  const typescript: UserSkill = {
    id: 'b4252672-a116-41ee-b78c-d694b236db32',
    name: 'TypeScript',
  };

  beforeEach(async () => {
    added = null;
    removed = null;
    findSuggestions = vi.fn(() => of([]));

    await TestBed.configureTestingModule({
      imports: [ProfileSkillsEditorComponent],
      providers: [{ provide: SkillApi, useValue: { findSuggestions } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSkillsEditorComponent);
    fixture.componentInstance.skillAdded.subscribe((skill) => {
      added = skill;
    });
    fixture.componentInstance.skillRemoved.subscribe((skill) => {
      removed = skill;
    });
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function skillInput(): HTMLInputElement {
    return root().querySelector('#profile-skill-name') as HTMLInputElement;
  }

  function optionButton(name: string): HTMLButtonElement {
    const match = Array.from(root().querySelectorAll('.profile-skills-editor__option')).find(
      (button) => button.querySelector('span')?.textContent?.trim() === name,
    );

    if (!match) {
      throw new Error(`Skill option "${name}" was not found`);
    }

    return match as HTMLButtonElement;
  }

  function controlClasses(): string[] {
    return Array.from(
      root().querySelector('.profile-skills-editor__controls')?.children ?? [],
      (element) => element.className,
    );
  }

  function flushSkillSearch(): void {
    vi.advanceTimersByTime(SKILL_SEARCH_DEBOUNCE_MS);
    fixture.detectChanges();
  }

  it('should add a trimmed skill from the button and show it as a chip', () => {
    fixture.componentRef.setInput('skills', ['TypeScript']);
    fixture.detectChanges();
    setField(fixture, '#profile-skill-name', '  Figma  ');
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(findSuggestions).toHaveBeenCalledWith('Figma');
    expect(added).toBe('Figma');
    expect(skillInput().value).toBe('');
    expect(root().textContent).toContain('TypeScript');
    expect(root().textContent).toContain('Выберите существующий навык из списка или добавьте новый');
  });

  it('should add a skill with Enter and keep the profile form from submitting', () => {
    setField(fixture, '#profile-skill-name', 'Figma');

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    skillInput().dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(added).toBe('Figma');
  });

  it('should remove a selected skill', () => {
    fixture.componentRef.setInput('skills', ['TypeScript']);
    fixture.detectChanges();

    const remove = root().querySelector('[aria-label="Удалить TypeScript"]') as HTMLButtonElement;
    remove.click();

    expect(removed).toBe('TypeScript');
  });

  it('should explain a short, long, repeated or overflowing skill', () => {
    setField(fixture, '#profile-skill-name', ' A ');
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(findSuggestions).not.toHaveBeenCalled();
    expect(added).toBeNull();
    expect(root().textContent).toContain(SKILL_NAME_TOO_SHORT_MESSAGE);

    setField(fixture, '#profile-skill-name', 'a'.repeat(51));
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(findSuggestions).not.toHaveBeenCalled();
    expect(root().textContent).toContain(SKILL_NAME_TOO_LONG_MESSAGE);

    fixture.componentRef.setInput('skills', ['TypeScript']);
    fixture.detectChanges();
    setField(fixture, '#profile-skill-name', ' typescript ');
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(added).toBeNull();
    expect(root().textContent).toContain(SKILL_NAME_DUPLICATE_MESSAGE);

    fixture.componentRef.setInput(
      'skills',
      Array.from({ length: USER_SKILL_MAX_COUNT }, (_, index) => `Skill ${index}`),
    );
    fixture.detectChanges();
    setField(fixture, '#profile-skill-name', 'Angular');
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(added).toBeNull();
    expect(root().textContent).toContain(SKILL_LIMIT_MESSAGE);
  });

  it('should offer a new skill only after an empty search', () => {
    setField(fixture, '#profile-skill-name', ' Figma ');

    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();
    expect(skillInput().getAttribute('aria-expanded')).toBe('false');

    flushSkillSearch();

    expect(findSuggestions).toHaveBeenCalledWith('Figma');
    expect(skillInput().getAttribute('aria-expanded')).toBe('true');
    expect(controlClasses()).toEqual([
      'profile-skills-editor__field',
      'profile-skills-editor__menu',
      'profile-skills-editor__add',
      'profile-skills-editor__note',
    ]);

    findButtonByLabel(root(), 'Добавить «Figma»').click();
    fixture.detectChanges();

    expect(added).toBe('Figma');
    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();
  });

  it('should keep the menu closed until the draft is long enough and hide it on Escape', () => {
    setField(fixture, '#profile-skill-name', 'F');
    flushSkillSearch();

    expect(findSuggestions).not.toHaveBeenCalled();
    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();
    expect(skillInput().getAttribute('aria-expanded')).toBe('false');

    setField(fixture, '#profile-skill-name', 'Fi');
    flushSkillSearch();
    skillInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();
  });

  it('should select an existing skill and keep an added one inactive', () => {
    findSuggestions.mockReturnValue(
      of([
        { id: '4d8c2a11-6e55-4a0d-9c31-0b7e5f2a1001', name: 'Figma' },
        { id: '5e9d3b22-7f66-4b1e-8d42-1c8f603b2112', name: 'Marketing' },
      ]),
    );
    fixture.componentRef.setInput('skills', ['Figma']);
    fixture.detectChanges();
    setField(fixture, '#profile-skill-name', 'ma');
    flushSkillSearch();

    const existing = optionButton('Figma');
    const available = optionButton('Marketing');

    expect(existing.disabled).toBe(true);
    expect(existing.textContent).toContain('Уже добавлен');
    expect(available.disabled).toBe(false);
    expect(available.textContent).toContain('Существующий навык');
    expect(root().textContent).not.toContain('Добавить «ma»');

    available.click();
    fixture.detectChanges();

    expect(added).toBe('Marketing');
  });

  it('should add the canonical suggestion name from the button', () => {
    findSuggestions.mockReturnValue(of([typescript]));
    setField(fixture, '#profile-skill-name', ' typescript ');
    flushSkillSearch();
    findButtonByLabel(root(), 'Добавить').click();
    fixture.detectChanges();

    expect(findSuggestions).toHaveBeenCalledTimes(1);
    expect(findSuggestions).toHaveBeenCalledWith('typescript');
    expect(added).toBe('TypeScript');
  });

  it('should wait for the in-flight search before adding a typed skill', () => {
    const pending = new Subject<UserSkill[]>();
    findSuggestions.mockReturnValue(pending);
    setField(fixture, '#profile-skill-name', ' typescript ');
    findButtonByLabel(root(), 'Добавить').click();

    expect(findSuggestions).toHaveBeenCalledWith('typescript');
    expect(added).toBeNull();
    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();

    pending.next([typescript]);
    pending.complete();
    fixture.detectChanges();

    expect(added).toBe('TypeScript');
  });

  it('should show the search error and skip the new-skill option', () => {
    findSuggestions.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'Сервис недоступен' },
          }),
      ),
    );
    setField(fixture, '#profile-skill-name', 'Figma');
    flushSkillSearch();

    expect(root().querySelector('.profile-skills-editor__menu')).toBeNull();
    expect(root().textContent).toContain('Сервис недоступен');
    expect(added).toBeNull();
  });
});
