import React from 'react';

const ProfileCard = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-orange-500"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white">Shashank</h2>
          <p className="text-gray-400">2023BCY0037</p>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mail :</p>
          <p className="text-gray-400">shashank.2023bcy0037@example.com</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-white font-medium w-36">Mobile Number :</p>
          <p className="text-gray-400">+91 9876543210</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;