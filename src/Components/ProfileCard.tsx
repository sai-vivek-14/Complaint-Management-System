import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/accounts/profile/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="text-center text-white mt-12">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 mt-12">Error: {error}</div>;
  if (!profile) return <div className="text-center text-white mt-12">No profile data found</div>;

  return (
    <div className="mt-12 bg-gray-800 p-6 rounded-lg shadow-lg max-w-xs mx-auto">
      <div className="flex items-center gap-6">
        <div className="relative">
          {profile.profile_photo ? (
            <img 
              src={profile.profile_photo}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-orange-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-orange-500 bg-gray-600 flex items-center justify-center">
              <span className="text-white text-2xl">
                {profile.first_name?.charAt(0) || ''}{profile.last_name?.charAt(0) || ''}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-gray-400">{profile.roll_number}</p>
          <p className="text-gray-400 capitalize">{profile.user_type}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {/* Email Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mail:</p>
          <p className="text-gray-400">
            <a href={`mailto:${profile.email}`} className="underline hover:text-orange-500">
              {profile.email}
            </a>
          </p>
        </div>
        
        {/* Mobile Number Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mobile Number:</p>
          <p className="text-gray-400">
            {profile.phone_number ? (
              <a href={`tel:${profile.phone_number}`} className="underline hover:text-orange-500">
                {profile.phone_number}
              </a>
            ) : (
              <span>Not provided</span>
            )}
          </p>
        </div>

        {/* Only show these fields for students */}
        {profile.user_type === 'student' && (
          <>
            {/* Hostel Section */}
            <div className="flex items-center gap-4">
              <p className="text-white font-medium w-36">Hostel:</p>
              <p className="text-gray-400">
                {profile.hostel?.name || 'Not assigned'}
              </p>
            </div>
            
            {/* Room Number Section */}
            <div className="flex items-center gap-4">
              <p className="text-white font-medium w-36">Room Number:</p>
              <p className="text-gray-400">
                {profile.student_profile?.room?.room_number || 'Not assigned'}
              </p>
            </div>
          </>
        )}

        {/* Additional fields for workers */}
        {profile.user_type === 'worker' && profile.worker_profile && (
          <>
            <div className="flex items-center gap-4">
              <p className="text-white font-medium w-36">Worker Type:</p>
              <p className="text-gray-400 capitalize">
                {profile.worker_profile.worker_type.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-white font-medium w-36">Shift:</p>
              <p className="text-gray-400">
                {profile.worker_profile.shift || 'Not specified'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;