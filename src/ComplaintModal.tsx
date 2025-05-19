import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface Complaint {
  id: number;
  user: number;
  complaint_name: string;
  description: string;
  room_number: string;
  complaint_category: string;
  status: string;
  place: string;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  roll_number: string;
  student_name: string;
  hostel_name: string;
}

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, complaint }) => {
  if (!complaint) return null;

  const isImage = complaint.attachment?.match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50">
        <Dialog.Panel className="bg-white text-black rounded-2xl shadow-xl max-w-md w-full p-6 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
          <Dialog.Title className="text-xl font-bold mb-4">{complaint.complaint_name}</Dialog.Title>
          
          <p><strong>Student:</strong> {complaint.student_name} ({complaint.roll_number})</p>
          <p><strong>Room:</strong> {complaint.room_number}, {complaint.hostel_name}</p>
          <p><strong>Category:</strong> {complaint.complaint_category}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
          <p><strong>Place:</strong> {complaint.place}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Created:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(complaint.updated_at).toLocaleString()}</p>

          <div className="mt-4">
            <strong>Attachment:</strong><br />
            {complaint.attachment ? (
              isImage ? (
                <img
                  src={`http://127.0.0.1:8000${complaint.attachment}`}
                  alt="Attachment"
                  className="w-full max-h-64 object-contain rounded mt-2"
                />
              ) : (
                <a
                  href={`http://127.0.0.1:8000${complaint.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download File
                </a>
              )
            ) : (
              <p>No attachment</p>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ComplaintModal;
