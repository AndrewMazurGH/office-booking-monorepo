import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '@office-booking-monorepo/types';
import api from '../services/api';
import BookingForm from '../components/BookingForm';
import { Modal } from '../components/common';
import '../../styles/bookings.css';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Booking[]>('/api/bookings/my-bookings');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData: Partial<Booking>) => {
    try {
      console.log('Creating booking with data:', bookingData);
      const response = await api.post('/api/bookings/new', bookingData);
      console.log('Booking created:', response.data);
      await fetchBookings();
      setShowNewBookingModal(false);
    } catch (err) {
      console.error('Error creating booking:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'status-pending';
      case BookingStatus.CANCELLED:
        return 'status-cancelled';
      case BookingStatus.CONFIRMED:
        return 'status-confirmed';
      case BookingStatus.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <div className="bookings-loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1 className="page-title">My Bookings</h1>
        <button 
          className="new-booking-btn"
          onClick={() => setShowNewBookingModal(true)}
        >
          New Booking
        </button>
      </div>

      {error && (
        <div className="bookings-error">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Cabin</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="cabin-cell">
                    {booking.cabin?.name || `Cabin ${booking.cabinId}`}
                  </td>
                  <td className="date-cell">{formatDate(booking.startDate)}</td>
                  <td className="date-cell">{formatDate(booking.endDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
        title="Create New Booking"
      >
        <BookingForm
          onSubmit={handleCreateBooking}
          onCancel={() => setShowNewBookingModal(false)}
        />
      </Modal>
    </div>
  );
};

export default BookingsPage;