import { UserRole } from '@freelance-platform/shared-types';
import { UiSelectOption } from '@freelance-platform/ui';

export interface RegisterFormValue {
  role: UserRole | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export const REGISTER_ROLE_OPTIONS: readonly UiSelectOption<UserRole>[] = [
  {
    value: UserRole.Client,
    label: 'Нанять фрилансеров (Заказчик)',
  },
  {
    value: UserRole.Freelancer,
    label: 'Найти работу (Исполнитель)',
  },
];
