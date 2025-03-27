import  { useState } from 'react';
import { FileText, LogOut, Download, Search } from 'lucide-react';

function Wmain() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the table
  const complaints = [
    {
      id: 'COMP001',
      name: 'John Doe',
      category: 'Maintenance',
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?auto=format&fit=crop&q=80&w=100'
    },
    // Add more mock data as needed
  ];

  return (
    <div className="min-h-screen bg-[#1a1d21] text-gray-100">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#22262a]">
        <div>
          <h1 className="text-2xl font-semibold">Insta Solve</h1>
          <p className="text-sm text-gray-400">Hostel Complaint Management System</p>
        </div>
        
        <div className="flex items-center space-x-8">
          <button className="bg-[#ff7849] text-white px-6 py-2 rounded-full">
            Dashboard
          </button>
          <button className="text-gray-400 hover:text-white">
            Profile
          </button>
          <button className="flex items-center text-red-500 hover:text-red-400">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="px-8 py-6 grid grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-[#22262a] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-400 mb-2">Total Complaints ( Weekly )</h3>
          <p className="text-4xl font-semibold">258</p>
        </div>
        
        <div className="bg-[#22262a] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-400 mb-2">Complaints Resolved ( This Week )</h3>
          <p className="text-4xl font-semibold">157</p>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Complaints ( 258 )</h2>
            <p className="text-sm text-gray-400">View list of Complaints Below</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Here"
                className="pl-10 pr-4 py-2 bg-white rounded-lg w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg">
              <Download className="w-5 h-5" />
              <span>Download as CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#22262a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="px-6 py-4">Complainants Name</th>
                <th className="px-6 py-4">Complaint ID.</th>
                <th className="px-6 py-4">Complaint Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Image</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-gray-700">
                  <td className="px-6 py-4">{complaint.name}</td>
                  <td className="px-6 py-4">{complaint.id}</td>
                  <td className="px-6 py-4">{complaint.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full">
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <img
                      src={complaint.image}
                      alt="Complaint"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Wmain;