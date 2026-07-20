import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen font-sans bg-slate-50 text-slate-900">
      
      {/* TR: Yan Menü (Sidebar) / NL: Zijmenu */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl">
        <div className="text-xl font-bold mb-10 text-sky-400 tracking-wide flex items-center gap-2">
          <span>🚀</span> SaaSCorp Admin
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <a href="#" className="flex items-center gap-3 text-white no-underline font-medium p-3 bg-slate-800 rounded-lg transition-colors">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white no-underline font-medium p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <span>👥</span> Müşteriler / Klanten
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white no-underline font-medium p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <span>💳</span> Faturalar / Facturen
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white no-underline font-medium p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <span>⚙️</span> Ayarlar / Instellingen
          </a>
        </nav>

        <div className="border-t border-slate-800 pt-4 text-sm text-slate-400 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">AY</div>
          <span>Ahmet Yılmaz</span>
        </div>
      </aside>

      {/* TR: Ana İçerik Alanı / NL: Hoofdinhoudsgebied */}
      <div className="flex-1 flex flex-col">
        
        {/* TR: Üst Bar (Navbar) / NL: Bovenste Balk */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="text-xl relative p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">🔔</button>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300">
              AY
            </div>
          </div>
        </header>

        {/* TR: Sayfa İçeriği / NL: Pagina-inhoud */}
        <main className="p-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}