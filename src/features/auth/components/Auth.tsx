import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { registerWithEmail, loginWithEmail, loginWithGoogle, AuthDomainError } from '../../../lib/authService';
import { useApp } from '@/app/AppContext';

export default function Auth() {
  const navigate = useNavigate();
  // consome o usuário e o estado de carregamento do AppContext
  const { currentUser, loading: globalLoading }:any = useApp(); 

  const [tab, setTab] = useState<'login' | 'cadastro'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renomeado para evitar conflito

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });

  useEffect(() => {
    if (currentUser && !globalLoading) {
      navigate('/app');
    }
  }, [currentUser, globalLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithEmail(loginForm.email, loginForm.password);
    } catch (err) {
      setError(err instanceof AuthDomainError ? err.message : 'E-mail ou senha incorretos.');
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerForm.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    if (registerForm.password !== registerForm.confirm) return setError('As senhas não coincidem.');
    setIsSubmitting(true);
    try {
      await registerWithEmail(registerForm.name, registerForm.email, registerForm.password);
    } catch (err) {
      setError(err instanceof AuthDomainError ? err.message : 'Não foi possível criar a conta.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof AuthDomainError ? err.message : 'Falha ao entrar com o Google.');
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || globalLoading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="fixed top-20 -left-20 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F4A6E8, transparent)' }} />
      <div className="fixed bottom-20 -right-20 w-80 h-80 rounded-full opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F4A870, transparent)' }} />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>Timelens</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>O memorial do tempo e espaço da UFMT</p>
        </div>

        <div className="rounded-3xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex rounded-2xl p-1 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            {(['login', 'cadastro'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2 rounded-xl transition-all duration-200 capitalize text-sm font-medium"
                style={{ backgroundColor: tab === t ? '#F4A6E8' : 'transparent', color: tab === t ? '#0D0D0D' : 'rgba(255,255,255,0.5)' }}>
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(244,120,112,0.15)', border: '1px solid rgba(244,120,112,0.3)' }}>
              <AlertCircle size={16} style={{ color: '#F47870', flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#F47870', fontSize: 13 }}>{error}</p>
            </div>
          )}

          {/* Botão do Google ativo e funcional */}
          <button type="button" onClick={handleGoogleLogin} disabled={isBusy}
            className="w-full py-3 rounded-2xl font-semibold mb-4 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 14 }}>
            {isBusy ? 'Sincronizando...' : 'Continuar com Google'}
          </button>

          {/* Separador e formulários abaixo marcados com aparência desativada */}
          <div className="flex items-center gap-3 mb-4 opacity-30 pointer-events-none">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 opacity-30 pointer-events-none" style={{ cursor: 'not-allowed' }}>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>E-mail institucional</label>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Em breve</span>
                </div>
                <input type="email" disabled placeholder="seu.nome@aluno.ufmt.br"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Senha</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} disabled placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-2xl outline-none transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                  />
                  <button type="button" disabled className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled
                className="w-full py-3 rounded-2xl font-semibold opacity-50"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                Entrar
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4 opacity-30 pointer-events-none" style={{ cursor: 'not-allowed' }}>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Nome completo</label>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Em breve</span>
                </div>
                <input type="text" disabled placeholder="Seu nome"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>E-mail institucional</label>
                <input type="email" disabled placeholder="seu.nome@aluno.ufmt.br"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Senha</label>
                <input type="password" disabled placeholder="Mínimo 6 caracteres"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Confirmar senha</label>
                <input type="password" disabled placeholder="Repita a senha"
                  value={registerForm.confirm}
                  onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                />
              </div>
              <button type="submit" disabled
                className="w-full py-3 rounded-2xl font-semibold opacity-50"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                Criar conta
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          Universidade Federal de Mato Grosso · Campus Cuiabá
        </p>
      </div>
    </div>
  );
}