import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../../styles/profile.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  nickname: string;
  phone: string;
  role: string;
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
      setIsLoading(true);
      const response = await api.get('/api/users/me');
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatName = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName || lastName) {
      return firstName || lastName;
    }
    return 'Not set';
  };

  const handleSignOut = () => {
    logout();
  };

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profile Information</h1>
        {profile?.role && (
          <span className="role-badge">{profile.role}</span>
        )}

        <div className="profile-grid">
          <div className="profile-field">
            <label>Full Name</label>
            <p>{formatName(profile?.firstName, profile?.lastName)}</p>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>{profile?.email || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Phone</label>
            <p>{profile?.phone || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Nickname</label>
            <p>{profile?.nickname || 'Not set'}</p>
          </div>

          <div className="profile-field">
            <label>Account Created</label>
            <p>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="profile-field">
            <label>Role</label>
            <p>{profile?.role || 'User'}</p>
          </div>
        </div>

        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;