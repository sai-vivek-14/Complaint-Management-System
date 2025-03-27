import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Source A', complaints: 28 },
  { name: 'Source B', complaints: 35 },
  { name: 'Source C', complaints: 32 },
  { name: 'Source D', complaints: 28 },
  { name: 'Source E', complaints: 30 },
  { name: 'Source F', complaints: 45 },
];

export function ComplaintChart() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-gray-300 mb-4">COMPLAINT CATEGORY</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Bar dataKey="complaints" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}