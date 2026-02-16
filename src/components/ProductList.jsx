import { daysUntilExpiry, getUrgencyLevel, formatDaysRemaining } from '../utils/dateUtils';

function ProductList({ products, onProductClick, emptyMessage }) {
  // Sort products by expiry date (soonest first), products without expiry at the end
  const sortedProducts = [...products].sort((a, b) => {
    // Products without expiry go to the end
    if (!a.expiryDate && !b.expiryDate) return 0;
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;

    // Sort by days until expiry
    const daysA = daysUntilExpiry(a.expiryDate);
    const daysB = daysUntilExpiry(b.expiryDate);
    return daysA - daysB;
  });

  if (sortedProducts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <div className="empty-state-title">No products yet</div>
        <div className="empty-state-description">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="product-list">
      {sortedProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const urgency = getUrgencyLevel(product.expiryDate);
  const daysRemaining = daysUntilExpiry(product.expiryDate);

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-card-header">
        {product.photo ? (
          <img src={product.photo} alt={product.name} className="product-photo" />
        ) : (
          <div className="product-photo-placeholder">📦</div>
        )}
        
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-meta">
            {product.category}
            {product.subcategory && ` • ${product.subcategory}`}
          </div>
          
          {product.expiryDate && (
            <div className={`product-expiry expiry-text-${urgency}`}>
              <span className={`urgency-indicator urgency-${urgency}`}></span>
              {formatDaysRemaining(daysRemaining)}
            </div>
          )}
          
          {!product.expiryDate && (
            <div className="product-expiry text-secondary">
              No expiry date
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
