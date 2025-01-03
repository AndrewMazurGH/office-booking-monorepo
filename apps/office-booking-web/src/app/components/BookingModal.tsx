// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import './BookingModal.css';

// interface BookingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onBookingCreated: () => void;
// }

// interface Cabin {
//   id: string;
//   name: string;
//   capacity: number;
// }

// const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onBookingCreated }) => {
//   const [cabins, setCabins] = useState<Cabin[]>([]);
//   const [formData, setFormData] = useState({
//     cabinId: '',
//     startDate: '',
//     endDate: '',
//     notes: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       fetchCabins();
//     }
//   }, [isOpen]);

//   const fetchCabins = async () => {
//     try {
//       const response = await api.get('/api/cabins');
//       setCabins(response.data);
//     } catch (err) {
//       console.error('Failed to fetch cabins:', err);
//       setError('Failed to load available cabins');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await api.post('/api/bookings', {
//         ...formData,
//         startDate: new Date(formData.startDate).toISOString(),
//         endDate: new Date(formData.endDate).toISOString()
//       });
      
//       onBookingCreated();
//       onClose();
//       setFormData({
//         cabinId: '',
//         startDate: '',
//         endDate: '',
//         notes: ''
//       });
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to create booking');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2>New Booking</h2>
//           <button className="close-button" onClick={onClose}>&times;</button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           {error && <div className="error-message">{error}</div>}
          
//           <div className="form-group">
//             <label>Select Cabin</label>
//             <select
//               name="cabinId"
//               value={formData.cabinId}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Choose a cabin...</option>
//               {cabins.map(cabin => (
//                 <option key={cabin.id} value={cabin.id}>
//                   {cabin.name} (Capacity: {cabin.capacity})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Start Date & Time</label>
//             <input
//               type="datetime-local"
//               name="startDate"
//               value={formData.startDate}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>End Date & Time</label>
//             <input
//               type="datetime-local"
//               name="endDate"
//               value={formData.endDate}
//               onChange={handleChange}
//               min={formData.startDate}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Notes (Optional)</label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="Add any additional notes here..."
//               rows={3}
//             />
//           </div>

//           <div className="modal-actions">
//             <button 
//               type="button" 
//               onClick={onClose} 
//               className="button-secondary"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               className="button-primary"
//               disabled={loading}
//             >
//               {loading ? 'Creating...' : 'Create Booking'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;