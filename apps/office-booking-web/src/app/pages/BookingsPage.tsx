import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Modal } from '../components/common';
import BookingForm from '../components/BookingForm';
import { useBookings, useCabins } from '../hooks/useApi';
import { Booking, BookingStatus, Cabin } from '@office-booking-monorepo/types';

interface BookingWithCabin extends Booking {
  cabin?: Cabin;
}

const BookingsPage: React.FC = () => {
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const { getMyBookings, create, loading, error } = useBookings();
  const { getAll: getAllCabins } = useCabins();
  const [bookings, setBookings] = useState<BookingWithCabin[]>([]);
  const [cabins, setCabins] = useState<Record<string, Cabin>>({});

  useEffect(() => {
    fetchBookings();
    fetchCabins();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      const bookingsWithCabins = response.map(booking => ({
        ...booking,
        cabin: cabins[booking.cabinId]
      }));
      setBookings(bookingsWithCabins);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchCabins = async () => {
    try {
      const cabinsResponse = await getAllCabins();
      const cabinsMap = cabinsResponse.reduce((acc, cabin) => {
        acc[cabin.id] = cabin;
        return acc;
      }, {} as Record<string, Cabin>);
      setCabins(cabinsMap);
    } catch (err) {
      console.error('Error fetching cabins:', err);
    }
  };

  const columns = [
    {
      key: 'cabinId',
      label: 'Cabin',
      render: (booking: BookingWithCabin) => booking.cabin?.name || booking.cabinId
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (booking: BookingWithCabin) => new Date(booking.startDate).toLocaleString()
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (booking: BookingWithCabin) => new Date(booking.endDate).toLocaleString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking: BookingWithCabin) => (
        <Badge 
          variant={
            booking.status === BookingStatus.CONFIRMED ? 'success' :
            booking.status === BookingStatus.PENDING ? 'warning' :
            booking.status === BookingStatus.CANCELLED ? 'danger' :
            'default'
          }
        >
          {booking.status}
        </Badge>
      )
    }
  ];

  return (
    <Card className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <Button onClick={() => setShowNewBookingModal(true)}>
          New Booking
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading bookings...</div>
      ) : (
        <Table
          columns={columns}
          data={bookings}
          onRowClick={(booking) => console.log('Clicked booking:', booking)}
        />
      )}

      {bookings.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No bookings found. Create your first booking!
        </div>
      )}

      <Modal
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
        title="New Booking"
      >
        <BookingForm
          onSubmit={async (data) => {
            try {
              await create(data);
              setShowNewBookingModal(false);
              fetchBookings();
            } catch (err) {
              console.error('Error creating booking:', err);
            }
          }}
          onCancel={() => setShowNewBookingModal(false)}
        />
      </Modal>
    </Card>
  );
};

export default BookingsPage;