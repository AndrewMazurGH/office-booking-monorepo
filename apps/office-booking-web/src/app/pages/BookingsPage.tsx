import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '@office-booking-monorepo/types';
import api from '../services/api';
import styles from '../styles/shared.module.css';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return styles['badgeSuccess'];
      case BookingStatus.PENDING:
        return styles['badgeWarning'];
      case BookingStatus.CANCELLED:
        return styles['badgeError'];
      default:
        return styles['badge'];
    }
  };

  if (isLoading) {
    return (
      <div className={styles['pageContainer']}>
        <div className={styles['card']}>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['header']}>
          <div className={styles['flexBetween']}>
            <h1 className={styles['title']}>My Bookings</h1>
            <button className={styles['button']}>New Booking</button>
          </div>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <table className={styles['table']}>
          <thead>
            <tr>
              <th>Cabin</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.cabinId}</td>
                <td>{new Date(booking.startDate).toLocaleString()}</td>
                <td>{new Date(booking.endDate).toLocaleString()}</td>
                <td>
                  <span className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className={styles['flexRow']}>
                    <button className={styles['link']}>Edit</button>
                    <button className={styles['link']}>Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;