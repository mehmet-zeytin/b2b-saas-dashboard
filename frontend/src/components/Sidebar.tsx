import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Müşteriler / Klanten', path: '/customers', icon: Users },
    { name: 'İşlemler / Transacties', path: '/transactions', icon: CreditCard },
    { name: 'Ayarlar / Instellingen', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Logo / Başlık */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg text-white">AdminPanel</span>
        </div>

        {/* Navigasyon Menüsü */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Alt Çıkış Butonu */}
      <div className="border-t border-slate-800 pt-4">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span>{"Çıkış Yap / Uitloggen"}</span>
        </button>
      </div>
    </aside>
  );
}