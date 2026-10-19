function reviewsLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'отзыв';
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return 'отзыва';
  }

  return 'отзывов';
}

export function formatAuthorRating(author: { rating: number; reviewsCount: number }): string {
  return `${author.rating.toFixed(1)} · ${author.reviewsCount} ${reviewsLabel(author.reviewsCount)}`;
}
