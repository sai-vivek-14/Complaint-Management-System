import { useState, useEffect } from 'react';
import { FileText, LogOut, Download, Search } from 'lucide-react';
import axios from 'axios';
import { Link } from "react-router-dom";

function Wmain() {
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState({
    total_complaints_weekly: 0,
    resolved_this_week: 0
  });
  const [hostelStats, setHostelStats] = useState({
    hostel_name: '',
    current_occupancy: 0,
    available_space: 0
  });
  
  // Get CSRF token from cookies for Django
  function getCsrfToken() {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return "";
  }

  // Configure axios with CSRF token
  axios.defaults.headers.common['X-CSRFToken'] = getCsrfToken();
  axios.defaults.withCredentials = true;

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/warden/complaints/');
        // Since Django returns HTML, we need an API endpoint that returns JSON
        // This assumes you've added a new API endpoint in your Django backend
        const apiResponse = await axios.get('/warden/api/complaints-json/');
        setComplaints(apiResponse.data.complaints);
        setFilteredComplaints(apiResponse.data.complaints);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('/warden/api/complaint-statistics/');
        // Get weekly stats
        setStats({
          total_complaints_weekly: response.data.timeline.datasets.reduce(
            (sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0), 
            0
          ),
          resolved_this_week: response.data.timeline.datasets[2].data.reduce(
            (a, b) => a + b, 
            0
          )
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchHostelStats = async () => {
      try {
        const response = await axios.get('/warden/api/hostel-statistics/');
        setHostelStats(response.data);
      } catch (error) {
        console.error('Error fetching hostel stats:', error);
      }
    };

    fetchComplaints();
    fetchStats();
    fetchHostelStats();
  }, []);

  // Filter complaints based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(
        complaint => 
          complaint.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredComplaints(filtered);
    }
  }, [searchQuery, complaints]);

  // Handle status color based on status
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'assigned':
        return 'bg-blue-500/20 text-blue-500';
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    window.location.href = '/warden/export-complaints/';
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] text-gray-100">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#22262a]">
        <div>
          <h1 className="text-2xl font-semibold">Insta Solve</h1>
          <p className="text-sm text-gray-400">Hostel: {hostelStats.hostel_name} - Complaint Management System</p>
        </div>
        
        <div className="flex items-center space-x-8">
          <a href="/Wmain/" className="bg-[#ff7849] text-white px-6 py-2 rounded-full">
            Dashboard
          </a>
          <a href="/WProfile/" className="text-gray-400 hover:text-white">
            Profile
          </a>
          <Link to="/Wmain" className="bg-[#ff7849] text-white px-6 py-2 rounded-full">
  Dashboard
</Link>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="px-8 py-6 grid grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-[#22262a] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-400 mb-2">Total Complaints ( Weekly )</h3>
          <p className="text-4xl font-semibold">{stats.total_complaints_weekly}</p>
        </div>
        
        <div className="bg-[#22262a] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-400 mb-2">Complaints Resolved ( This Week )</h3>
          <p className="text-4xl font-semibold">{stats.resolved_this_week}</p>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Complaints ( {complaints.length} )</h2>
            <p className="text-sm text-gray-400">View list of Complaints Below</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Here"
                className="pl-10 pr-4 py-2 bg-white rounded-lg w-80 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg"
              onClick={handleExportCSV}
            >
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
                <th className="px-6 py-4">Complainant's Name</th>
                <th className="px-6 py-4">Complaint ID</th>
                <th className="px-6 py-4">Complaint Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-gray-700">
                  <td className="px-6 py-4">{complaint.student}</td>
                  <td className="px-6 py-4">{complaint.id}</td>
                  <td className="px-6 py-4">{complaint.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${getStatusColor(complaint.status)} rounded-full`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`/warden/complaints/${complaint.id}/`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No complaints found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Wmain;