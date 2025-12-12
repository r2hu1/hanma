export function Stats() {
  const stats = [
    { label: "Active Snippets", value: "10+" },
    { label: "Frameworks Support", value: "4+" },
    { label: "Type Safety", value: "100%" },
    { label: "GitHub Stars", value: "100+" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 border-t border-neutral-900">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl text-center hover:bg-neutral-900/50 transition-colors">
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-neutral-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
