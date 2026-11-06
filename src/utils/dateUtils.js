// Turn a Date into "YYYY-MM-DD" using the phone's own time zone (not UTC)
export function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Read "YYYY-MM-DD" as a local date (midnight on the phone, not UTC)
export function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Calculate days until expiry
export function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = parseLocalDate(expiryDate);

  const diffTime = expiry - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Get urgency level for color coding
export function getUrgencyLevel(expiryDate) {
  const days = daysUntilExpiry(expiryDate);

  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 3) return 'critical'; // Red
  if (days <= 14) return 'warning'; // Orange
  if (days <= 30) return 'caution'; // Yellow
  return 'good'; // Green
}

// Format date for display, e.g. "Nov 6, 2026"
export function formatDate(dateString) {
  if (!dateString) return '';

  // Plain dates ("YYYY-MM-DD") are read as local dates; timestamps as-is
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? parseLocalDate(dateString)
    : new Date(dateString);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format days remaining in "Xm Xd" format
export function formatDaysRemaining(days) {
  if (days === null) return 'No expiry date';
  if (days === -1) return 'Expired yesterday';
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';

  // Convert to months and days format
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  if (months > 0 && remainingDays > 0) {
    return `Expires in ${months}m ${remainingDays}d`;
  } else if (months > 0) {
    return `Expires in ${months}m`;
  } else {
    return `Expires in ${days}d`;
  }
}

// Get today's date in YYYY-MM-DD format (phone's time zone)
export function getTodayDate() {
  return toLocalDateString(new Date());
}

// Today plus some days and/or months, as "YYYY-MM-DD".
// Months clamp to the end of the month: 31 Jan + 1 month = 28/29 Feb.
export function addToDate(dateString, { days = 0, months = 0 } = {}) {
  const start = parseLocalDate(dateString) || new Date();
  let y = start.getFullYear();
  let m = start.getMonth() + months;
  y += Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const result = new Date(y, m, Math.min(start.getDate(), lastDay));
  result.setDate(result.getDate() + days);
  return toLocalDateString(result);
}

export function addToToday(amount) {
  return addToDate(getTodayDate(), amount);
}

// Calculate days since purchase/opened
export function daysSince(dateString) {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = parseLocalDate(dateString);

  const diffTime = today - date;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
