import { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  customerName: string;
  email: string;
  amount: string;
  date: string;
  status: string;
}

export default function TransactionsTable({ searchTerm = '' }: { searchTerm?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Müşteriler sayfasında kaydedilen verileri al
    const savedCustomers = localStorage.getItem('app_customers');
    if (savedCustomers) {
      const customers = JSON.parse(savedCustomers);
      
      const generatedTransactions = customers.map((c: any, index: number) => ({
        id: c.id || index + 1,
        customerName: c.name,
        email: c.email,
        amount: c.spent && c.spent !== '€0' ? c.spent : '€250',
        date: new Date().toISOString().split('T')[0],
        status: c.status.includes('Aktif') || c.status.includes('Actief') ? 'Tamamlandı / Voltooid' : 'Bekliyor / In afwachting',
      }));

      setTransactions(generatedTransactions);
    }
  }, []);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-base">Son İşlemler / Recente Transacties</h2>
        <span className="text-xs text-slate-400">Canlı Veri / Live Gegevens</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">Müşteri / Klant</th>
              <th className="p-4 font-semibold">Tutar / Bedrag</th>
              <th className="p-4 font-semibold">Tarih / Datum</th>
              <th className="p-4 font-semibold">Durum / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{t.customerName}</div>
                    <div className="text-xs text-slate-400">{t.email}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{t.amount}</td>
                  <td className="p-4 text-slate-500">{t.date}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        t.status.includes('Tamamlandı') || t.status.includes('Voltooid')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  İşlem bulunamadı. / Geen transacties gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}