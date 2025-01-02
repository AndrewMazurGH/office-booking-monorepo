import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from '../styles/shared.module.css';
interface UserProfile {
  id: string;
  email: string;
  role: string;
  nickname: string;
  phone: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/users/me');
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles['pageContainer']}>
        <div className={styles['card']}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['header']}>
          <h1 className={styles['title']}>Profile Information</h1>
          {profile?.role && (
            <span className={styles['badgeSuccess']}>{profile.role}</span>
          )}
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <div className={styles['form']}>
          <div className={styles['grid']}>
            <div className={styles['formGroup']}>
              <label className={styles['label']}>Full Name</label>
              <p>{profile ? `${profile.firstName} ${profile.lastName}` : 'Not set'}</p>
            </div>

            <div className={styles['formGroup']}>
              <label className={styles['label']}>Email</label>
              <p>{profile?.email}</p>
            </div>

            <div className={styles['formGroup']}>
              <label className={styles['label']}>Phone</label>
              <p>{profile?.phone || 'Not set'}</p>
            </div>

            <div className={styles['formGroup']}>
              <label className={styles['label']}>Nickname</label>
              <p>{profile?.nickname || 'Not set'}</p>
            </div>

            <div className={styles['formGroup']}>
              <label className={styles['label']}>Account Created</label>
              <p>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className={styles['formGroup']}>
              <label className={styles['label']}>Role</label>
              <p>{profile?.role || 'User'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className={`${styles['button']} ${styles['error']}`}
            style={{ marginTop: '20px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;