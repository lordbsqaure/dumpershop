// Utility functions for formatting data

/**
 * Formats an amount with currency
 * @param amount - The numeric amount to format
 * @param currency - The currency code (defaults to 'FCFA')
 * @returns Formatted string with amount and currency
 */
export function formatAmount(amount: number, currency: string = 'FCFA'): string {
  // Format the number with thousands separators
  const formattedAmount = new Intl.NumberFormat('en-US').format(amount);
  return `${formattedAmount} ${currency}`;
}

/**
 * Formats a price range for display
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currency - Currency code (defaults to 'FCFA')
 * @returns Formatted price range string
 */
export function formatPriceRange(min: number, max: number, currency: string = 'FCFA'): string {
  return `${formatAmount(min, currency)} - ${formatAmount(max, currency)}`;
}
