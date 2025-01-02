import React, { useState, useEffect, FormEvent } from 'react';
import { UserRole } from '@office-booking-monorepo/types';
import api from '../../services/api';
import styles from '../../styles/shared.module.css';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  createdAt?: Date;
}

interface NewUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
}

const UsersAdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
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
      setLoading(true);
      // Make sure your backend supports this endpoint
      const response = await api.get<User[]>('/api/users');
      console.log('Users response:', response.data);
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Make sure your backend supports this endpoint
      await api.post('/api/users/register', newUser);
      await fetchUsers();
      setShowAddModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: UserRole.USER
      });
      setError('');
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Make sure your backend supports this endpoint
      await api.delete(`/api/users/${userId}`);
      await fetchUsers();
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['flexBetween']}>
          <h1 className={styles['title']}>Users Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles['button']}
          >
            Add User
          </button>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <div className={styles['filters']}>
          <div className={styles['formGroup']}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles['input']}
            />
          </div>
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
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstName || ''} ${user.lastName || ''}`}</td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>
                  <span className={styles['badge']}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles['flexRow']}>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className={styles['link']}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>

        {showAddModal && (
          <div className={styles['modal']}>
            <div className={styles['modalContent']}>
              <h2 className={styles['title']}>Add New User</h2>
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
                  <label className={styles['label']}>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className={styles['input']}
                  />
                </div>

                <div className={styles['formGroup']}>
                  <label className={styles['label']}>Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className={styles['input']}
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
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className={styles['modalActions']}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={styles['buttonSecondary']}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles['button']}
                  >
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