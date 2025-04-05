
import Navbarr from './Components/Navbarr';
import ProfileCard from './Components/ProfileCard';

function WProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbarr />
      <main className="container mx-auto px-4 py-8">
        <ProfileCard />
      </main>
    </div>
  );
}

export default WProfile;