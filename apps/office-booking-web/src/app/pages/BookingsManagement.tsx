import React, { useState, useEffect } from 'react';
import { BookingStatus } from '@office-booking-monorepo/types';
import api from '../services/api';
import styles from '../styles/shared.module.css';

interface Booking {
  id: string;
  userId: string;
  cabinId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  notes?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  cabin?: {
    name: string;
  };
}

interface Cabin {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const BookingsAdminPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const [newBooking, setNewBooking] = useState({
    userId: '',
    cabinId: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, cabinsRes, usersRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/cabins'),
        api.get('/api/users')
      ]);

      setBookings(bookingsRes.data);
      setCabins(cabinsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/bookings', newBooking);
      await fetchData();
      setShowAddModal(false);
      setNewBooking({
        userId: '',
        cabinId: '',
        startDate: '',
        endDate: '',
        notes: ''
      });
    } catch (err) {
      setError('Failed to create booking');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await api.patch(`/api/bookings/${bookingId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    const matchesDate = !dateFilter.startDate || !dateFilter.endDate || 
      (booking.startDate >= dateFilter.startDate && booking.endDate <= dateFilter.endDate);
    return matchesStatus && matchesDate;
  });

  if (isLoading) {
    return <div className={styles['pageContainer']}>Loading...</div>;
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['flexBetween']}>
          <h1 className={styles['title']}>Bookings Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles['button']}
          >
            Add Booking
          </button>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <div className={styles['filters']}>
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
              className={styles['select']}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(BookingStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className={styles['formGroup']}>
            <label className={styles['label']}>Date Range</label>
            <div className={styles['flexRow']}>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className={styles['input']}
              />
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className={styles['input']}
              />
            </div>
          </div>
        </div>

        <table className={styles['table']}>
          <thead>
            <tr>
              <th>User</th>
              <th>Cabin</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A'}</td>
                <td>{booking.cabin?.name || 'N/A'}</td>
                <td>{new Date(booking.startDate).toLocaleString()}</td>
                <td>{new Date(booking.endDate).toLocaleString()}</td>
                <td>
                  <span className={styles[`badge${booking.status}`]}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className={styles['flexRow']}>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                      className={styles['selectSmall']}
                    >
                      {Object.values(BookingStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button className={styles['link']}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddModal && (
          <div className={styles['modal']}>
            <div className={styles['modalContent']}>
              <h2>Add New Booking</h2>
              <form onSubmit={handleAddBooking} className={styles['form']}>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>User</label>
                  <select
                    value={newBooking.userId}
                    onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value })}
                    className={styles['select']}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Cabin</label>
                  <select
                    value={newBooking.cabinId}
                    onChange={(e) => setNewBooking({ ...newBooking, cabinId: e.target.value })}
                    className={styles['select']}
                    required
                  >
                    <option value="">Select Cabin</option>
                    {cabins.filter(cabin => cabin.isAvailable).map((cabin) => (
                      <option key={cabin.id} value={cabin.id}>
                        {cabin.name} (Capacity: {cabin.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Start Date</label>
                  <input
                    type="datetime-local"
                    value={newBooking.startDate}
                    onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>End Date</label>
                  <input
                    type="datetime-local"
                    value={newBooking.endDate}
                    onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Notes</label>
                  <textarea
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    className={styles['textarea']}
                    rows={3}
                  />
                </div>

                <div className={styles['modalActions']}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className={styles['buttonSecondary']}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles['button']}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsAdminPage;