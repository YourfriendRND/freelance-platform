export type RatingStarFill = 'full' | 'half' | 'empty';

export type RatingStar = {
  index: number;
  fill: RatingStarFill;
};

const STAR_COUNT = 5;

export function ratingStars(rating: number): readonly RatingStar[] {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const position = index + 1;
    const fill: RatingStarFill =
      rating >= position ? 'full' : rating >= position - 0.5 ? 'half' : 'empty';

    return { index, fill };
  });
}
