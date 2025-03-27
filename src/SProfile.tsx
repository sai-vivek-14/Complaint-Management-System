
import Navbar from './Components/Navbar';
import ProfileCard from './Components/ProfileCard';

function SProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <ProfileCard />
      </main>
    </div>
  );
}

export default SProfile;