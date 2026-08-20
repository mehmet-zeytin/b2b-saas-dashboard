import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import TransactionsTable from "../components/transactions/TransactionsTable";
import { getDashboardStats } from "../services/stats.service";
import type { DashboardStat } from "../types/stats.types";
import AnalysisChart from "../components/dashboard/AnalysisChart";

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardStats();

      setStats(data);
    } catch (loadError) {
      console.error(
        "Fout bij het laden van dashboardstatistieken:",
        loadError,
      );

      setError(
        "De dashboardstatistieken konden niet worden geladen.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Overzicht
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Bekijk de actuele bedrijfsgegevens, verkopen en betalingen.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Vernieuwen
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && stats.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Dashboard wordt geladen...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              stat={stat}
            />
          ))}
        </div>
      )}

      <div className="w-full">       
        <AnalysisChart />
      </div>

      <TransactionsTable />
    </div>
  );
}