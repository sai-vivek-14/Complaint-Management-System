
import { LogOut } from 'lucide-react';

function WProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-semibold">Insta Solve</h1>
          <p className="text-gray-400 text-sm">Hostel Complaint Management System</p>
        </div>
        
        <nav className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-300 transition">
            Dashboard
          </button>
          <button className="bg-[#ff7849] text-white px-6 py-2 rounded-full hover:bg-[#ff6830] transition">
            Profile
          </button>
          <button className="flex items-center gap-2 text-red-500 hover:text-red-400 transition ml-4">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Profile Section */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#ff7849]">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"
              alt="Warden profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl text-white font-semibold">Warden</h2>
            <p className="text-gray-400">XYV</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="text-white">
          <div className="mb-4">
            <label className="block text-lg mb-2">Mail</label>
            <label className="block text-lg">Number :</label>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WProfile;