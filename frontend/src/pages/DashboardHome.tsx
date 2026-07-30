import { useState, useEffect } from 'react';
import RevenueChart from '../components/RevenueChart';
import TransactionsTable from '../components/TransactionsTable';

interface StatItem {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function DashboardHome({ searchTerm = '' }: { searchTerm?: string }) {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const savedCustomers = localStorage.getItem('app_customers');
    const customers = savedCustomers ? JSON.parse(savedCustomers) : [];

    let totalRevenue = 0;
    let activeCount = 0;

    customers.forEach((c: any) => {
      const statusText = String(c.status || '').toLowerCase();
      
      // KESİN KURAL: Sadece "Tamamlandı", "Voltooid", "Aktif" veya "Actief" olanlar gelire dahil edilecek.
      // "Bekliyor" veya "In afwachting" veya "Pasif" olanlar kesinlikle hesaba KATILMAYACAK.
      const isConfirmedActive = 
        statusText.includes('tamamlandı') || 
        statusText.includes('voltooid') || 
        statusText.includes('aktif') || 
        statusText.includes('actief');

      const matchesSearch = searchTerm 
        ? (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) 
        : true;

      if (isConfirmedActive) {
        activeCount += 1;

        if (matchesSearch && c.spent) {
          const rawDigits = String(c.spent).replace(/[^0-9]/g, '');
          const val = parseInt(rawDigits, 10);
          if (!isNaN(val)) {
            totalRevenue += val;
          }
        }
      }
    });

    const formattedRevenue = new Intl.NumberFormat('de-DE').format(totalRevenue);

    setStats([
      {
        title: searchTerm ? `Gelir (${searchTerm})` : 'Toplam Gelir (Onaylanan)',
        value: `€${formattedRevenue}`,
        change: '+12.5%',
        isPositive: true,
      },
      {
        title: 'Aktif Müşteriler / Actieve Klanten',
        value: activeCount.toString(),
        change: '+4.1%',
        isPositive: true,
      },
      {
        title: 'Toplam Müşteri / Totaal Klanten',
        value: customers.length.toString(),
        change: '+8.2%',
        isPositive: true,
      },
    ]);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Genel Bakış / Overzicht
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat: StatItem, index: number) => {
          const badgeStyle = stat.isPositive 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-rose-100 text-rose-700";

          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + badgeStyle}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <RevenueChart searchTerm={searchTerm} />
      <TransactionsTable searchTerm={searchTerm} />
    </div>
  );
}