import { useState } from 'react';
import DashboardLayout from './DashboardLayout';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function MetricCard({ title, value, change, isPositive }: MetricCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-200 transition-all hover:shadow-md">
      <h3 className="text-slate-500 text-sm font-medium mb-2">{title}</h3>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
      <span className={`text-xs font-semibold mt-2 inline-flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '↑' : '↓'} {change}
      </span>
    </div>
  );
}

interface Customer {
  id: number;
  name: string;
  company: string;
  plan: string;
  status: 'Aktif' | 'Pasif';
  revenue: string;
}

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: "Jan de Vries", company: "Vries Tech NL", plan: "Enterprise", status: "Aktif", revenue: "€1200/ay" },
    { id: 2, name: "Elif Yılmaz", company: "Istanbul Logistic", plan: "Startup", status: "Aktif", revenue: "€299/ay" },
    { id: 3, name: "John Doe", company: "Global Corp LLC", plan: "Enterprise", status: "Pasif", revenue: "€0/ay" },
  ]);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState('Startup');
  const [revenue, setRevenue] = useState('');

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !revenue) return alert("Lütfen tüm alanları doldurun! / Vul aanzienlijk alle velden in!");

    const newCustomer: Customer = {
      id: Date.now(),
      name,
      company,
      plan,
      status: 'Aktif',
      revenue: `€${revenue}/ay`
    };

    setCustomers([newCustomer, ...customers]);
    setName('');
    setCompany('');
    setRevenue('');
  };

  return (
    <DashboardLayout>
      {/* Başlık Bölümü */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950 tracking-tight mb-1">B2B SaaS Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm">Şirketinizin genel performans durumu / Algemene prestatiestatus van uw bedrijf</p>
      </header>

      {/* Metrik Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Toplam Gelir / Totale Omzet" 
          value={`€${(customers.reduce((acc, c) => acc + (c.status === 'Aktif' ? parseInt(c.revenue.replace(/[^0-9]/g, '')) : 0), 0)).toLocaleString()}/ay`} 
          change="12.5%" 
          isPositive={true} 
        />
        <MetricCard 
          title="Aktif Müşteriler / Actieve Klanten" 
          value={customers.filter(c => c.status === 'Aktif').length.toString()} 
          change="+1" 
          isPositive={true} 
        />
        <MetricCard 
          title="Abonelik İptalleri / Churn Rate" 
          value="2.4%" 
          change="0.8%" 
          isPositive={false} 
        />
      </div>

      {/* Form Alanı */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Yeni Müşteri Ekle / Nieuwe Klant Toevoegen</h2>
        <form onSubmit={handleAddCustomer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Müşteri Adı / Naam</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-blue-500" placeholder="Jan de Vries" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Şirket / Bedrijf</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-blue-500" placeholder="TechCorp NL" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:border-blue-500">
              <option value="Startup">Startup</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Aylık Ücret / Prijs (€)</label>
            <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-blue-500" placeholder="299" />
          </div>
          <button type="submit" className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs">
            + Ekle / Toevoegen
          </button>
        </form>
      </div>

      {/* Tablo Alanı */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Müşteri Listesi / Klantenlijst</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Müşteri / Klant</th>
                <th className="px-6 py-4">Şirket / Bedrijf</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Durum / Status</th>
                <th className="px-6 py-4">Gelir / Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{customer.name}</td>
                  <td className="px-6 py-4">{customer.company}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {customer.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      customer.status === 'Aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{customer.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}