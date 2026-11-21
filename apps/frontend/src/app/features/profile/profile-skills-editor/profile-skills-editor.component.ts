import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkillApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import { UserSkill } from '@freelance-platform/shared-types';
import { UiButtonComponent } from '@freelance-platform/ui';
import { catchError, debounceTime, filter, map, merge, Observable, of, Subject, switchMap } from 'rxjs';
import {
  canonicalSkillName,
  isSkillDraftLengthValid,
  ProfileSkillOption,
  ProfileSkillSuggestion,
  SKILL_SEARCH_DEBOUNCE_MS,
  SKILL_SEARCH_ERROR,
  skillDraftMessage,
  toSkillOptions,
} from './profile-skills-editor.model';

type SkillSearchResult = {
  readonly query: string;
  readonly skills: readonly ProfileSkillSuggestion[];
  readonly errorMessage: string | null;
};

@Component({
  selector: 'app-profile-skills-editor',
  imports: [UiButtonComponent],
  templateUrl: './profile-skills-editor.component.html',
  styleUrl: './profile-skills-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkillsEditorComponent {
  readonly skills = input<readonly string[]>([]);

  readonly skillAdded = output<string>();
  readonly skillRemoved = output<string>();

  private readonly skillApi = inject(SkillApi);
  private readonly queryInput = new Subject<string>();
  private readonly searchNow = new Subject<string>();
  private addAfterSearch = false;

  protected readonly hint = 'Выберите существующий навык из списка или добавьте новый';
  protected readonly existingLabel = 'Существующий навык';
  protected readonly addedLabel = 'Уже добавлен';

  protected readonly query = signal('');
  protected readonly draftError = signal<string | null>(null);
  private readonly menuDismissed = signal(false);
  private readonly suggestions = signal<readonly ProfileSkillSuggestion[]>([]);
  private readonly settledQuery = signal<string | null>(null);

  protected readonly options = computed(() => toSkillOptions(this.suggestions(), this.skills()));

  protected readonly showMenu = computed(() => {
    const draft = this.query().trim();

    return (
      !this.menuDismissed() &&
      this.settledQuery() === draft &&
      isSkillDraftLengthValid(draft)
    );
  });

  constructor() {
    merge(
      this.queryInput.pipe(
        debounceTime(SKILL_SEARCH_DEBOUNCE_MS),
        filter((query) => isSkillDraftLengthValid(query) && query !== this.settledQuery()),
      ),
      this.searchNow,
    )
      .pipe(
        switchMap((query) => this.requestSuggestions(query)),
        takeUntilDestroyed(),
      )
      .subscribe((result) => this.applySuggestions(result));
  }

  protected onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const trimmed = value.trim();

    this.query.set(value);
    this.draftError.set(null);
    this.menuDismissed.set(false);
    this.addAfterSearch = false;

    if (!isSkillDraftLengthValid(trimmed) || this.settledQuery() !== trimmed) {
      this.settledQuery.set(null);
      this.suggestions.set([]);
    }

    this.queryInput.next(trimmed);
  }

  protected onQueryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onAdd();
      return;
    }

    if (event.key === 'Escape') {
      this.menuDismissed.set(true);
    }
  }

  protected onAdd(): void {
    const draft = this.query().trim();

    if (!isSkillDraftLengthValid(draft)) {
      this.addAfterSearch = false;
      this.addSkill(draft);
      return;
    }

    if (this.settledQuery() === draft) {
      this.addAfterSearch = false;
      this.addSkill(canonicalSkillName(draft, this.suggestions()));
      return;
    }

    this.addAfterSearch = true;
    this.searchNow.next(draft);
  }

  protected onSelect(option: ProfileSkillOption): void {
    if (option.added) {
      return;
    }

    this.addSkill(option.name);
  }

  protected onRemove(skill: string): void {
    this.skillRemoved.emit(skill);
  }

  protected createLabel(): string {
    return `Добавить «${this.query().trim()}»`;
  }

  protected removeLabel(skill: string): string {
    return `Удалить ${skill}`;
  }

  private requestSuggestions(query: string): Observable<SkillSearchResult> {
    return this.skillApi.findSuggestions(query).pipe(
      map((skills: UserSkill[]): SkillSearchResult => ({
        query,
        skills: skills.map((skill) => ({ name: skill.name })),
        errorMessage: null,
      })),
      catchError((error: unknown) =>
        of<SkillSearchResult>({
          query,
          skills: [],
          errorMessage: resolveHttpErrorMessage(error, SKILL_SEARCH_ERROR),
        }),
      ),
    );
  }

  private applySuggestions(result: SkillSearchResult): void {
    if (result.query !== this.query().trim()) {
      return;
    }

    if (result.errorMessage) {
      this.suggestions.set([]);
      this.settledQuery.set(null);
      this.draftError.set(result.errorMessage);
      this.addAfterSearch = false;
      return;
    }

    this.suggestions.set(result.skills);
    this.settledQuery.set(result.query);

    if (!this.addAfterSearch) {
      return;
    }

    this.addAfterSearch = false;
    this.addSkill(canonicalSkillName(this.query(), result.skills));
  }

  private addSkill(name: string): void {
    const message = skillDraftMessage(name, this.skills());

    if (message) {
      this.draftError.set(message);
      return;
    }

    this.skillAdded.emit(name);
    this.query.set('');
    this.draftError.set(null);
    this.menuDismissed.set(false);
    this.settledQuery.set(null);
    this.suggestions.set([]);
  }
}
