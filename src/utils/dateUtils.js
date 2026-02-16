// Calculate days until expiry
export function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
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

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format days remaining
export function formatDaysRemaining(days) {
  if (days === null) return 'No expiry date';
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Calculate days since purchase/opened
export function daysSince(dateString) {
  if (!dateString) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = today - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
