export type ReviewStats = {
  rating: number;
  reviewsCount: number;
};

export type UserReviewStats = ReviewStats & {
  userId: string;
};
