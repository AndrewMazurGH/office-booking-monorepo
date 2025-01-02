import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from '../../styles/shared.module.css';

interface Cabin {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  location?: string;
}

const CabinsAdminPage = () => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCabin, setNewCabin] = useState<Partial<Cabin>>({
    name: '',
    capacity: 1,
    description: '',
    location: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    try {
      const response = await api.get('/api/cabins');
      setCabins(response.data);
    } catch (err) {
      setError('Failed to load cabins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCabin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/cabins', newCabin);
      await fetchCabins();
      setShowAddModal(false);
      setNewCabin({
        name: '',
        capacity: 1,
        description: '',
        location: '',
        isAvailable: true
      });
    } catch (err) {
      setError('Failed to add cabin');
    }
  };

  const handleToggleAvailability = async (cabinId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/cabins/${cabinId}`, {
        isAvailable: !currentStatus
      });
      await fetchCabins();
    } catch (err) {
      setError('Failed to update cabin availability');
    }
  };

  if (isLoading) {
    return <div className={styles['pageContainer']}>Loading...</div>;
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['flexBetween']}>
          <h1 className={styles['title']}>Cabins Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles['button']}
          >
            Add Cabin
          </button>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <table className={styles['table']}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cabins.map((cabin) => (
              <tr key={cabin.id}>
                <td>{cabin.name}</td>
                <td>{cabin.capacity} people</td>
                <td>{cabin.location || 'N/A'}</td>
                <td>
                  <span 
                    className={cabin.isAvailable ? styles['badgeSuccess'] : styles['badgeError']}
                  >
                    {cabin.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <div className={styles['flexRow']}>
                    <button 
                      className={styles['link']}
                      onClick={() => handleToggleAvailability(cabin.id, cabin.isAvailable)}
                    >
                      {cabin.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
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
              <h2>Add New Cabin</h2>
              <form onSubmit={handleAddCabin} className={styles['form']}>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Name</label>
                  <input
                    type="text"
                    value={newCabin.name}
                    onChange={(e) => setNewCabin({ ...newCabin, name: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>
                
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newCabin.capacity}
                    onChange={(e) => setNewCabin({ ...newCabin, capacity: Number(e.target.value) })}
                    className={styles['input']}
                    required
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Location</label>
                  <input
                    type="text"
                    value={newCabin.location}
                    onChange={(e) => setNewCabin({ ...newCabin, location: e.target.value })}
                    className={styles['input']}
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Description</label>
                  <textarea
                    value={newCabin.description}
                    onChange={(e) => setNewCabin({ ...newCabin, description: e.target.value })}
                    className={styles['textarea']}
                    rows={3}
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['checkboxLabel']}>
                    <input
                      type="checkbox"
                      checked={newCabin.isAvailable}
                      onChange={(e) => setNewCabin({ ...newCabin, isAvailable: e.target.checked })}
                      className={styles['checkbox']}
                    />
                    Available for booking
                  </label>
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

export default CabinsAdminPage;