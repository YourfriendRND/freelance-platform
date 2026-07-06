import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  UiAuthCardComponent,
  UiAuthShellComponent,
  UiBrandHeaderComponent,
} from '@freelance-platform/ui';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [
    UiAuthShellComponent,
    UiBrandHeaderComponent,
    UiAuthCardComponent,
    RegisterFormComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {}
