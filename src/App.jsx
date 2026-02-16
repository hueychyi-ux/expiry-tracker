import { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import AddProductModal from './components/AddProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import { getProducts } from './utils/storage';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archive'
  const [filter, setFilter] = useState('all'); // 'all' or 'expiring'

  // Load products from localStorage
  useEffect(() => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  }, []);

  // Refresh products list
  const refreshProducts = () => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  };

  // Filter products based on active tab and filter
  const filteredProducts = products.filter(product => {
    // Filter by tab (active vs archive)
    if (activeTab === 'active') {
      if (product.status !== 'active') return false;
    } else {
      if (product.status === 'active') return false;
    }

    // Filter by expiry (only for active tab)
    if (activeTab === 'active' && filter === 'expiring') {
      if (!product.expiryDate) return false;
    }

    return true;
  });

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Expiry Tracker</h1>
          <div className="header-actions">
            {activeTab === 'active' && (
              <button
                className="btn btn-primary btn-icon"
                onClick={() => setIsAddModalOpen(true)}
                aria-label="Add product"
              >
                +
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Archive
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Items
            </button>
            <button
              className={`filter-btn ${filter === 'expiring' ? 'active' : ''}`}
              onClick={() => setFilter('expiring')}
            >
              Expiring Soon
            </button>
          </div>
        )}

        <ProductList
          products={filteredProducts}
          onProductClick={setSelectedProduct}
          emptyMessage={
            activeTab === 'active'
              ? filter === 'expiring'
                ? 'No products expiring soon'
                : 'No products yet. Add your first product!'
              : 'No archived products yet'
          }
        />
      </main>

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={refreshProducts}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={refreshProducts}
        />
      )}
    </div>
  );
}

export default App;
