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
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentComplaintId, setCurrentComplaintId] = useState<number | null>(null);

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

  // FIXED: Remove API call from handleReject, only show popup
  const handleReject = (complaintId: number) => {
    setCurrentComplaintId(complaintId);
    setShowRejectPopup(true);
    setRejectionReason('');
  };

  // FIXED: Add API call to confirmReject
  const confirmReject = () => {
    if (rejectionReason.trim() && currentComplaintId) {
      axios.post(`/api/warden/complaints/${currentComplaintId}/reject/`, 
        { reason: rejectionReason }, // Send reason in request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(() => {
        setComplaints(prev =>
          prev.map(c =>
            c.id === currentComplaintId ? { ...c, status: 'Rejected' } : c
          )
        );
        setShowRejectPopup(false);
        setRejectionReason('');
        setCurrentComplaintId(null);
      }).catch(err => console.error('Rejection failed:', err));
    } else {
      alert('Please provide a reason for rejection');
    }
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
      c.status
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${complaint.status.toLowerCase() === 'resolved' ? 'bg-green-500/20 text-green-400' :
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
                        <div className="flex gap-3">
                          <button
                            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={() => handleApprove(complaint.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => handleReject(complaint.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-medium ${complaint.status.toLowerCase() === 'in progress' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {complaint.status.toLowerCase() === 'in progress' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIXED: Proper JSX syntax for popup */}
      {showRejectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Reject Complaint</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-none text-black"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this complaint..."
            />
            <div className="flex gap-3 mt-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmReject}
              >
                Confirm Reject
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowRejectPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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