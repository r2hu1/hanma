import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

function Counter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString() + "+");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function Stats() {
  const [stars, setStars] = useState(100);
  const [contributors, setContributors] = useState(5);
  
  useEffect(() => {
    // Fetch GitHub Stars
    fetch("https://api.github.com/repos/itstheanurag/hanma")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count) setStars(data.stargazers_count);
      })
      .catch((err) => console.error("Failed to fetch stars", err));

    // Fetch Contributors (simple count of first page for now)
    fetch("https://api.github.com/repos/itstheanurag/hanma/contributors?per_page=1&anon=true")
      .then((_) => {
        return fetch("https://api.github.com/repos/itstheanurag/hanma/contributors?per_page=100&anon=true");
      })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setContributors(data.length);
      })
      .catch((err) => console.error("Failed to fetch contributors", err));
  }, []);

  const stats = [
    { label: "Active Snippets", value: 10 },
    { label: "Frameworks Support", value: 4 },
    { label: "Type Safety", value: 100 }, // Special case handling needed for %
    { label: "GitHub Stars", value: stars },
    { label: "Contributors", value: contributors },
  ];

  return (
    <div className="container mx-auto px-4 py-16 border-t border-neutral-900">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((stat) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            key={stat.label}
            className="p-6 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl text-center hover:bg-neutral-900/50 transition-colors"
          >
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent mb-2">
              {stat.label === "Type Safety" ? (
                "100%"
              ) : (
                <Counter value={stat.value} />
              )}
            </div>
            <div className="text-sm font-medium text-neutral-500">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
