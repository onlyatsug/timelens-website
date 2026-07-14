import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, MessageCircle, AtSign, MapPin, Bell } from 'lucide-react';

import { getNotifications, getPostById, markNotificationAsRead, timeAgo, Notification, Post } from '../../services/api'; 
import { useApp } from '../AppContext';
import { Breadcrumb } from './Breadcrumb';

const ICONS = {
  like: <Heart size={16} style={{ color: '#F4A6E8' }} />,
  comment: <MessageCircle size={16} style={{ color: '#F4A870' }} />,
  mention: <AtSign size={16} style={{ color: '#A6E8F4' }} />,
  proximity: <MapPin size={16} style={{ color: '#F47870' }} />,
};

const BG = {
  like: 'rgba(244,166,232,0.12)',
  comment: 'rgba(244,168,112,0.12)',
  mention: 'rgba(166,232,244,0.12)',
  proximity: 'rgba(244,120,112,0.12)',
};

export function NotificationsPage() {
  const { currentUser }:any = useApp();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [postsCache, setPostsCache] = useState<Record<string, Post>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      try {
        setLoading(true);
        // 1. busca as notificações do usuário logado
        if (!currentUser) return;
        const data = await getNotifications(currentUser.id);
        
        // ordena da mais recente para a mais antiga
        const sortedData = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedData);

        // 2. coleta os IDs únicos dos posts referenciados nas notificações
        const postIds = Array.from(new Set(sortedData.map(n => n.postId).filter(Boolean))) as string[];
        
        // 3. busca os dados dos posts em paralelo para mostrar a miniatura da imagem
        const postsData = await Promise.all(postIds.map(id => getPostById(id)));
        
        // cria um dicionário para acesso rápido O(1) no render
        const postsMap: Record<string, Post> = {};
        postsData.forEach(p => {
          if (p) postsMap[p.id] = p;
        });
        
        setPostsCache(postsMap);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  const handleNotificationClick = async (notif: Notification) => {
    // se a notificação não foi lida, marca como lida na API
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif.id);
        // atualiza o estado local para refletir a mudança instantaneamente
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }

    // navega para o post
    if (notif.postId) {
      navigate(`/app/post/${notif.postId}`);
    }
  };

  const unread = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <Breadcrumb items={[{ label: 'Mapa', path: '/app' }, { label: 'Notificações' }]} />

        <div className="flex items-center justify-between mt-3 mb-5">
          <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22 }}>Notificações</h1>
          {unread.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'rgba(244,166,232,0.15)', color: '#F4A6E8' }}>
              {unread.length} nova{unread.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <Bell size={28} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unread.length > 0 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 4 }}>NOVAS</p>
            )}
            {notifications.map((notif, i) => {
              const isFirstRead = !notif.read && i > 0 && notifications[i - 1].read;
              const post = notif.postId ? postsCache[notif.postId] : undefined;
              
              return (
                <React.Fragment key={notif.id}>
                  {isFirstRead && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8, marginBottom: 4 }}>
                      ANTERIORES
                    </p>
                  )}
                  <button
                    onClick={() => handleNotificationClick(notif)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all hover:bg-white/[0.03]"
                    style={{
                      backgroundColor: notif.read ? 'transparent' : '#1A1A1A',
                      border: `1px solid ${notif.read ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: BG[notif.type] }}>
                      {ICONS[notif.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: notif.read ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>
                        {notif.body}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 3 }}>
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>

                    {/* Post thumbnail */}
                    {post && (
                      <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: '#F4A6E8' }} />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}