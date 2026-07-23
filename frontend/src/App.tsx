import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RevenueChart from './components/RevenueChart';
import TransactionsTable from './components/TransactionsTable';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';

interface StatItem {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function DashboardHome({ searchTerm }: { searchTerm: string }) {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    // LocalStorage'dan kayıtlı müşterileri oku
    const savedCustomers = localStorage.getItem('app_customers');
    const customers = savedCustomers ? JSON.parse(savedCustomers) : [];

    // Müşterilerden Toplam Geliri ve Aktif Sayısını Hesapla
    let totalRevenue = 0;
    let activeCount = 0;

    customers.forEach((c: any) => {
      const amount = parseFloat(c.spent ? c.spent.replace(/[^0-9.-]+/g, '') : '0') || 0;
      totalRevenue += amount;

      if (c.status && (c.status.includes('Aktif') || c.status.includes('Actief'))) {
        activeCount += 1;
      }
    });

    setStats([
      {
        title: 'Toplam Gelir / Totale Omzet',
        value: `€${totalRevenue.toLocaleString()}`,
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
  }, []);

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

      {/* DÜZELTME: filterText yerine searchTerm geçiyoruz */}
      <RevenueChart searchTerm={searchTerm} />
      <TransactionsTable searchTerm={searchTerm} />
    </div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          onLogout={handleLogout} 
        />

        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome searchTerm={searchTerm} />} />
            <Route path="/customers" element={<CustomersPage searchTerm={searchTerm} />} />
            <Route path="/transactions" element={<TransactionsPage searchTerm={searchTerm} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}