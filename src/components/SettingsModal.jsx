import { useState, useEffect } from 'react';
import { getCustomCategories, saveCustomCategories } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../data/shelfLifeRules';

function SettingsModal({ onClose }) {
  const [customCategories, setCustomCategories] = useState({});
  const [allCategories, setAllCategories] = useState({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  useEffect(() => {
    const custom = getCustomCategories();
    setCustomCategories(custom);
    
    // Merge default and custom categories
    const merged = { ...DEFAULT_CATEGORIES };
    Object.keys(custom).forEach(cat => {
      if (merged[cat]) {
        merged[cat] = [...new Set([...merged[cat], ...custom[cat]])];
      } else {
        merged[cat] = custom[cat];
      }
    });
    setAllCategories(merged);
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const updated = { ...customCategories, [newCategoryName]: [] };
      saveCustomCategories(updated);
      setCustomCategories(updated);
      setAllCategories(prev => ({ ...prev, [newCategoryName]: [] }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = (categoryName) => {
    if (DEFAULT_CATEGORIES[categoryName]) {
      alert("Cannot delete default categories");
      return;
    }
    
    if (confirm(`Delete "${categoryName}" and all its subcategories?`)) {
      const updated = { ...customCategories };
      delete updated[categoryName];
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
      const updatedAll = { ...allCategories };
      delete updatedAll[categoryName];
      setAllCategories(updatedAll);
    }
  };

  const handleAddSubcategory = (categoryName) => {
    if (newSubcategoryName.trim()) {
      const updated = { ...customCategories };
      if (!updated[categoryName]) {
        updated[categoryName] = [];
      }
      updated[categoryName] = [...updated[categoryName], newSubcategoryName];
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
      setAllCategories(prev => ({
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), newSubcategoryName]
      }));
      
      setNewSubcategoryName('');
      setEditingCategory(null);
    }
  };

  const handleDeleteSubcategory = (categoryName, subcategoryName) => {
    if (confirm(`Delete "${subcategoryName}"?`)) {
      const updated = { ...customCategories };
      if (updated[categoryName]) {
        updated[categoryName] = updated[categoryName].filter(sub => sub !== subcategoryName);
      }
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
      setAllCategories(prev => ({
        ...prev,
        [categoryName]: prev[categoryName].filter(sub => sub !== subcategoryName)
      }));
    }
  };

  const isDefaultCategory = (categoryName) => DEFAULT_CATEGORIES.hasOwnProperty(categoryName);
  const isDefaultSubcategory = (categoryName, subcategoryName) => {
    return DEFAULT_CATEGORIES[categoryName]?.includes(subcategoryName);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Manage Categories & Subcategories
          </h3>
          
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Add or remove custom categories and subcategories. Default categories cannot be deleted.
          </p>

          {/* Add New Category */}
          {isAddingCategory ? (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                autoFocus
                style={{ marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" onClick={handleAddCategory}>
                  Add Category
                </button>
                <button className="btn" onClick={() => setIsAddingCategory(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAddingCategory(true)}
              style={{ marginBottom: '20px', width: '100%' }}
            >
              + Add New Category
            </button>
          )}

          {/* Categories List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(allCategories).map(categoryName => (
              <div 
                key={categoryName}
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>
                      {categoryName}
                    </span>
                    {isDefaultCategory(categoryName) && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: 'var(--color-text-secondary)',
                        padding: '2px 6px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: '4px'
                      }}>
                        Default
                      </span>
                    )}
                  </div>
                  {!isDefaultCategory(categoryName) && (
                    <button
                      onClick={() => handleDeleteCategory(categoryName)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-critical)',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {allCategories[categoryName].map(subcategoryName => (
                    <div
                      key={subcategoryName}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{subcategoryName}</span>
                      {!isDefaultSubcategory(categoryName, subcategoryName) && (
                        <button
                          onClick={() => handleDeleteSubcategory(categoryName, subcategoryName)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0',
                            lineHeight: '1'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Subcategory */}
                {editingCategory === categoryName ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={newSubcategoryName}
                      onChange={e => setNewSubcategoryName(e.target.value)}
                      placeholder="New subcategory"
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAddSubcategory(categoryName)}
                    >
                      Add
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewSubcategoryName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn"
                    onClick={() => setEditingCategory(categoryName)}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    + Add Subcategory
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
