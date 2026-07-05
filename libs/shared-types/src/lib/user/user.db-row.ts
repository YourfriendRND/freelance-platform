export interface UserDbRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  password_hash: string;
  role: string;
  bio: string | null;
  birthday: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
