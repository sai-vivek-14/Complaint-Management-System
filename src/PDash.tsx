
import Navbar from './Components/Navbar';
import ComplaintsDashboard from './Components/ComplaintsDashboard';

function PDash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4">
        <ComplaintsDashboard />
      </main>
    </div>
  );
}

export default PDash;