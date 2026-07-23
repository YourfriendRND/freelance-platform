export interface SessionDbRow {
  id: string;
  user_id: string;
  token: string;
  refresh_after: Date;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}
