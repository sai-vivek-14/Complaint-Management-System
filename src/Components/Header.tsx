
import { LogOut } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-white">Insta Solve</h1>
        <p className="text-gray-400">Hostel Complaint Management System</p>
      </div>
      
      <nav className="flex items-center space-x-8">
        <a href="#" className="text-white bg-orange-500 px-6 py-2 rounded-full">Dashboard</a>
        <a href="#" className="text-gray-300 hover:text-white">Complaints</a>
        <button className="flex items-center text-red-500 hover:text-red-400">
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </nav>
    </header>
  );
}