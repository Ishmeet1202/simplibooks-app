/**
 * Formats a date string or Date object into a more readable format.
 * Example: "2025-09-06T..." becomes "Sep 6, 2025"
 * @param {string | Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

/**
 * Formats a number into a currency string (Indian Rupee by default).
 * Example: 15500 becomes "₹15,500.00"
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (e.g., 'INR', 'USD').
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
