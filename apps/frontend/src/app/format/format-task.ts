const budgetFormatter = new Intl.NumberFormat('ru-RU');
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatTaskBudget(budgetMin: number, budgetMax: number): string {
  return `${budgetFormatter.format(budgetMin)} – ${budgetFormatter.format(budgetMax)} ₽`;
}

export function formatTaskDate(value: string): string {
  return dateFormatter.format(new Date(value));
}
