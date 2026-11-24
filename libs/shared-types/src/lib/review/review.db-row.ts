export interface ReviewDbRow {
  id: string;
  mark: number;
  review: string;
  author_id: string;
  target_id: string;
  created_at: Date;
  updated_at: Date;
  author_first_name?: string;
  author_last_name?: string | null;
}
