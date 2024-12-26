import { AxiosResponse } from 'axios';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserProfile {
  _id: string;
  email: string;
  role: string;
  nickname: string;
  phone: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const response: AxiosResponse<UserProfile> = await api.get('/api/users/me');
      setProfile(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile Information</h1>
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
            {profile?.role}
          </span>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1 text-lg">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nickname</label>
                <p className="mt-1 text-lg">{profile?.nickname || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-lg">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <p className="mt-1 text-lg">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Created</label>
                <p className="mt-1 text-lg">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString() 
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Type</label>
                <p className="mt-1 text-lg">{profile?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;