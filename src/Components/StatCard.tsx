
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-gray-400 mb-2">{title}</h3>
      <div className="text-5xl font-bold text-orange-500 mb-2">{value}</div>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}