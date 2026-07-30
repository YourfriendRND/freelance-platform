export enum UiHeaderMode {
  Guest = 'guest',
  Authenticated = 'authenticated',
}

export type UiHeaderModeType = `${UiHeaderMode}`;

export enum UiHeaderUser {
  Name = 'Пользователь',
  Role = 'Гость',
}

export enum UiHeaderText {
  Logout = 'Выйти',
  Profile = 'Профиль',
}
