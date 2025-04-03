import { useEffect, useState } from 'react';
import Navbarr from './Components/Navbarr';
import axios from 'axios';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_photo?: string;
}

const WProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/accounts/api/current_user/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbarr />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading profile...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        ) : profile ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-8">
            <div className="md:flex">
              <div className="p-8">
                <h1 className="block mt-1 text-2xl leading-tight font-medium text-black">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="mt-6 text-gray-600">
                  <p>Email: <a href={`mailto:${profile.email}`} className="hover:text-blue-600">{profile.email}</a></p>
                  {profile.phone_number && <p>Phone: {profile.phone_number}</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">No profile data found</div>
        )}
      </main>
    </div>
  );
};

export default WProfile;
