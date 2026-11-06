import { useState, useEffect } from 'react';
import { saveProduct, generateId, getCustomCategories, saveCustomCategories } from '../utils/storage';
import { DEFAULT_CATEGORIES, calculateSuggestedExpiry, getHelperText } from '../data/shelfLifeRules';
import { getTodayDate } from '../utils/dateUtils';
import ExpiryChips from './ExpiryChips';

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

  // Which chip is selected ('1w', '1m', ... 'pick'), or null
  const [selectedChip, setSelectedChip] = useState(null);
  // Where the expiry date came from: 'user' (a chip), 'auto' (category rule) or null
  const [expirySource, setExpirySource] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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

  // Auto-fill expiry from category rules, unless the user already picked a chip
  useEffect(() => {
    if (expirySource === 'user') return;
    if (!formData.category && !formData.subcategory) return;

    const suggested = calculateSuggestedExpiry(
      formData.category,
      formData.subcategory,
      formData.purchaseDate,
      formData.openedDate
    );

    if (suggested) {
      setFormData(prev => ({ ...prev, expiryDate: suggested }));
      setExpirySource('auto');
      setSelectedChip(null);
      setHelperText(getHelperText(formData.category, formData.subcategory));
      setShowHelper(true);
    } else if (expirySource === 'auto') {
      // The new category has no rule: clear the old auto-filled date
      setFormData(prev => ({ ...prev, expiryDate: '' }));
      setExpirySource(null);
      setShowHelper(false);
    }
  }, [formData.category, formData.subcategory, formData.purchaseDate, formData.openedDate]);

  const handleExpiryChange = (date, chipKey) => {
    setFormData(prev => ({ ...prev, expiryDate: date }));
    setSelectedChip(chipKey);
    setExpirySource(chipKey ? 'user' : null);
    setShowHelper(false);
  };

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
    if (field === 'category') {
      // Reset subcategory when category changes
      setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (name) {
      const updated = { ...customCategories, [name]: [] };
      saveCustomCategories(updated);
      setCustomCategories(updated);
      setAllCategories(prev => ({ ...prev, [name]: [] }));
      setFormData(prev => ({ ...prev, category: name, subcategory: '' }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddSubcategory = () => {
    const name = newSubcategoryName.trim();
    if (name && formData.category) {
      const updated = { ...customCategories };
      if (!updated[formData.category]) {
        updated[formData.category] = [];
      }
      updated[formData.category] = [...updated[formData.category], name];
      saveCustomCategories(updated);
      setCustomCategories(updated);

      setAllCategories(prev => ({
        ...prev,
        [formData.category]: [...(prev[formData.category] || []), name]
      }));

      setFormData(prev => ({ ...prev, subcategory: name }));
      setNewSubcategoryName('');
      setIsAddingSubcategory(false);
    }
  };

  const canSave = formData.name.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;

    const product = {
      id: generateId(),
      ...formData,
      name: formData.name.trim(),
      status: 'active',
      remindersEnabled: !!formData.expiryDate,
      createdAt: new Date().toISOString(),
      finishedAt: null,
      expiryWasAutoFilled: expirySource === 'auto'
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
          <h2 className="modal-title">New Product</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">Product name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g., Vitamin C Serum"
                autoFocus
              />
            </div>

            {/* Expiry chips */}
            <div className="form-group">
              <label className="form-label">Expires in</label>
              <ExpiryChips
                value={formData.expiryDate}
                selected={selectedChip}
                onChange={handleExpiryChange}
              />

              {showHelper && expirySource === 'auto' && (
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

            {/* More details toggle */}
            <button
              type="button"
              className="details-toggle"
              onClick={() => setShowDetails(prev => !prev)}
              aria-expanded={showDetails}
            >
              {showDetails ? '− Fewer details' : '+ More details'}
            </button>

            {showDetails && (
              <div className="details-section">
                {/* Photo */}
                <div className="form-group">
                  <label className="form-label">Photo</label>
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
                  <label className="form-label">Category</label>
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
                        style={{ flex: 1 }}
                      >
                        <option value="">No category</option>
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
                    <label className="form-label">Subcategory</label>
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
                          <option value="">No subcategory</option>
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
                  <label className="form-label">Purchase date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.purchaseDate}
                    onChange={e => handleChange('purchaseDate', e.target.value)}
                  />
                </div>

                {/* Opened Date */}
                <div className="form-group">
                  <label className="form-label">Opened date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.openedDate}
                    onChange={e => handleChange('openedDate', e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    placeholder="e.g., Bought at Watsons"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer modal-footer-split">
            <button
              type="button"
              className="btn btn-icon-bordered"
              onClick={onClose}
              aria-label="Cancel"
              title="Cancel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="submit"
              className="btn btn-text-icon-primary"
              disabled={!canSave}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
