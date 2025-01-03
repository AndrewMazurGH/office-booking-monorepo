import React, { useEffect, useState } from 'react';
import { Button, Input } from '../common';
import { useCabins } from '../../hooks/useApi';
import { Booking, Cabin } from '@office-booking-monorepo/types';

interface BookingFormProps {
  onSubmit: (data: Partial<Booking>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Booking>;
  submitLabel?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  submitLabel = 'Create Booking'
}) => {
  const [formData, setFormData] = useState({
    cabinId: initialData.cabinId || '',
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    notes: initialData.notes || ''
  });
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAll } = useCabins();

  useEffect(() => {
    loadCabins();
  }, []);

  const loadCabins = async () => {
    try {
      const response = await getAll();
      setCabins(response);
    } catch (err) {
      setError('Failed to load cabins');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Cabin
        </label>
        <select
          name="cabinId"
          value={formData.cabinId}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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

      <div>
        <Input
          label="Start Date & Time"
          type="datetime-local"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Input
          label="End Date & Time"
          type="datetime-local"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;