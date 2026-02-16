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
    if (editingCategory === categoryName) return;
    
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
    setExpandedCategories(prev => ({ ...prev, [categoryName]: true }));
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setAddingSubcategoryTo(null);
    setNewSubcategoryName('');
  };

  const handleSaveEditCategory = (oldName) => {
    if (editCategoryName.trim() && editCategoryName !== oldName) {
      const updated = { ...customCategories };
      updated[editCategoryName] = updated[oldName] || [];
      delete updated[oldName];
      
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
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
      
      setEditingCategory(null);
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

  const isInEditMode = (categoryName) => editingCategory === categoryName;

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

          {/* Add New Category - Matching Homepage Button Height */}
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
              className="btn btn-primary btn-text-icon-primary"
              onClick={() => setIsAddingCategory(true)}
              style={{ marginBottom: '20px', width: '100%' }}
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
              Add New Category
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
                    backgroundColor: expandedCategories[categoryName] ? 'var(--color-bg-secondary)' : 'transparent',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      disabled={isInEditMode(categoryName)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isInEditMode(categoryName) ? 'default' : 'pointer',
                        fontSize: '14px',
                        padding: '0',
                        lineHeight: '1',
                        color: 'var(--color-text-secondary)',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        opacity: isInEditMode(categoryName) ? 0.5 : 1
                      }}
                    >
                      {expandedCategories[categoryName] ? '˅' : '˃'}
                    </button>
                    
                    {isInEditMode(categoryName) ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                        autoFocus
                        style={{ flex: 1, minWidth: 0 }}
                        onKeyPress={e => {
                          if (e.key === 'Enter') handleSaveEditCategory(categoryName);
                        }}
                      />
                    ) : (
                      <span 
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: '500', 
                          cursor: 'pointer',
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => toggleCategory(categoryName)}
                      >
                        {categoryName}
                      </span>
                    )}
                  </div>

                  {/* SVG Icon Buttons with Borders */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                    {isInEditMode(categoryName) ? (
                      <>
                        {/* Cancel (left, secondary) */}
                        <button
                          className="btn btn-icon-bordered"
                          onClick={handleCancelEdit}
                          title="Cancel"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                        {/* Save (right, primary) */}
                        <button
                          className="btn btn-text-icon-bordered-primary"
                          onClick={() => handleSaveEditCategory(categoryName)}
                          title="Save"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px' }}>
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Delete (left, destructive) */}
                        <button
                          className="btn btn-icon-bordered-danger"
                          onClick={() => handleDeleteCategory(categoryName)}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Edit (right, primary) */}
                        <button
                          className="btn btn-text-icon-bordered-primary"
                          onClick={() => handleStartEditCategory(categoryName)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px' }}>
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subcategories (Collapsible) */}
                {expandedCategories[categoryName] && (
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    {/* Subcategories Pills - View Mode (read-only) */}
                    {!isInEditMode(categoryName) && allCategories[categoryName].length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', marginLeft: '24px' }}>
                        {allCategories[categoryName].map(subcategoryName => (
                          <div
                            key={subcategoryName}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderRadius: '4px',
                              fontSize: '13px',
                              color: 'var(--color-text)'
                            }}
                          >
                            {subcategoryName}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subcategories Pills - Edit Mode (deletable) */}
                    {isInEditMode(categoryName) && allCategories[categoryName].length > 0 && (
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

                    {/* Add Subcategory - Only in Edit Mode */}
                    {isInEditMode(categoryName) && (
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
                    )}
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
