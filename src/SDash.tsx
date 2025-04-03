import { useState, useEffect } from 'react';
import { LogOut, Upload, Search, FileText, X } from 'lucide-react';
import axios from 'axios';
import Navbar from './Components/Navbar';

interface Complaint {
  id: string;
  complaint_name: string;
  complaint_category: string;
  status: string;
  room_number: string;
  description: string;
  place: string;
  attachment?: string;
  created_at?: string;
}

function SDash() {
  // Form states
  const [complaintName, setComplaintName] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('default');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // Complaint list states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/complaints/');
      setComplaints(response.data);
    } catch (error) {
      setError('Failed to fetch complaints');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('complaint_name', complaintName);
    formData.append('complaint_category', complaintCategory);
    formData.append('room_number', roomNumber);
    formData.append('description', description);
    formData.append('place', place);
    if (attachment) formData.append('attachment', attachment);

    try {
      await axios.post('http://localhost:8000/api/complaints/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Reset form and refresh list
      setComplaintName('');
      setComplaintCategory('default');
      setRoomNumber('');
      setDescription('');
      setPlace('');
      setAttachment(null);
      await fetchComplaints();
    } catch (error) {
      setError('Submission failed. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => 
    complaint.complaint_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.complaint_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a1d21] text-gray-100">
      {/* Header (unchanged) */}
      <header className="border-b border-gray-700 p-4">
        <Navbar />
      </header>

      <main className="container mx-auto p-8">
        {/* COMPLAINT FORM SECTION - FULLY INTACT */}
        <form onSubmit={handleSubmit} className="bg-[#22262b] rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText size={20} />
            <h2 className="text-xl font-semibold">Raise a Complaint</h2>
          </div>

          {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
  <label className="block text-sm text-gray-400 mb-2">Complaint Name</label>
  <input
    type="text"
    value={complaintName}
    onChange={(e) => {
      const value = e.target.value;
      // Only allow letters and spaces, and limit to 45 characters
      if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 45) {
        setComplaintName(value);
      }
    }}
    className="w-full bg-[#2a2f35] border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-[#ff7849]"
    required
    maxLength={45}
    placeholder="Enter complaint name (letters only)"
  />
  {complaintName.length >= 45 && (
    <p className="text-xs text-red-500 mt-1">Maximum 45 characters reached</p>
  )}
</div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                className="w-full bg-[#2a2f35] border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-[#ff7849]"
                required
              >
                <option value="default" disabled>Select category</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpenting">Carpenting</option>
                <option value="Water Filter">Water Filter</option>
                <option value="Bathroom Clogging">Bathroom Clogging</option>
              </select>
            </div>

            <div>
  <label className="block text-sm text-gray-400 mb-2">Room Number</label>
  <input
    type="text"
    value={roomNumber}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();
      // More permissive pattern that still guides toward correct format
      if (value === "" || /^[A-D][A-D]?[0-9]{0,3}$/.test(value)) {
        setRoomNumber(value);
      }
    }}
    className="w-full bg-[#2a2f35] border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-[#ff7849]"
    required
    placeholder="e.g., AA101, BB202"
    pattern="[A-D][A-D](1[0-9][0-9]|2[0-3][0-9]|4[0-3][0-9])"
    title="Please enter a valid room number (e.g., AA101, BB230)"
  />
</div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Place/Location</label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full bg-[#2a2f35] border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-[#ff7849]"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#2a2f35] border border-gray-700 rounded-lg p-2 h-32 focus:outline-none focus:border-[#ff7849]"
                required
              />
            </div>

            <div className="flex flex-col items-center justify-center">
              <label className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center w-full cursor-pointer">
                <Upload className="mx-auto mb-2" size={24} />
                <p className="text-sm text-gray-400">
                  {attachment ? attachment.name : 'Click to upload file'}
                </p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              </label>
              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-4 px-8 py-2 bg-[#ff7849] rounded-full text-white disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            
          </div>
        </form>

        {/* COMPLAINTS LIST SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Complaints History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white rounded-lg text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Loading and error states */}
          {isLoading ? (
            <div className="text-center p-8">Loading complaints...</div>
          ) : error ? (
            <div className="text-center p-8 text-red-400">{error}</div>
          ) : (
            <div className="bg-[#22262b] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4">Complaint</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Room</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="border-b border-gray-700">
                        <td className="p-4">{complaint.complaint_name}</td>
                        <td className="p-4">{complaint.complaint_category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            complaint.status === 'Resolved' ? 'bg-green-900 text-green-200' :
                            complaint.status === 'In Progress' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-red-900 text-red-200'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="p-4">{complaint.room_number}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowModal(true);
                            }}
                            className="text-[#ff7849] hover:text-[#ff9069]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-gray-400">
                        No complaints found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* DETAILS MODAL */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#22262b] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 p-4">
              <h3 className="text-xl font-semibold">Complaint Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-lg">{selectedComplaint.complaint_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-lg">{selectedComplaint.complaint_category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Room</p>
                  <p className="text-lg">{selectedComplaint.room_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className={`text-lg ${
                    selectedComplaint.status === 'Resolved' ? 'text-green-400' :
                    selectedComplaint.status === 'In Progress' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {selectedComplaint.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Place</p>
                  <p className="text-lg">{selectedComplaint.place}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-lg">
                    {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="bg-[#2a2f35] p-3 rounded-lg mt-1">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.attachment && (
                <div>
                  <p className="text-sm text-gray-400">Attachment</p>
                  <div className="bg-[#2a2f35] p-4 rounded-lg mt-1">
                    {selectedComplaint.attachment.match(/\.(jpg|jpeg|png)$/) ? (
                      <img 
                        src={`http://127.0.0.1:8000/${selectedComplaint.attachment}`} 
                        alt="Attachment" 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <a 
                        href={`http://localhost:8000/${selectedComplaint.attachment}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#ff7849] hover:underline"
                      >
                        Download Attachment
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 p-4 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#ff7849] rounded-lg hover:bg-[#ff9069]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SDash;