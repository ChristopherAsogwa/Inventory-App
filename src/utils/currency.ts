/**
 * Formats a number as a currency string with the # symbol and comma separators.
 * e.g.  1234.5  → "#1,234.50"
 *       999     → "#999.00"
 *       1000000 → "#1,000,000.00"
 *
 * @param value   The numeric amount to format
 * @param decimals Number of decimal places (default 2)
 */
export function formatCurrency(value: number, decimals = 2): string {
  const [intPart, decPart] = value.toFixed(decimals).split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `#${intFormatted}.${decPart}`;
}

/**
 * Formats a signed profit/loss value with a leading + or − sign.
 * e.g.  150    → "+#150.00"
 *      -30.5   → "-#30.50"
 */
export function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(value))}`;
}
