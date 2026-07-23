import { useState } from 'react';
import { User, Bell, Palette, Save, Check, Lock, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'theme'>('profile');
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Profil Formu Durumları
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'Sistem Yöneticisi / Systeembeheerder',
    currentPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: false,
    newCustomerAlert: true,
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaved(false);

    // Profil Sekmesinde Doğrulama (Validation)
    if (activeTab === 'profile') {
      if (!profile.name.trim() || !profile.email.trim()) {
        setErrorMessage('Lütfen tüm alanları doldurun. / Vul a.u.b. alle velden in.');
        return;
      }

      if (!profile.currentPassword) {
        setErrorMessage('Güvenlik için lütfen mevcut şifrenizi girin. / Vul uw huidige wachtwoord in voor de veiligheid.');
        return;
      }

      // Örnek Şifre Kontrolü (Varsayılan doğru şifre: admin123)
      if (profile.currentPassword !== 'admin123') {
        setErrorMessage('Mevcut şifreniz hatalı! / Uw huidige wachtwoord is onjuist!');
        return;
      }
    }

    // Başarılı Kayıt
    setSaved(true);
    setProfile({ ...profile, currentPassword: '' }); // Şifre alanını temizle
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Ayarlar / Instellingen
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hesap, bildirim ve görünüm tercihleriniz / Uw account-, meldingen- en weergavevoorkeuren
        </p>
      </div>

      {/* Sekme Menüsü */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setErrorMessage(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" /> Profil / Profiel
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('notifications'); setErrorMessage(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" /> Bildirimler / Meldingen
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('theme'); setErrorMessage(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'theme'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Palette className="w-4 h-4" /> Tema / Thema
        </button>
      </div>

      {/* Form Alanı */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Hata Mesajı Kutusui */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Profil Ayarları */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Profil Bilgileri / Profielgegevens</h2>
            
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad / Naam</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-posta / E-mail</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Rol / Rol</label>
                <input
                  type="text"
                  disabled
                  value={profile.role}
                  className="w-full px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg text-sm cursor-not-allowed"
                />
              </div>

              {/* Güvenlik Onayı Şifre Alanı */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> 
                  Mevcut Şifreniz / Huidige wachtwoord
                </label>
                <input
                  type="password"
                  placeholder="Değişiklikleri onaylamak için şifrenizi girin"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  (Test şifresi: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin123</code>)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Bildirim Ayarları */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Bildirim Tercihleri / Meldingsvoorkeuren</h2>
            <div className="space-y-3 max-w-md">
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <span className="text-sm font-medium text-slate-700">E-posta Bildirimleri / E-mailmeldingen</span>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Haftalık Raporlar / Wekelijkse rapporten</span>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Yeni Müşteri Uyarısı / Nieuwe klant melding</span>
                <input
                  type="checkbox"
                  checked={notifications.newCustomerAlert}
                  onChange={(e) => setNotifications({ ...notifications, newCustomerAlert: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* 3. Tema Ayarları */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Görünüm ve Tema / Weergave en Thema</h2>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer ${
                  theme === 'light' ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 bg-white border border-slate-300 rounded-full shadow-xs"></div>
                <span className="text-xs font-semibold">Açık / Licht</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer ${
                  theme === 'dark' ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 bg-slate-900 rounded-full"></div>
                <span className="text-xs font-semibold">Koyu / Donker</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer ${
                  theme === 'system' ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-white to-slate-900 border border-slate-300 rounded-full"></div>
                <span className="text-xs font-semibold">Sistem / Systeem</span>
              </button>
            </div>
          </div>
        )}

        {/* Kaydet Butonu ve Başarı Mesajı */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" /> Kaydet / Opslaan
          </button>

          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4" /> Güncellendi! / Bijgewerkt!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}