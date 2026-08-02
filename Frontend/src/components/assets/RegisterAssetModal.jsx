import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, PackagePlus, Upload, Image as ImageIcon } from 'lucide-react';

export const RegisterAssetModal = ({ isOpen, onClose, onRefresh, categories = [], departments = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    location: '',
    purchaseDate: '',
    cost: '',
    notes: '',
    isBookable: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset all form inputs and photo preview when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        serialNumber: '',
        categoryId: '',
        departmentId: '',
        location: '',
        purchaseDate: '',
        cost: '',
        notes: '',
        isBookable: false
      });
      setImageFile(null);
      setImagePreview('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, serialNumber, categoryId, location } = formData;
    if (!name || !serialNumber || !categoryId || !location) {
      setError('Name, serial number, category, and location are required');
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await api.post('/assets', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Clear form on success
      setFormData({
        name: '',
        serialNumber: '',
        categoryId: '',
        departmentId: '',
        location: '',
        purchaseDate: '',
        cost: '',
        notes: '',
        isBookable: false
      });
      setImageFile(null);
      setImagePreview('');
      setError('');

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '560px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <PackagePlus size={20} style={{ color: 'var(--accent-primary)' }} />
            Register New Hardware Asset
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Name & Serial Number Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="name">Asset Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. MacBook Pro M3 Max"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="serialNumber">Serial Number *</label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                placeholder="e.g. SN-MAC-998811"
                value={formData.serialNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category & Department Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="categoryId">Category *</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="departmentId">Assigned Department</label>
              <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange}>
                <option value="">-- Unassigned --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Cost Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="location">Physical Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. HQ Chicago - Floor 2"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="cost">Purchase Cost (₹ INR)</label>
              <input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                placeholder="e.g. 1999.00"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Purchase Date & Bookable Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
              <input
                id="isBookable"
                name="isBookable"
                type="checkbox"
                checked={formData.isBookable}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              <label htmlFor="isBookable" style={{ margin: 0, fontWeight: 500 }}>
                Enable Resource Booking
              </label>
            </div>
          </div>

          {/* Cloudinary Image Upload Picker */}
          <div>
            <label>Asset Photo (Cloudinary Upload)</label>
            <div style={{ border: '2px dashed #CBD5E1', borderRadius: '6px', padding: '1rem', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
              {imagePreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Image Ready for Cloudinary Upload</span>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                  <Upload size={24} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Click to upload file</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, WEBP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes">Notes / Warranty Details</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              placeholder="Additional specification details..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
