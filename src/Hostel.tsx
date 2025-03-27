import { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';

interface Complaint {
  id: string;
  category: string;
  status: string;
}

function Hostel() {
  const [complaints] = useState<Complaint[]>([
    { id: '1', category: 'Plumbing', status: 'Resolved' },
    { id: '2', category: 'Electricity', status: 'Pending' },
  ]); // Add sample data or fetch from API
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      complaints.map((complaint) => Object.values(complaint).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "complaints.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Insta Solve</h1>
            <p className="text-gray-400 text-sm">Hostel Complaint Management System</p>
          </div>
          <nav className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white">Dashboard</button>
            <button className="bg-[#ff7849] text-white px-6 py-2 rounded-full">
              Complaints
            </button>
            <button className="flex items-center gap-2 text-red-500 bg-gray-800 px-4 py-2 rounded-lg">
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-[#2a2e35] p-6 rounded-lg">
            <div className="bg-[#3a3f48] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-400 mb-2">Total Complaints ( Weekly )</h3>
            <p className="text-4xl font-semibold">258</p>
          </div>
          <div className="bg-[#2a2e35] p-6 rounded-lg">
            <div className="bg-[#3a3f48] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-400 mb-2">Complaints Resolved ( This Week )</h3>
            <p className="text-4xl font-semibold">157</p>
          </div>
        </div>

        {/* Complaints Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl mb-1">Complaints ( 258 )</h2>
              <p className="text-gray-400 text-sm">View list of Complaints Below</p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search Here..."
                className="bg-white rounded-lg px-4 py-2 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg"
                onClick={downloadCSV}
              >
                <FileText size={18} />
                Download as CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#2a2e35] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#3a3f48] text-left">
                  <th className="p-4">Complaint ID.</th>
                  <th className="p-4">Complaint Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-t border-gray-700">
                      <td className="p-4">{complaint.id}</td>
                      <td className="p-4">{complaint.category}</td>
                      <td className="p-4">{complaint.status}</td>
                      <td className="p-4">
                        <button className="text-blue-400 hover:text-blue-300">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Hostel;