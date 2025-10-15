"use client";

export default function StatsCard({ label, value, icon: Icon, color }: any) {
  const gradients: Record<string, string> = {
    blue: "from-blue-600 to-blue-800",
    emerald: "from-emerald-600 to-emerald-800",
    purple: "from-purple-600 to-purple-800",
    green: "from-green-600 to-green-800",
  };

  const gradient = gradients[color] || "from-gray-700 to-gray-900";

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 shadow`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-white/80" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
