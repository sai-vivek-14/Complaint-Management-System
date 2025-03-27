import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For programmatic navigation

function App() {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);// for storing user's choice
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login/',
        { 
          username: rollNumber, 
          password 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Store tokens based on rememberMe choice
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', response.data.access);
      storage.setItem('refresh_token', response.data.refresh);
      
      // Set default authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Invalid roll number or password. Format: YYYYgroupXXXX (e.g., 2023bcy1234)'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = 'http://localhost:8000/password_reset/';
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
          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                placeholder="YYYYgroupXXXX (e.g., 2023bcy0001)"
                pattern="(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\d{4}"
                title="Format: YYYYgroupXXXX (e.g., 2024bcs1234)"
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
                onClick={handleForgotPassword}
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

export default App;