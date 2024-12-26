import React, { useEffect, useState } from 'react';
import { Booking } from '@office-booking-monorepo/types';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data: Booking[]) => setBookings(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            Room: {b.roomId}, from {b.startDate} to {b.endDate} ({b.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
