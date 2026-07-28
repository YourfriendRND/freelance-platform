import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  UiAuthCardComponent,
  UiAuthContainerComponent,
  UiBrandHeaderComponent,
  UiFooterComponent,
  UiHeaderComponent,
  UiPageWrapperComponent,
} from '@freelance-platform/ui';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    UiPageWrapperComponent,
    UiHeaderComponent,
    UiFooterComponent,
    UiAuthContainerComponent,
    UiBrandHeaderComponent,
    UiAuthCardComponent,
    RegisterFormComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {}
