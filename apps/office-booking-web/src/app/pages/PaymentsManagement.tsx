import React, { useState, useEffect } from 'react';
import { PaymentStatus } from '@office-booking-monorepo/types';
import api from '../services/api';
import styles from '../styles/shared.module.css';

interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  booking?: {
    startDate: string;
    endDate: string;
    cabin?: {
      name: string;
    };
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Booking {
  id: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
  cabin?: {
    name: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

const PaymentsAdminPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const [newPayment, setNewPayment] = useState({
    bookingId: '',
    amount: 0,
    currency: 'USD',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        api.get('/api/payments'),
        api.get('/api/bookings')
      ]);

      setPayments(paymentsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/payments', newPayment);
      await fetchData();
      setShowAddModal(false);
      setNewPayment({
        bookingId: '',
        amount: 0,
        currency: 'USD',
        notes: ''
      });
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      await api.patch(`/api/payments/${paymentId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const getStatusBadgeClass = (status: PaymentStatus) => {
    const statusMap = {
      [PaymentStatus.PAID]: 'badgeSuccess',
      [PaymentStatus.PENDING]: 'badgeWarning',
      [PaymentStatus.FAILED]: 'badgeError',
      [PaymentStatus.REFUNDED]: 'badgeInfo'
    };
    return styles[statusMap[status] || 'badge'];
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    const matchesDate = !dateFilter.startDate || !dateFilter.endDate || 
      (payment.createdAt >= dateFilter.startDate && payment.createdAt <= dateFilter.endDate);
    return matchesStatus && matchesDate;
  });

  if (isLoading) {
    return <div className={styles['pageContainer']}>Loading...</div>;
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['flexBetween']}>
          <h1 className={styles['title']}>Payments Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles['button']}
          >
            Process New Payment
          </button>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <div className={styles['filters']}>
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
              className={styles['select']}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(PaymentStatus).map((status) => (
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
              <th>Booking Details</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : 'N/A'}</td>
                <td>
                  {payment.booking ? (
                    <div>
                      <div>{payment.booking.cabin?.name}</div>
                      <div className={styles['smallText']}>
                        {new Date(payment.booking.startDate).toLocaleDateString()} - 
                        {new Date(payment.booking.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ) : 'N/A'}
                </td>
                <td>
                  {payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td>{new Date(payment.createdAt).toLocaleString()}</td>
                <td>
                  <span className={getStatusBadgeClass(payment.status)}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className={styles['flexRow']}>
                    <select
                      value={payment.status}
                      onChange={(e) => handleUpdatePaymentStatus(payment.id, e.target.value as PaymentStatus)}
                      className={styles['selectSmall']}
                    >
                      {Object.values(PaymentStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddModal && (
          <div className={styles['modal']}>
            <div className={styles['modalContent']}>
              <h2>Process New Payment</h2>
              <form onSubmit={handleAddPayment} className={styles['form']}>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Booking</label>
                  <select
                    value={newPayment.bookingId}
                    onChange={(e) => setNewPayment({ ...newPayment, bookingId: e.target.value })}
                    className={styles['select']}
                    required
                  >
                    <option value="">Select Booking</option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.cabin?.name} - {booking.user?.firstName} {booking.user?.lastName} 
                        ({new Date(booking.startDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Amount</label>
                  <div className={styles['inputGroup']}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                      className={styles['input']}
                      required
                    />
                    <select
                      value={newPayment.currency}
                      onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })}
                      className={styles['select']}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="UAH">UAH</option>
                    </select>
                  </div>
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Notes</label>
                  <textarea
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
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
                    Process Payment
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

export default PaymentsAdminPage;