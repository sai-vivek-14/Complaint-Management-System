import { useState, useEffect } from 'react';
import axios from 'axios';

// Define types for our profile data
export interface UserProfile {
  
  username: string;
  email: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  
  phone_number: string | null;
  profile_photo: string | null;
  
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch current user profile
        const response = await axios.get('api/current_user/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("PROFILE DATA:", response.data);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};
