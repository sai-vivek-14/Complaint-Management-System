import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PasswordResetPage: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<'email' | 'roll'>('email');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        'http://localhost:8000/accounts/api/auth/password_reset/',
        { email_or_roll: identifier },  // Match backend field name
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("UID:", uid, "Token:", token);
      setSuccess('Password reset email sent. Please check your email inbox.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/accounts/api/auth/password_reset/confirm/',
        {
          uid,
          token,
          password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Password reset successfully! You can now login with your new password.');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
      <div className="absolute top-10 w-full text-left px-8">
        <h1 className="text-5xl font-bold text-white mb-2">Insta Solve</h1>
        <p className="text-gray-400 text-lg">Hostel Complaint Management System, IIIT Kottayam</p>
        <div className="w-1/3 h-1 bg-white mt-2"></div>
      </div>

      <div className="flex w-full h-full items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {uid && token ? 'Reset Your Password' : 'Forgot Password'}
          </h2>

          {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-lg">{success}</div>}

          {uid && token ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                  placeholder="Confirm new password"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isLoading ? 'bg-orange-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIdentifierType('email')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                      identifierType === 'email' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdentifierType('roll')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                      identifierType === 'roll' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Roll Number
                  </button>
                </div>
              </div>
            
              <form onSubmit={handleResetRequest} className="space-y-6">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    {identifierType === 'email' ? 'Institute Email' : 'Roll Number'}
                  </label>
                  <input
                    type={identifierType === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-300/50 border border-gray-600"
                    placeholder={
                      identifierType === 'email' 
                        ? 'user@iiitkottayam.ac.in' 
                        : 'YYYYgroupXXXX (e.g., 2024bcs1234)'
                    }
                    pattern={
                      identifierType === 'email' 
                        ? '.+@iiitkottayam\\.ac\\.in' 
                        : '(2021|2022|2023|2024)(bcs|bcd|bcy|bec)\\d{4}'
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isLoading ? 'bg-orange-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                  } text-white`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-orange-300 hover:text-orange-200 text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;