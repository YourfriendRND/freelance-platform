import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-page-container',
  templateUrl: './profile-page-container.component.html',
  styleUrl: './profile-page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageContainerComponent {}
