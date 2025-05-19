import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

export function ComplaintChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/complaints-per-student/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`, // if using token auth
      },
    })
    .then(res => {
      const formattedData = res.data.map((item: any) => ({
        name: item.user__roll_number,
        complaints: item.complaint_count,
      }));
      setData(formattedData);
    })
    .catch(err => {
      console.error("Error fetching chart data:", err);
    });
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-gray-300 mb-4">COMPLAINTS PER STUDENT</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12, angle: -30 }} />
            <YAxis stroke="#9CA3AF" />
            <Bar dataKey="complaints" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
