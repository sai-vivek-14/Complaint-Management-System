import { useEffect, useState } from 'react';
import { FileText, Download, Search, X } from 'lucide-react';
import Navbarr from './Components/Navbarr';
import { useAuth } from './auth/AuthContext';
import axios from 'axios';
import { saveAs } from 'file-saver';

interface Complaint {
  id: number;
  user: number;
  complaint_name: string;
  description: string;
  room_number: string;
  complaint_category: string;
  status: string;
  place: string;
  attachment: string;
  created_at: string;
  updated_at: string;
  roll_number: string;
  student_name: string;
  hostel_name: string;
}

function Wmain() {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (user?.user_type === 'warden') {
      axios.get('/api/warden/complaints/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching complaints:', err);
        setLoading(false);
      });
    }
  }, [user, token]);

  const handleApprove = (complaintId: number) => {
    axios.post(`/api/warden/complaints/${complaintId}/approve/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId ? { ...c, status: 'In Progress' } : c
        )
      );
    }).catch(err => console.error('Approval failed:', err));
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Roll Number', 'Student Name', 'Hostel', 'Complaint Name', 'Category', 'Status', 'Room Number', 'Place', 'Description'];
    const rows = complaints.map(c => [
      c.id,
      c.roll_number,
      c.student_name,
      c.hostel_name,
      c.complaint_name,
      c.complaint_category,
      c.status,
      c.room_number,
      c.place,
      c.description.replace(/,/g, ';'),
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'complaints.csv');
  };

  const filteredComplaints = complaints.filter(c =>
    c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.complaint_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a1d21] text-gray-100">
      <Navbarr />

      <div className="px-8 py-6 grid grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-[#22262a] p-6 rounded-lg">
          <FileText className="w-6 h-6 text-gray-400 mb-2" />
          <h3 className="text-gray-400">Total Complaints</h3>
          <p className="text-4xl font-semibold">{complaints.length}</p>
        </div>

        <div className="bg-[#22262a] p-6 rounded-lg">
          <FileText className="w-6 h-6 text-gray-400 mb-2" />
          <h3 className="text-gray-400">Complaints Resolved</h3>
          <p className="text-4xl font-semibold">{complaints.filter(c => c.status.toLowerCase() === 'resolved').length}</p>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Complaints</h2>
            <p className="text-sm text-gray-400">View list of Complaints Below</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              
            </div>
            <button
              className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg"
              onClick={downloadCSV}
            >
              <Download className="w-5 h-5" />
              <span>Download as CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-[#22262a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Complaint Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Attachment</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-gray-700">
                    <td className="px-6 py-4">{complaint.roll_number}</td>
                    <td className="px-6 py-4">{complaint.complaint_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        complaint.status.toLowerCase() === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        complaint.status.toLowerCase() === 'in progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.status.toLowerCase() === 'pending' ? (
                        <button
                          className="px-4 py-1 bg-green-600 rounded hover:bg-green-700"
                          onClick={() => handleApprove(complaint.id)}
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 w-[500px] relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              onClick={() => setSelectedComplaint(null)}
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">Complaint Details</h2>
            <p><strong>Roll Number:</strong> {selectedComplaint.roll_number}</p>
            <p><strong>Student Name:</strong> {selectedComplaint.student_name}</p>
            <p><strong>Hostel:</strong> {selectedComplaint.hostel_name}</p>
            <p><strong>Complaint Name:</strong> {selectedComplaint.complaint_name}</p>
            <p><strong>Category:</strong> {selectedComplaint.complaint_category}</p>
            <p><strong>Status:</strong> {selectedComplaint.status}</p>
            <p><strong>Room Number:</strong> {selectedComplaint.room_number}</p>
            <p><strong>Place:</strong> {selectedComplaint.place}</p>
            <p><strong>Description:</strong> {selectedComplaint.description}</p>
            <p className="mt-2">
              <strong>Attachment:</strong>{' '}
              {selectedComplaint.attachment ? (
                <a
                  href={`http://127.0.0.1:8000${selectedComplaint.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View File
                </a>
              ) : (
                'No attachment'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wmain;
