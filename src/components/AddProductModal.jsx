import { useState, useEffect } from 'react';
import { saveProduct, generateId, getCustomCategories, saveCustomCategories } from '../utils/storage';
import { DEFAULT_CATEGORIES, calculateSuggestedExpiry, getHelperText } from '../data/shelfLifeRules';
import { getTodayDate } from '../utils/dateUtils';

function AddProductModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    photo: null,
    category: '',
    subcategory: '',
    purchaseDate: getTodayDate(),
    openedDate: getTodayDate(),
    expiryDate: '',
    notes: ''
  });

  const [showHelper, setShowHelper] = useState(false);
  const [helperText, setHelperText] = useState('');
  const [customCategories, setCustomCategories] = useState({});
  const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // Load custom categories
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

  // Auto-fill expiry date when category/subcategory/dates change
  useEffect(() => {
    if (formData.category || formData.subcategory) {
      const suggested = calculateSuggestedExpiry(
        formData.category,
        formData.subcategory,
        formData.purchaseDate,
        formData.openedDate
      );

      if (suggested) {
        setFormData(prev => ({ ...prev, expiryDate: suggested }));
        const helper = getHelperText(formData.category, formData.subcategory);
        setHelperText(helper);
        setShowHelper(true);
      } else {
        setShowHelper(false);
      }
    }
  }, [formData.category, formData.subcategory, formData.purchaseDate, formData.openedDate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const updated = { ...customCategories, [newCategoryName]: [] };
      saveCustomCategories(updated);
      setCustomCategories(updated);
      setAllCategories(prev => ({ ...prev, [newCategoryName]: [] }));
      setFormData(prev => ({ ...prev, category: newCategoryName, subcategory: '' }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && formData.category) {
      const updated = { ...customCategories };
      if (!updated[formData.category]) {
        updated[formData.category] = [];
      }
      updated[formData.category] = [...updated[formData.category], newSubcategoryName];
      saveCustomCategories(updated);
      setCustomCategories(updated);
      
      setAllCategories(prev => ({
        ...prev,
        [formData.category]: [...(prev[formData.category] || []), newSubcategoryName]
      }));
      
      setFormData(prev => ({ ...prev, subcategory: newSubcategoryName }));
      setNewSubcategoryName('');
      setIsAddingSubcategory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      alert('Please fill in product name and category');
      return;
    }

    const product = {
      id: generateId(),
      ...formData,
      status: 'active',
      remindersEnabled: !!formData.expiryDate,
      createdAt: new Date().toISOString(),
      finishedAt: null,
      expiryWasAutoFilled: showHelper
    };

    saveProduct(product);
    onSave();
    onClose();
  };

  const categoryOptions = Object.keys(allCategories);
  const subcategoryOptions = formData.category ? (allCategories[formData.category] || []) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Product</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g., Vitamin C Serum"
                required
              />
            </div>

            {/* Photo */}
            <div className="form-group">
              <label className="form-label">Photo (Optional)</label>
              <div className="photo-upload">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="photo-preview" />
                ) : (
                  <label className="photo-placeholder" htmlFor="photo-input">
                    📷
                  </label>
                )}
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="photo-input"
                  onChange={handlePhotoChange}
                />
                {formData.photo ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                  >
                    Remove Photo
                  </button>
                ) : (
                  <label htmlFor="photo-input" className="btn">
                    Add Photo
                  </label>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              {isAddingCategory ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary" onClick={handleAddCategory}>
                    Add
                  </button>
                  <button type="button" className="btn" onClick={() => setIsAddingCategory(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={e => handleChange('category', e.target.value)}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    + New
                  </button>
                </div>
              )}
            </div>

            {/* Subcategory */}
            {formData.category && (
              <div className="form-group">
                <label className="form-label">Subcategory (Optional)</label>
                {isAddingSubcategory ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={newSubcategoryName}
                      onChange={e => setNewSubcategoryName(e.target.value)}
                      placeholder="New subcategory name"
                      autoFocus
                    />
                    <button type="button" className="btn btn-primary" onClick={handleAddSubcategory}>
                      Add
                    </button>
                    <button type="button" className="btn" onClick={() => setIsAddingSubcategory(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-select"
                      value={formData.subcategory}
                      onChange={e => handleChange('subcategory', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select subcategory</option>
                      {subcategoryOptions.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setIsAddingSubcategory(true)}
                    >
                      + New
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Purchase Date */}
            <div className="form-group">
              <label className="form-label">Purchase Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.purchaseDate}
                onChange={e => handleChange('purchaseDate', e.target.value)}
              />
            </div>

            {/* Opened Date */}
            <div className="form-group">
              <label className="form-label">Opened Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.openedDate}
                onChange={e => handleChange('openedDate', e.target.value)}
              />
            </div>

            {/* Expiry Date */}
            <div className="form-group">
              <label className="form-label">Expiry Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={e => handleChange('expiryDate', e.target.value)}
              />
              
              {showHelper && (
                <div className="form-helper">
                  <span className="helper-icon">ℹ️</span>
                  <span className="helper-text">{helperText}</span>
                  <button
                    type="button"
                    className="helper-close"
                    onClick={() => setShowHelper(false)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="e.g., Mom likes this brand"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
