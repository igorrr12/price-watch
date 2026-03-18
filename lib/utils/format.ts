export function formatPrice(currency: string | null, amount: number | null) {
  if (amount == null) return "—";
  
  // Try using specialized Intl formatter
  try {
    if (currency) {
      return new Intl.NumberFormat("en-US", { 
        style: "currency", 
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
  } catch (err) {
    console.warn("Intl format failed for currency:", currency, err);
  }

  // Fallback to manual display: "USD 170.00" or just "170.00"
  const fixed = amount.toFixed(2);
  return currency ? `${currency} ${fixed}` : fixed;
}
