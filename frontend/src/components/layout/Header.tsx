import { Search, Bell, User, LogOut } from 'lucide-react';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
}

export default function Header({ searchTerm = '', onSearchChange, onLogout }: HeaderProps) {
  // Kayıtlı aktif kullanıcı bilgisini çek
  const savedUser = localStorage.getItem('currentUser');
  const currentUser = savedUser ? JSON.parse(savedUser) : { name: 'Kullanıcı', email: 'user@company.com' };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Ara... / Zoeken..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          {/* Çıkış Yap Butonu */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Çıkış Yap / Uitloggen"
              className="ml-2 p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}