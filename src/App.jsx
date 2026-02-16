import { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import AddProductModal from './components/AddProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import SettingsModal from './components/SettingsModal';
import { getProducts } from './utils/storage';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  }, []);

  const refreshProducts = () => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === 'active') {
      if (product.status !== 'active') return false;
    } else {
      if (product.status === 'active') return false;
    }

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
            {/* Categories button - tag icon only with border */}
            <button
              className="btn btn-icon-bordered"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Categories"
              title="Categories"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 7L6.5 3.5L10 7L6.5 10.5L3 7Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M12 6H21" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M12 12H21" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M12 18H21" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {activeTab === 'active' && (
              /* Add button - icon + text (primary, blue) */
              <button
                className="btn btn-primary btn-text-icon-primary"
                onClick={() => setIsAddModalOpen(true)}
                aria-label="Add product"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '6px' }}
                >
                  <path 
                    d="M12 5V19M5 12H19" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                </svg>
                New
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

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
