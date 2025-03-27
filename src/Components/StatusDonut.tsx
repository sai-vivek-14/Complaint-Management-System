import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Solved', value: 45 },
  { name: 'Unsolved', value: 30 },
  { name: 'Rejected', value: 25 },
];

const COLORS = ['#22C55E', '#EC4899', '#EF4444'];

export function StatusDonut() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-gray-300 mb-4">SEMESTER REPORT</h3>
      <p className="text-gray-400 mb-4">Solved and Unsolved Complaints</p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-6">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className="text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}