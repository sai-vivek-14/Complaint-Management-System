import React from 'react';

const ProfileCard = () => {
  return (
    <div className="mt-12 bg-gray-800 p-6 rounded-lg shadow-lg max-w-xs mx-auto">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop"
            alt="Shashank's Profile"
            className="w-24 h-24 rounded-full border-4 border-orange-500"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white">Shashank</h2>
          <p className="text-gray-400">2023BCY0037</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {/* Email Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mail:</p>
          <p className="text-gray-400">
            <a href="mailto:shashank.2023bcy0037@example.com" className="underline hover:text-orange-500">
              shashank.2023bcy0037@example.com
            </a>
          </p>
        </div>
        {/* Mobile Number Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mobile Number:</p>
          <p className="text-gray-400">
            <a href="tel:+919876543210" className="underline hover:text-orange-500">
              +91 9876543210
            </a>
          </p>
        </div>
        {/* Room Number Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Room Number:</p>
          <p className="text-gray-400">A102</p> {/* Example Room Number */}
        </div>
        {/* Hostel Section */}
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Hostel:</p>
          <p className="text-gray-400">Sunrise Hostel</p> {/* Example Hostel Name */}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;