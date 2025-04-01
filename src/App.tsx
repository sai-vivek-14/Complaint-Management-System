import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:8000/accounts/api/';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Determine login credentials based on type
      const credentials = {
        username: identifier, // Always send as 'username'
        password
      };

      const response = await axios.post('auth/login/', credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Store tokens and user data
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', response.data.access);
      storage.setItem('refresh_token', response.data.refresh);
      storage.setItem('user_data', JSON.stringify({
        user_type: response.data.user_type,
        email: response.data.email,
        roll_number: response.data.roll_number
      }));

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Redirect based on user type
      switch(response.data.user_type) {
        case 'student': navigate('/SDash '); break;
        case 'warden': navigate('/Wmain'); break;
        case 'hostel_staff': navigate('/HDash'); break;
        case 'worker': navigate('/PDash'); break;
        default: navigate('/');
      }

    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        (loginType === 'student' 
          ? 'Invalid roll number or password' 
          : 'Invalid email or password')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      if (!refreshToken) return;

      const response = await axios.post('auth/token/refresh/', {
        refresh: refreshToken
      });

      const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
      storage.setItem('access_token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };

  // Set up token refresh interval
  useEffect(() => {
    const interval = setInterval(refreshToken, 14 * 60 * 1000); // Refresh every 14 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative bg-gray-900"
      style={{
        backgroundImage: 'url(/img1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      
      {/* Title Section */}
      <div className="absolute top-10 w-full text-left px-8">
        <h1 className="text-5xl font-bold text-white mb-2">Insta Solve</h1>
        <p className="text-gray-400 text-lg">Hostel Complaint Management System, IIIT Kottayam</p>
        <div className="w-1/3 h-1 bg-white mt-2"></div>
      </div>

      {/* Login Form */}
      <div className="flex w-full h-full items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
          {/* Login Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setLoginType('student');
                  setIdentifier('');
                  setError('');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  loginType === 'student' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('staff');
                  setIdentifier('');
                  setError('');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  loginType !== 'student' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                Staff
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                {loginType === 'student' ? 'Roll Number' : 'Institute Email'}
              </label>
              <input
                type={loginType === 'student' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                placeholder={
                  loginType === 'student' 
                    ? 'YYYYgroupXXXX (e.g., 2024bcs1234)' 
                    : 'user@iiitkottayam.ac.in'
                }
                pattern={
                  loginType === 'student' 
                    ? '(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\\d{4}' 
                    : '.+@iiitkottayam\\.ac\\.in'
                }
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-orange-300 focus:ring-orange-300/50"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/passwordreset')}
                className="text-sm text-orange-300 hover:text-orange-200">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-orange-700 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;