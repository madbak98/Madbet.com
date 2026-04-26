export function formatCurrency(val: number): string {
  return new Intl.NumberFormat().format(Math.floor(val));
}
