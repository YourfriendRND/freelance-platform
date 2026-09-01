import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { USER_ROLE_LABEL, UserResponse } from '@freelance-platform/shared-types';

@Component({
  selector: 'app-task-details-client',
  templateUrl: './task-details-client.component.html',
  styleUrl: './task-details-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsClientComponent {
  readonly author = input.required<UserResponse>();

  protected readonly authorName = computed(() => {
    const { firstName, lastName } = this.author();

    return [firstName, lastName].filter(Boolean).join(' ');
  });

  protected readonly authorRoleLabel = computed(
    () => USER_ROLE_LABEL[this.author().role],
  );

  protected readonly authorInitial = computed(() => {
    const name = this.authorName();

    return name ? name.charAt(0).toUpperCase() : '?';
  });

  protected readonly memberSinceLabel = computed(() => {
    const year = new Date(this.author().createdAt).getFullYear();

    return `На площадке с ${year}`;
  });
}
