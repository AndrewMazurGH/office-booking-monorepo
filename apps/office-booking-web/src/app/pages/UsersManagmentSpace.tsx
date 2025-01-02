import React, { useState, useEffect } from 'react';
import { UserRole } from '@office-booking-monorepo/types';
import api from '../services/api';
import styles from '../styles/shared.module.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

const UsersAdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.USER
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users/register', newUser);
      fetchUsers();
      setShowAddModal(false);
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: UserRole.USER
      });
    } catch (err) {
      setError('Failed to add user');
    }
  };

  if (isLoading) {
    return <div className={styles['pageContainer']}>Loading...</div>;
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['flexBetween']}>
          <h1 className={styles['title']}>User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles['button']}
          >
            Add User
          </button>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <div className={styles['tableControls']}>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={styles['select']}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>

        <table className={styles['table']}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, pageSize).map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={styles['badge']}>{user.role}</span>
                </td>
                <td>
                  <button className={styles['link']}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddModal && (
          <div className={styles['modal']}>
            <div className={styles['modalContent']}>
              <h2>Add New User</h2>
              <form onSubmit={handleAddUser} className={styles['form']}>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>First Name</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className={styles['input']}
                    required
                  />
                </div>
                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className={styles['select']}
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles['modalActions']}>
                  <button type="button" onClick={() => setShowAddModal(false)} className={styles['buttonSecondary']}>
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

export default UsersAdminPage;