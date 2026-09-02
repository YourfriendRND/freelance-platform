import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { UiFooterText } from './ui-footer-text';

type UiFooterLink = {
  readonly label: string;
  readonly href: string;
};

type UiFooterColumn = {
  readonly title: string;
  readonly links: readonly UiFooterLink[];
};

type UiFooterLinkClick = {
  link: UiFooterLink;
  event: MouseEvent;
};

@Component({
  selector: 'ui-footer',
  templateUrl: './ui-footer.component.html',
  styleUrl: './ui-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFooterComponent {
  readonly brandName = input('TaskFlow');
  readonly tagline = input(UiFooterText.Tagline);
  readonly homeHref = input('#');
  readonly copyrightYear = input(new Date().getFullYear());

  readonly linkClick = output<UiFooterLinkClick>();
  readonly homeClick = output<MouseEvent>();

  protected readonly columns: readonly UiFooterColumn[] = [
    {
      title: UiFooterText.ForCustomers,
      links: [
        { label: UiFooterText.BrowseTasks, href: '/tasks' },
        { label: UiFooterText.PostTask, href: '#' },
        { label: UiFooterText.HowItWorks, href: '#' },
      ],
    },
    {
      title: UiFooterText.ForFreelancers,
      links: [
        { label: UiFooterText.FindWork, href: '#' },
        { label: UiFooterText.SignUp, href: '#' },
        { label: UiFooterText.SuccessStories, href: '#' },
      ],
    },
    {
      title: UiFooterText.Company,
      links: [
        { label: UiFooterText.AboutUs, href: '#' },
        { label: UiFooterText.Contact, href: '#' },
        { label: UiFooterText.PrivacyPolicy, href: '#' },
        { label: UiFooterText.TermsOfService, href: '#' },
      ],
    },
  ];

  protected readonly copyrightText = computed(
    () =>
      `© ${this.copyrightYear()} ${this.brandName()}. ${UiFooterText.CopyrightSuffix}`,
  );

  protected onLinkClick(link: UiFooterLink, event: MouseEvent): void {
    this.linkClick.emit({ link, event });
  }
}
