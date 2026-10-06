import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ui-modal',
  templateUrl: './ui-modal.component.html',
  styleUrl: './ui-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onBackdropClick()',
    '(document:keydown.escape)': 'onClose()',
  },
})
export class UiModalComponent {
  readonly ariaLabel = input('Диалоговое окно');

  readonly closed = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = previousOverflow;
    });
  }

  protected onBackdropClick(): void {
    this.onClose();
  }

  protected onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
