import { useState, useEffect } from 'react';
import { getCustomCategories, saveCustomCategories } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../data/shelfLifeRules';

function SettingsModal({ onClose }) {
  const [customCategories, setCustomCategories] = useState({});
  const [allCategories, setAllCategories] = useState({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState(null);
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

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

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

  const handleStartEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleSaveEditCategory = (oldName) => {
    if (editCategoryName.trim() && editCategoryName !== oldName) {
      // Create new category with renamed name
      const updated = { ...customCategories };
      updated[editCategoryName] = updated[oldName] || [];
      delete updated[oldName];
      
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
      // Update all categories
      const updatedAll = { ...allCategories };
      updatedAll[editCategoryName] = updatedAll[oldName];
      delete updatedAll[oldName];
      setAllCategories(updatedAll);
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = (categoryName) => {
    if (confirm(`Delete "${categoryName}" and all its subcategories? This will remove it from all products using this category.`)) {
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
      setAddingSubcategoryTo(null);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Categories</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Organize your products by adding or editing categories and subcategories.
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(allCategories).map(categoryName => (
              <div 
                key={categoryName}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                {/* Category Header */}
                <div 
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: expandedCategories[categoryName] ? 'var(--color-bg-secondary)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: '1',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {expandedCategories[categoryName] ? '▼' : '▶'}
                    </button>
                    
                    {editingCategory === categoryName ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                        autoFocus
                        style={{ flex: 1, marginRight: '8px' }}
                        onKeyPress={e => {
                          if (e.key === 'Enter') handleSaveEditCategory(categoryName);
                        }}
                      />
                    ) : (
                      <span 
                        style={{ fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}
                        onClick={() => toggleCategory(categoryName)}
                      >
                        {categoryName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editingCategory === categoryName ? (
                      <>
                        <button
                          onClick={() => handleSaveEditCategory(categoryName)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditCategory(categoryName)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(categoryName)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-critical)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subcategories (Collapsible) */}
                {expandedCategories[categoryName] && (
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    {/* Subcategories Pills */}
                    {allCategories[categoryName].length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', marginLeft: '24px' }}>
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
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Subcategory */}
                    <div style={{ marginLeft: '24px' }}>
                      {addingSubcategoryTo === categoryName ? (
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
                              setAddingSubcategoryTo(null);
                              setNewSubcategoryName('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => setAddingSubcategoryTo(categoryName)}
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                        >
                          + Add Subcategory
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
