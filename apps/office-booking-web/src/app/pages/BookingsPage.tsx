import React, { useState, useEffect } from 'react';
import { BookingStatus } from '@office-booking-monorepo/types';
import api from '../services/api';
import { AxiosResponse } from 'axios';
import Payment from '../components/Payments';

interface Room {
  _id: string;
  name: string;
  capacity: number;
  description?: string;
}

interface Booking {
  _id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  notes?: string;
  room?: Room;
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<string | null>(null);
  // Form state
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const BOOKING_PRICE = 50

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const handlePaymentComplete = async () => {
    await fetchBookings(); // Refresh bookings after payment
    setSelectedBookingForPayment(null); // Reset selected booking
  };

  const fetchBookings = async () => {
    try {
      const response: AxiosResponse<Booking[]> = await api.get('/bookings/my-bookings');
      setBookings(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
    }
  };

  const fetchRooms = async () => {
    try {
      const response: AxiosResponse<Room[]> = await api.get('/rooms');
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const bookingData = {
        roomId: selectedRoom,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        notes
      };

      await api.post('/api/bookings', bookingData);
      await fetchBookings(); // Refresh bookings list
      setShowForm(false); // Hide form after successful creation
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const resetForm = () => {
    setSelectedRoom('');
    setStartDate('');
    setEndDate('');
    setNotes('');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Create Booking'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Booking</h2>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name} (Capacity: {room.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Optional notes about the booking"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No bookings found</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Room: {booking.roomId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleString()}
                    </p>
                    {booking.notes && <p className="mt-1 text-sm">{booking.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                      booking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                    
                    {booking.status === BookingStatus.PENDING && (
                      <button
                        onClick={() => setSelectedBookingForPayment(booking._id)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
                
                {selectedBookingForPayment === booking._id && (
                  <div className="mt-4">
                    <Payment
                      bookingId={booking._id}
                      amount={BOOKING_PRICE}
                      onPaymentComplete={handlePaymentComplete}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;