import { useState } from 'react';
import { Lock, Mail, AlertCircle, LogIn, UserPlus, User, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Kayıtlı kullanıcıları localStorage'dan al / Get users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('app_users');
    return users ? JSON.parse(users) : [];
  };

  // Giriş Yap İşlemi / Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const users = getUsers();
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      setError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı! / Geen gebruiker gevonden met dit e-mailadres!');
      return;
    }

    if (user.password !== password) {
      setError('Girdiğiniz şifre hatalı! / Het ingevoerde wachtwoord is onjuist!');
      return;
    }

    // Başarılı Giriş
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    onLoginSuccess();
  };

  // Üye Ol İşlemi / Register Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Lütfen tüm alanları doldurun! / Vul alle velden in!');
      return;
    }

    const users = getUsers();
    const existingUser = users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingUser) {
      setError('Bu e-posta adresi zaten kullanımda! / Dit e-mailadres is al in gebruik!');
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    };

    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));

    setSuccessMsg('Kayıt başarılı! Şimdi giriş yapabilirsiniz. / Registratie succesvol! U kunt nu inloggen.');
    setIsRegistering(false);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        
        {/* Başlık ve Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            {isRegistering ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegistering ? 'Hesap Oluştur / Account Maken' : 'Giriş Yap / Inloggen'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRegistering
              ? 'Dashboard erişimi için bilgilerinizi girin / Vul uw gegevens in'
              : 'Devam etmek için hesabınıza giriş yapın / Log in op uw account'}
          </p>
        </div>

        {/* Sekme Değiştirici (Giriş Yap / Kayıt Ol) */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isRegistering ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Giriş Yap / Inloggen
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isRegistering ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Kayıt Ol / Registreren
          </button>
        </div>

        {/* Hata Mesajı Kutusu */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Başarı Mesajı Kutusu */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {/* Ad Soyad (Sadece Kayıt Olurken Görünür) */}
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad / Naam</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-posta / E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Şifre / Wachtwoord</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-4 h-4" /> Hesap Oluştur / Account Maken
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Giriş Yap / Inloggen
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}