import { useState } from 'react';
import { saveProduct, deleteProduct } from '../utils/storage';
import { formatDate, daysUntilExpiry, formatDaysRemaining, daysSince } from '../utils/dateUtils';

function ProductDetailModal({ product, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleMarkFinished = () => {
    const updated = {
      ...product,
      status: 'finished',
      finishedAt: new Date().toISOString()
    };
    saveProduct(updated);
    onUpdate();
    onClose();
  };

  const handleMarkWasted = () => {
    const updated = {
      ...product,
      status: 'wasted',
      finishedAt: new Date().toISOString()
    };
    saveProduct(updated);
    onUpdate();
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(product.id);
      onUpdate();
      onClose();
    }
  };

  if (isEditing) {
    return <EditProductForm product={product} onClose={onClose} onUpdate={onUpdate} onCancel={() => setIsEditing(false)} />;
  }

  const daysRemaining = daysUntilExpiry(product.expiryDate);
  const daysSincePurchase = daysSince(product.purchaseDate);
  const daysSinceOpened = daysSince(product.openedDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Product Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {product.photo && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img
                src={product.photo}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              {product.name}
            </h3>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {product.category}
              {product.subcategory && ` • ${product.subcategory}`}
            </div>
          </div>

          {/* Expiry Information */}
          {product.expiryDate ? (
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Expiry Date
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                {formatDate(product.expiryDate)}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: daysRemaining < 0 ? 'var(--color-expired)' : daysRemaining <= 3 ? 'var(--color-critical)' : 'var(--color-text)' }}>
                {formatDaysRemaining(daysRemaining)}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                No expiry date set
              </div>
            </div>
          )}

          {/* Other Dates */}
          <div style={{ marginBottom: '20px' }}>
            {product.purchaseDate && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                  Purchase Date
                </div>
                <div style={{ fontSize: '14px' }}>
                  {formatDate(product.purchaseDate)}
                  {daysSincePurchase !== null && (
                    <span style={{ color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                      ({daysSincePurchase} days ago)
                    </span>
                  )}
                </div>
              </div>
            )}

            {product.openedDate && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                  Opened Date
                </div>
                <div style={{ fontSize: '14px' }}>
                  {formatDate(product.openedDate)}
                  {daysSinceOpened !== null && (
                    <span style={{ color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                      ({daysSinceOpened} days ago)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {product.notes && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Notes
              </div>
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {product.notes}
              </div>
            </div>
          )}

          {/* Status for archived items */}
          {product.status !== 'active' && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                Status
              </div>
              <div style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                {product.status}
                {product.finishedAt && (
                  <span style={{ color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                    • {formatDate(product.finishedAt)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ flexDirection: 'column', gap: '12px' }}>
          {product.status === 'active' && (
            <>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleMarkFinished}
                  style={{ flex: 1 }}
                >
                  Mark as Finished
                </button>
                <button
                  className="btn"
                  onClick={handleMarkWasted}
                  style={{ flex: 1 }}
                >
                  Mark as Wasted
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  className="btn"
                  onClick={() => setIsEditing(true)}
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button
                  className="btn"
                  onClick={handleDelete}
                  style={{ flex: 1, color: 'var(--color-critical)' }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
          
          {product.status !== 'active' && (
            <button
              className="btn"
              onClick={handleDelete}
              style={{ width: '100%', color: 'var(--color-critical)' }}
            >
              Delete from Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditProductForm({ product, onClose, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    subcategory: product.subcategory || '',
    purchaseDate: product.purchaseDate || '',
    openedDate: product.openedDate || '',
    expiryDate: product.expiryDate || '',
    notes: product.notes || '',
    photo: product.photo || null
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updated = {
      ...product,
      ...formData
    };
    
    saveProduct(updated);
    onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Product</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Photo</label>
              <div className="photo-upload">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="photo-preview" />
                ) : (
                  <label className="photo-placeholder" htmlFor="edit-photo-input">
                    📷
                  </label>
                )}
                <input
                  id="edit-photo-input"
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
                  <label htmlFor="edit-photo-input" className="btn">
                    Add Photo
                  </label>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.purchaseDate}
                onChange={e => handleChange('purchaseDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opened Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.openedDate}
                onChange={e => handleChange('openedDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={e => handleChange('expiryDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductDetailModal;
