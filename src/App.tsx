import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

export interface UserType {
  token: string;
  refreshToken: string;
  userData: {
    username: string;
    user_type: string;
    email: string;
    roll_number: string;
  };
  
}

function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.access || !data.refresh || !data.user_type) {
          throw new Error('Invalid response from server');
        }

        // Call login with the correct parameters
        login(data.access, data.refresh, {
          username: data.username || identifier,
          user_type: data.user_type,
          email: data.email || '',
          roll_number: data.roll_number || ''
        });

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedUser', identifier);
        } else {
          localStorage.removeItem('rememberedUser');
        }

        // Redirect based on user type
        switch (data.user_type) {
          case 'student': navigate('/SDash'); break;
          case 'warden': navigate('/Wmain'); break;
          case 'hostel_staff': navigate('/HDash'); break;
          case 'worker': navigate('/PDash'); break;
          default: navigate('/');
        }
      } else {
        setError(data.detail || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="h-screen w-screen flex flex-col items-center justify-center relative bg-gray-900"
      style={{
        backgroundImage: 'url(/img1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
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
                }`}
              >
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
                }`}
              >
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
                className="text-sm text-orange-300 hover:text-orange-200"
              >
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
              } text-white`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;