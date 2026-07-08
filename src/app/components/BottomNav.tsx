import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Map, Bell, User, Plus, Clock } from 'lucide-react';
import { useApp } from './AppContext';

import { getNotifications } from '../../services/api';

const glass = {
  backgroundColor: 'rgba(8, 8, 8, 0.65)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
} as const;

export function BottomNav() {
  const { currentUser }: any = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);

  // busca as notificações não lidas da API
  useEffect(() => {
    if (!currentUser) return;
    
    async function fetchUnreadNotifications() {
      try {
        if (!currentUser) return;
        const notifications = await getNotifications(currentUser.id);
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao buscar notificações não lidas no mobile:", error);
      }
    }
    
    fetchUnreadNotifications();
  }, [currentUser, location.pathname]); 

  const isActive = (path: string) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  const items = [
    {
      path: '/app', icon: <Map size={20} />, label: 'Mapa',
    },
    {
      path: '/app/timeline', icon: <Clock size={20} />, label: 'Timeline',
    },
  ];

  const rightItems = [
    {
      path: '/app/notifications', label: 'Alertas',
      icon: (active: boolean) => (
        <div className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
    },
    {
      path: `/app/profile/${currentUser?.id}`, label: 'Perfil',
      icon: (_active: boolean) => currentUser?.avatar
        ? <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" style={{ border: '1.5px solid rgba(255,255,255,0.2)' }} />
        : <User size={20} />,
    },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 flex md:hidden justify-center pointer-events-none px-4">
      <div className="pointer-events-auto flex items-center rounded-full px-2 py-2 gap-1"
        style={{ ...glass }}>

        {/* Left nav items */}
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all"
            style={{ color: isActive(item.path) ? '#F4A6E8' : 'rgba(255,255,255,0.4)', minWidth: 52 }}>
            {item.icon}
            <span style={{ fontSize: 9, lineHeight: 1 }}>{item.label}</span>
          </button>
        ))}

        {/* Central CTA */}
        <button onClick={() => navigate('/app/new-memory')}
          className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 mx-1 hover:scale-105"
          style={{
            width: 48, height: 48,
            backgroundColor: '#F4A6E8',
            color: '#0D0D0D',
            boxShadow: '0 0 20px rgba(244,166,232,0.5), 0 4px 12px rgba(0,0,0,0.4)',
            marginTop: -18,
            border: '2px solid rgba(255,255,255,0.15)',
          }}>
          <Plus size={22} />
        </button>

        {/* nav items */}
        {rightItems.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-all"
              style={{ color: active ? '#F4A6E8' : 'rgba(255,255,255,0.4)', minWidth: 52 }}>
              {item.icon(active)}
              <span style={{ fontSize: 9, lineHeight: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}