export enum UserRole {
  Client = 'client',
  Freelancer = 'freelancer',
}

export enum UserRoleLabel {
  Client = 'Заказчик',
  Freelancer = 'Исполнитель',
}

export const USER_ROLE_LABEL: Record<UserRole, UserRoleLabel> = {
  [UserRole.Client]: UserRoleLabel.Client,
  [UserRole.Freelancer]: UserRoleLabel.Freelancer,
};
