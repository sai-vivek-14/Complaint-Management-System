import { useState, useEffect } from 'react';
import { Header } from './Components/Header';
import { StatCard } from './Components/StatCard';
import { ComplaintChart } from './Components/ComplaintChart';
import { StatusDonut } from './Components/StatusDonut';

function HDash() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedRate: 0,
  });

  useEffect(() => {
    // Fetch data from an API
    fetch('/api/dashboard-stats')
      .then((response) => response.json())
      .then((data) => {
        setStats({
          totalComplaints: data.totalComplaints,
          activeComplaints: data.activeComplaints,
          resolvedRate: data.resolvedRate,
        });
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="SEMESTER REPORT"
            value={stats.totalComplaints.toString()}
            subtitle="Complaints were registered"
          />
          <StatCard 
            title="ACTIVE COMPLAINTS"
            value={stats.activeComplaints.toString()}
            subtitle="Currently being processed"
          />
          <StatCard 
            title="RESOLVED RATE"
            value={`${stats.resolvedRate}%`}
            subtitle="Average resolution time: 48h"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComplaintChart />
          <StatusDonut />
        </div>
      </main>
    </div>
  );
}

export default HDash;