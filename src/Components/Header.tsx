import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/'); // Redirect to login
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-white">Insta Solve</h1>
        <p className="text-gray-400">Hostel Complaint Management System</p>
      </div>

      <nav className="flex items-center space-x-8">
        
        
        <button
          onClick={handleLogout}
          className="flex items-center text-red-500 hover:text-red-400"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </nav>
    </header>
  );
}
