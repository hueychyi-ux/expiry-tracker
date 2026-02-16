// Default shelf life rules based on product categories and subcategories
export const SHELF_LIFE_RULES = {
  subcategories: {
    // Skincare (calculated from opened date)
    'Serum': { months: 6, calculatedFrom: 'opened' },
    'Moisturizer': { months: 12, calculatedFrom: 'opened' },
    'Cleanser': { months: 12, calculatedFrom: 'opened' },
    'Sunscreen': { months: 6, calculatedFrom: 'opened' },
    'Toner': { months: 12, calculatedFrom: 'opened' },
    'Eye Cream': { months: 6, calculatedFrom: 'opened' },
    'Face Mask': { months: 12, calculatedFrom: 'opened' },
    
    // Makeup (calculated from opened date)
    'Mascara': { months: 3, calculatedFrom: 'opened' },
    'Liquid Foundation': { months: 12, calculatedFrom: 'opened' },
    'Powder Products': { months: 24, calculatedFrom: 'opened' },
    'Lipstick': { months: 12, calculatedFrom: 'opened' },
    'Liquid Eyeliner': { months: 3, calculatedFrom: 'opened' },
    'Pencil Eyeliner': { months: 24, calculatedFrom: 'opened' },
    
    // Supplements (calculated from purchase date)
    'Probiotics': { months: 12, calculatedFrom: 'purchase' },
    'Fish Oil/Omega-3': { months: 18, calculatedFrom: 'purchase' },
    'Vitamin C': { months: 24, calculatedFrom: 'purchase' },
    'Vitamin D': { months: 24, calculatedFrom: 'purchase' },
    'Antihistamines': { months: 24, calculatedFrom: 'purchase' }
  },
  categories: {
    'Supplements': { months: 24, calculatedFrom: 'purchase' }
  }
};

// Default categories and their subcategories
export const DEFAULT_CATEGORIES = {
  'Skincare': [
    'Serum',
    'Moisturizer',
    'Cleanser',
    'Sunscreen',
    'Toner',
    'Eye Cream',
    'Face Mask'
  ],
  'Makeup': [
    'Mascara',
    'Liquid Foundation',
    'Powder Products',
    'Lipstick',
    'Liquid Eyeliner',
    'Pencil Eyeliner'
  ],
  'Supplements': [
    'Probiotics',
    'Fish Oil/Omega-3',
    'Vitamin C',
    'Vitamin D',
    'Antihistamines'
  ]
};

// Calculate suggested expiry date
export function calculateSuggestedExpiry(category, subcategory, purchaseDate, openedDate) {
  // Check subcategory rule first (most specific)
  let rule = SHELF_LIFE_RULES.subcategories[subcategory];
  
  // Fallback to category rule
  if (!rule) {
    rule = SHELF_LIFE_RULES.categories[category];
  }
  
  // No rule found
  if (!rule) {
    return null;
  }
  
  // Determine base date
  const baseDate = rule.calculatedFrom === 'purchase' ? purchaseDate : openedDate;
  
  if (!baseDate) {
    return null;
  }
  
  // Calculate expiry date
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + rule.months);
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Get helper text for the suggestion
export function getHelperText(category, subcategory) {
  let rule = SHELF_LIFE_RULES.subcategories[subcategory];
  let source = subcategory;
  
  if (!rule) {
    rule = SHELF_LIFE_RULES.categories[category];
    source = category.toLowerCase();
  }
  
  if (!rule) {
    return null;
  }
  
  const timeframe = rule.months === 1 ? '1 month' : `${rule.months} months`;
  const from = rule.calculatedFrom === 'purchase' ? 'from purchase' : 'after opening';
  
  return `Auto-filled: ${source} typically last ${timeframe} ${from}`;
}
