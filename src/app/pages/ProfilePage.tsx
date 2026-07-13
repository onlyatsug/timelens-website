import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Settings, Grid, User as UserIcon, Heart, Clock, Shield, Ban } from 'lucide-react';

import { 
  getUserById, 
  getPosts, 
  formatDate, 
  User as UserType, 
  Post 
} from '../../services/api';
import { useApp } from '../AppContext';
import { Breadcrumb } from './Breadcrumb';

type ProfileTab = 'postagens' | 'sobre' | 'marcos' | 'curtidas';

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: 'postagens', label: 'Postagens', icon: <Grid size={14} /> },
  { id: 'sobre', label: 'Sobre', icon: <UserIcon size={14} /> },
  { id: 'marcos', label: 'Marcos Históricos', icon: <Clock size={14} /> },
  { id: 'curtidas', label: 'Curtidas', icon: <Heart size={14} /> },
];

export function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, blockUser, unblockUser, blockedUsers }:any = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('postagens');

  // estados da API
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // o alvo do perfil é o ID da URL ou o ID do usuário logado (se estiver vendo o próprio perfil)
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    async function fetchProfileData() {
      setLoading(true);
      try {
        // busca paralela para otimizar tempo
        const [fetchedUser, fetchedUserPosts, allPosts] = await Promise.all([
          getUserById(targetUserId as string),
          getPosts({ authorId: targetUserId as string }),
          getPosts() // busca todos para filtrar as curtidas
        ]);

        if (fetchedUser) setProfileUser(fetchedUser);
        setUserPosts(fetchedUserPosts);
        
        // filtra os posts que o usuário curtiu
        const liked = allPosts.filter(p => p.likedBy.includes(targetUserId as string));
        setLikedPosts(liked);

      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [targetUserId]);

  const isOwnProfile = profileUser?.id === currentUser?.id;
  const isBlocked = profileUser ? blockedUsers.includes(profileUser.id) : false;

  // marcos são filtrados em memória a partir dos posts do usuário
  const marcosPosts = useMemo(() => {
    return userPosts.filter(p => p.type === 'event' || p.type === 'project');
  }, [userPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando perfil...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Usuário não encontrado.</p>
      </div>
    );
  }

  const tabContent = {
    postagens: userPosts,
    marcos: marcosPosts,
    curtidas: likedPosts,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <Breadcrumb items={[{ label: 'Mapa', path: '/app' }, { label: profileUser.name }]} />

        {/* profile header */}
        <div className="mt-4 rounded-2xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <img src={profileUser.avatar} alt={profileUser.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: '3px solid rgba(244,166,232,0.4)', boxShadow: '0 0 0 4px rgba(244,166,232,0.1)' }} />
              {profileUser.role === 'admin' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F4A6E8' }}>
                  <Shield size={12} className="text-black" />
                </div>
              )}
            </div>
            <h1 className="text-white mt-3" style={{ fontWeight: 700, fontSize: 18 }}>{profileUser.name}</h1>
            <p style={{ color: '#F4A870', fontSize: 13, marginTop: 2 }}>{profileUser.course}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
              Membro desde {new Date(profileUser.joinDate).getFullYear()}
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {isOwnProfile ? (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                    <Settings size={14} />
                    Editar
                  </button>
                  
                  {/* Botão Admin */}
                  {currentUser?.role === 'admin' && (
                    <button onClick={() => navigate('/app/admin')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: 'rgba(244,166,232,0.12)',
                        border: '1px solid rgba(244,166,232,0.25)',
                        color: '#F4A6E8'
                      }}>
                      <Shield size={14} />
                      Painel Admin
                    </button>
                  )}
                </>
              ) : currentUser?.role === 'admin' ? (
                <button onClick={() => isBlocked ? unblockUser(profileUser.id) : blockUser(profileUser.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
                  style={{
                    border: `1px solid ${isBlocked ? 'rgba(244,166,232,0.3)' : 'rgba(244,120,112,0.3)'}`,
                    color: isBlocked ? '#F4A6E8' : '#F47870',
                  }}>
                  <Ban size={14} />
                  {isBlocked ? 'Desbloquear' : 'Bloquear'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: 18 }}>{userPosts.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Memórias</p>
            </div>
            <div className="text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: 18 }}>
                {userPosts.reduce((sum, p) => sum + p.likes, 0)}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Curtidas</p>
            </div>
            <div className="text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: 18 }}>{likedPosts.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Curtiu</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200 text-sm"
              style={{
                backgroundColor: activeTab === tab.id ? 'rgba(244,166,232,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#F4A6E8' : 'rgba(255,255,255,0.4)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                border: activeTab === tab.id ? '1px solid rgba(244,166,232,0.25)' : '1px solid transparent',
              }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'sobre' ? (
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white mb-3" style={{ fontWeight: 600, fontSize: 15 }}>Biografia</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
                {profileUser.bio || 'Nenhuma biografia adicionada ainda.'}
              </p>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Curso</p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>{profileUser.course}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>E-mail</p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{profileUser.email}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Perfil</p>
                    <p style={{ color: profileUser.role === 'admin' ? '#F4A6E8' : 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>
                      {profileUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Na plataforma desde</p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }}>{formatDate(profileUser.joinDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(tabContent[activeTab as keyof typeof tabContent] || []).length === 0 ? (
                <div className="col-span-2 text-center py-16">
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                    {activeTab === 'curtidas' ? 'Você ainda não curtiu nenhuma memória.' : 'Nenhuma memória registrada aqui ainda.'}
                  </p>
                </div>
              ) : (
                (tabContent[activeTab as keyof typeof tabContent] || []).map(post => (
                  <button key={post.id}
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    className="rounded-2xl overflow-hidden text-left group transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <p>fallback image from figma</p>
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)' }} />
                      <p className="absolute bottom-2 left-2 right-2 text-white font-medium leading-tight" style={{ fontSize: 11 }}>
                        {post.title}
                      </p>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{formatDate(post.eventDate)}</span>
                      <span className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                        <Heart size={10} /> {post.likes}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}