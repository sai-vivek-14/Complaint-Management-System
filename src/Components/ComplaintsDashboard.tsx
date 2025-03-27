import React from 'react';
import { Search, Download, FileText } from 'lucide-react';

const ComplaintsDashboard = () => {
  return (
    <div className="mt-8">
      <div className="text-gray-400 mb-6">
        Time: 0:0
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg border border-gray-700">
              <FileText className="text-gray-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Complaints Complaints Resolved</p>
              <h3 className="text-white text-2xl font-semibold">258</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg border border-gray-700">
              <FileText className="text-gray-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Complaints Pending</p>
              <h3 className="text-white text-2xl font-semibold">157</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Assigned Complaints ( 258 )</h2>
          <p className="text-gray-400 text-sm">View list of Complaints Below</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Here"
              className="pl-10 pr-4 py-2 w-[400px] rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <button className="px-4 py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-100 flex items-center gap-2 transition">
            <Download size={20} />
            Download as CSV
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 py-4 px-6">Complaint ID.</th>
              <th className="text-left text-gray-400 py-4 px-6">Complaint Category</th>
              <th className="text-left text-gray-400 py-4 px-6">Place</th>
              <th className="text-left text-gray-400 py-4 px-6">Details</th>
              <th className="text-left text-gray-400 py-4 px-6">Upload of Proof</th>
            </tr>
          </thead>
          <tbody>
            {/* Table rows will be populated with data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComplaintsDashboard;