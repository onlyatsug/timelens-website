import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Map, Clock, Search, Bell, Plus, LogOut, Settings, Shield, X } from 'lucide-react';
import { useApp } from './AppContext';
// Importa o serviço da API no lugar do arquivo de dados estático
import { getNotifications } from '../../services/api';

const glass = {
  backgroundColor: 'rgba(8, 8, 8, 0.62)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
} as const;

export function Header() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Busca a quantidade de notificações não lidas assim que o usuário estiver disponível
  useEffect(() => {
    if (!currentUser) return;
    
    async function fetchUnreadNotifications() {
      try {
        if(!currentUser) return;
        const notifications = await getNotifications(currentUser.id);
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao buscar notificações não lidas no cabeçalho:", error);
      }
    }
    
    fetchUnreadNotifications();
    
    // Você pode opcionalmente adicionar um setInterval aqui para fazer polling a cada X minutos e manter o número atualizado:
    // const interval = setInterval(fetchUnreadNotifications, 60000); // 1 min
    // return () => clearInterval(interval);
  }, [currentUser, location.pathname]); // Atualiza o contador quando o usuário troca de página (ex: ao sair da página de notificações)

  const navItems = [
    { label: 'Mapa', path: '/app', icon: <Map size={15} /> },
    { label: 'Linha do Tempo', path: '/app/timeline', icon: <Clock size={15} /> },
    { label: 'Buscar', path: '/app/search', icon: <Search size={15} /> },
  ];

  const isActive = (path: string) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 md:flex justify-center pointer-events-none px-6 z-100 z-index-100">
      {/* Mobile */}
      <div
        className="md:hidden pointer-events-auto px-4 py-2 m-auto rounded-full"
        style={glass}
      >
        <Link to="/app" className="flex items-center justify-center gap-2">
          <span
            style={{
              color: '#F4A6E8',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.3px',
            }}
          >
            Timelens
          </span>
        </Link>
      </div>
      <div className="hidden md:flex pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-full"
        style={{ ...glass, maxWidth: 760, width: '100%' }}
        
        >

        {/* Logo */}
        <Link to="/app" className="flex items-center gap-2 shrink-0 pl-1">
          <span style={{ color: '#F4A6E8', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
            Timelens
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
              style={{
                color: isActive(item.path) ? '#F4A6E8' : 'rgba(255,255,255,0.55)',
                backgroundColor: isActive(item.path) ? 'rgba(244,166,232,0.13)' : 'transparent',
                fontSize: 13,
              }}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-5 w-px shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <button onClick={() => navigate('/app/new-memory')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D', fontWeight: 600, fontSize: 13 }}>
            <Plus size={14} />
            Nova Memória
          </button>

          <button onClick={() => navigate('/app/notifications')}
            className="relative w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                style={{ backgroundColor: '#F4A6E8' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(v => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:opacity-80"
              style={{ borderColor: dropdownOpen ? '#F4A6E8' : 'rgba(255,255,255,0.18)' }}>
              <img src={currentUser?.avatar} alt={currentUser?.name} className="w-full h-full object-cover" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                  style={{ ...glass, backgroundColor: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="min-w-0 pr-2">
                      <p className="text-white text-sm font-medium truncate">{currentUser?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentUser?.email}</p>
                    </div>
                    <button onClick={() => setDropdownOpen(false)} className="hover:text-white transition-colors shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-2">
                    {[
                      { label: 'Meu Perfil', icon: <img src={currentUser?.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />, action: () => { navigate(`/app/profile/${currentUser?.id}`); setDropdownOpen(false); } },
                      ...(currentUser?.role === 'admin' ? [{ label: 'Administração', icon: <Shield size={14} />, action: () => { navigate('/app/admin'); setDropdownOpen(false); } }] : []),
                      { label: 'Configurações', icon: <Settings size={14} />, action: () => { navigate('/app/search'); setDropdownOpen(false); } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors text-left"
                        style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {item.icon}{item.label}
                      </button>
                    ))}
                    <div className="my-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
                    <button onClick={() => { logout(); navigate('/'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors text-left"
                      style={{ color: '#F47870' }}>
                      <LogOut size={14} />Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}