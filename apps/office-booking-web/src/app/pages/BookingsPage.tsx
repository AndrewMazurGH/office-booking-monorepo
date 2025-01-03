import React, { useState, useEffect } from 'react';
import { BookingStatus } from '@office-booking-monorepo/types';
import api from '../services/api';

import '../../styles/bookings.css';

interface Booking {
  id: string;
  cabinId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  notes?: string;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  if (error) {
    return <div className="bookings-error">{error}</div>;
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1 className="page-title">My Bookings</h1>
        <button className="new-booking-btn">New Booking</button>
      </div>

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
                  <td className="cabin-cell">{booking.cabinId}</td>
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
    </div>
  );
};

export default BookingsPage;