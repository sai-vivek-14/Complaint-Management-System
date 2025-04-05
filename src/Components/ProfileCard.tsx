import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Profile {
    first_name: string;
    last_name: string;
    Roll_number: string;  // Note the capitalization to match Django
    user_type: string;
    email: string;
    Phone_number?: string;  // Note the capitalization
    profile_photo?: string;
}

const ProfileCard: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/accounts/api/current_user/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
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
    useEffect(() => {
      const token = localStorage.getItem('access_token');
      console.log("Token:", token);
      if (!token) {
          setError("No authentication token found. Please log in.");
          return;
      }
      
  }, []);
  console.log("Profile Data:", profile);
    if (loading) return <div className="text-center py-8">Loading profile...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Error: {error}</div>;
    if (!profile) return <div className="text-center py-8">No profile data found</div>;

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl my-8">
            <div className="md:flex">
                {/* Profile Photo Section */}
                <div className="md:flex-shrink-0 p-4 flex justify-center">
                    {profile.profile_photo ? (
                        <img 
                            className="h-48 w-48 rounded-full object-cover border-4 border-blue-500"
                            src={profile.profile_photo}
                            alt="Profile"
                        />
                    ) : (
                        <div className="h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500">
                            <span className="text-4xl text-gray-500 font-bold">
                                {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Profile Details Section */}
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-blue-500 font-semibold">
                        {/* {profile.user_type} */}
                    </div>
                    <h1 className="block mt-1 text-2xl leading-tight font-medium text-black">
                        {profile.first_name} {profile.last_name}
                    </h1>
                    
                    {/* <p className="mt-1 text-gray-500">Roll Number: {profile.roll_number}</p> */}

                    <div className="mt-6">
                        <div className="flex items-center mt-2 text-gray-600">
                            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${profile.email}`} className="hover:text-blue-600">
                                {profile.email}
                            </a>
                        </div>

                        {profile.Phone_number && (
                            <div className="flex items-center mt-2 text-gray-600">
                                <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${profile.Phone_number}`} className="hover:text-blue-600">
                                    {profile.Phone_number}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;