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
import { LoginFormComponent } from '../login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [
    RouterLink,
    UiPageWrapperComponent,
    UiHeaderComponent,
    UiFooterComponent,
    UiAuthContainerComponent,
    UiBrandHeaderComponent,
    UiAuthCardComponent,
    LoginFormComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {}
