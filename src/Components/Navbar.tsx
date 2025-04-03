import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Remove JWT tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Navigate to login page ("/")
    navigate('/');
  };
  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-white text-xl font-semibold">Insta Solve</h1>
            <p className="text-gray-400 text-sm">Hostel Complaint Management System</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition" onClick={() => navigate('/SDash')}>
              Dashboard
              </button>
            <button className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition" onClick={() => navigate('/SProfile')}>
           
              Profile
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-gray-800 text-red-500 hover:bg-gray-700 flex items-center gap-2 transition"
              onClick={handleLogout} // Added Logout Functionality
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
