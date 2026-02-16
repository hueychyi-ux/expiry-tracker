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
            <button
              className="btn btn-text-icon"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Categories"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '4px' }}
              >
                <path 
                  d="M2 4.5L4.5 2L7 4.5L4.5 7L2 4.5Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M8 4H14" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M8 8H14" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M8 12H14" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
              </svg>
              Categories
            </button>
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

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
