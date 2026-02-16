// LocalStorage keys
const PRODUCTS_KEY = 'expiry_tracker_products';
const CATEGORIES_KEY = 'expiry_tracker_categories';
const SETTINGS_KEY = 'expiry_tracker_settings';

// Products
export function getProducts() {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProduct(product) {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return product;
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Custom Categories
export function getCustomCategories() {
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveCustomCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// Settings
export function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : {
    notificationsEnabled: true,
    reminderSchedule: {
      oneMonth: true,
      twoWeeks: true,
      threeDays: true,
      oneDay: true
    }
  };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
