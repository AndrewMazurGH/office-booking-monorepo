import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Booking, Cabin } from '@office-booking-monorepo/types';
import api from '../../services/api';

interface BookingFormProps {
  onSubmit: (data: Partial<Booking>) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  cabinId: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onCancel }) => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [formData, setFormData] = useState<FormData>({
    cabinId: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    try {
      const response = await api.get<Cabin[]>('/api/cabins');
      console.log('Fetched cabins:', response.data);
      setCabins(response.data);
    } catch (err) {
      console.error('Error fetching cabins:', err);
      setError('Failed to load cabins');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.cabinId) {
        throw new Error('Please select a valid cabin');
      }

      const bookingData = {
        cabinId: formData.cabinId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        notes: formData.notes
      };

      console.log('Submitting booking:', bookingData);
      await onSubmit(bookingData);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="cabinId">Select Cabin</label>
        <select
          id="cabinId"
          name="cabinId"
          value={formData.cabinId}
          onChange={handleInputChange}
          className="form-select"
          required
        >
          <option value="">Select a cabin...</option>
          {cabins.map((cabin) => (
            <option key={cabin.id} value={cabin.id}>
              {cabin.name} (Capacity: {cabin.capacity})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date & Time</label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date & Time</label>
        <input
          type="datetime-local"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;