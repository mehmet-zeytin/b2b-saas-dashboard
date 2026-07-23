import { useState, useEffect } from 'react';
import { UserPlus, Edit3, X, Check } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  status: string;
  spent: string;
}

const defaultCustomers: Customer[] = [
  { id: 1, name: 'Jan de Vries', email: 'jan@devries.nl', company: 'De Vries BV', status: 'Aktif / Actief', spent: '€1,250' },
  { id: 2, name: 'Ayşe Yılmaz', email: 'ayse@yilmaz.com', company: 'Yılmaz Logistics', status: 'Aktif / Actief', spent: '€850' },
  { id: 3, name: 'Klaas Bakker', email: 'klaas@bakker.nl', company: 'Bakker IT', status: 'Pasif / Inactief', spent: '€450' },
  { id: 4, name: 'Fatma Şahin', email: 'fatma@sahin.com', company: 'Şahin Design', status: 'Aktif / Actief', spent: '€2,100' },
];

export default function CustomersPage({ searchTerm = '' }: { searchTerm?: string }) {
  // Verileri localStorage'dan oku
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('app_customers');
    return saved ? JSON.parse(saved) : defaultCustomers;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    status: 'Aktif / Actief',
    spent: '€0',
  });

  // Müşteri listesi değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('app_customers', JSON.stringify(customers));
  }, [customers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', company: '', status: 'Aktif / Actief', spent: '€0' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      company: customer.company,
      status: customer.status,
      spent: customer.spent,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedList: Customer[];
    if (editingCustomer) {
      updatedList = customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...formData } : c
      );
    } else {
      const newCustomer: Customer = { id: Date.now(), ...formData };
      updatedList = [newCustomer, ...customers];
    }

    setCustomers(updatedList);
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Müşteriler / Klanten
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Müşteri listesini yönetin ve yeni kayıt ekleyin / Beheer uw klanten
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Yeni Müşteri / Nieuwe Klant
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Müşteri / Klant</th>
                <th className="p-4 font-semibold">Şirket / Bedrijf</th>
                <th className="p-4 font-semibold">Harcama / Uitgegeven</th>
                <th className="p-4 font-semibold">Durum / Status</th>
                <th className="p-4 font-semibold text-right">İşlem / Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{customer.name}</div>
                      <div className="text-xs text-slate-400">{customer.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">{customer.company}</td>
                    <td className="p-4 font-semibold text-slate-800">{customer.spent}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.status.includes('Aktif') || customer.status.includes('Actief')
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEditModal(customer)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Düzenle / Bewerken"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Müşteri bulunamadı. / Geen klanten gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCustomer ? 'Müşteri Düzenle / Klant Bewerken' : 'Yeni Müşteri / Nieuwe Klant'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad / Naam</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-posta / E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmet@firma.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Şirket / Bedrijf</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Yılmaz Teknoloji"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Durum / Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Aktif / Actief">Aktif / Actief</option>
                    <option value="Pasif / Inactief">Pasif / Inactief</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harcama / Uitgegeven</label>
                  <input
                    type="text"
                    value={formData.spent}
                    onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                    placeholder="€500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  İptal / Annuleren
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Kaydet / Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}