import type { DashboardStat } from "../../types/stats.types";

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3 className="stat-card__title">{stat.title}</h3>

      <p className="stat-card__value">{stat.value}</p>

      <span
        className={
          stat.isPositive
            ? "stat-card__change stat-card__change--positive"
            : "stat-card__change stat-card__change--negative"
        }
      >
        {stat.change}
      </span>
    </div>
  );
}