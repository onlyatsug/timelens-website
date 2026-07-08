import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Users, Shield, Flag, Settings, Trash2, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { getUsers, getPosts, deletePost as apiDeletePost, User, Post } from '../../services/api';
import { useApp } from './AppContext';
import { Breadcrumb } from './Breadcrumb';

type AdminTab = 'usuarios' | 'conteudo' | 'denuncias' | 'configuracoes';

const SIDEBAR_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'usuarios', label: 'Gestão de Usuários', icon: <Users size={16} /> },
  { id: 'conteudo', label: 'Moderação de Conteúdo', icon: <Shield size={16} /> },
  { id: 'denuncias', label: 'Denúncias', icon: <Flag size={16} /> },
  { id: 'configuracoes', label: 'Configurações', icon: <Settings size={16} /> },
];

// o backend atual não tem rotas de denúncias, então mantemos isso mockado localmente para não quebrar a UI
const MOCK_REPORTS = [
  { id: 'r1', postId: 'p3', reason: 'Conteúdo inapropriado', reporter: 'u4', status: 'pendente' },
  { id: 'r2', postId: 'p6', reason: 'Informação incorreta', reporter: 'u2', status: 'revisado' },
];

export function AdminPanel() {
  const navigate = useNavigate();
  // blockUser e unblockUser continuam no Context porque não tem endpoint disso na API atual
  const { currentUser, blockUser, unblockUser, blockedUsers }:any = useApp();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios');
  const [feedback, setFeedback] = useState('');

  // estados da API
  const [usersList, setUsersList] = useState<User[]>([]);
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // busca inicial dos dados do painel
  useEffect(() => {

    // evita chamadas de API se o usuário não for admin (to-do: autorizar via firebase)
    if (currentUser?.role !== 'admin') return;

    async function loadAdminData() {
      setLoading(true);
      try {
        const [users, posts] = await Promise.all([
          getUsers(),
          getPosts()
        ]);
        setUsersList(users);
        setPostsList(posts);
      } catch (error) {
        console.error("Erro ao carregar dados administrativos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [currentUser]);

  // se não for admin, chuta pra fora
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDeletePost = async (postId: string) => {

    setPostsList(prev => prev.filter(p => p.id !== postId));
    
    try {
      await apiDeletePost(postId);
      showFeedback('Memória removida da linha do tempo com sucesso.');
    } catch (error) {
      console.error("Erro ao deletar memória:", error);
      showFeedback('Erro: Não foi possível remover a memória.');

    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  max-w-2xl m-auto" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="px-4  pt-4 pb-4">
        <Breadcrumb items={[{ label: 'Mapa', path: '/app' }, { label: 'Administração' }]} />
        <h1 className="text-white mt-3" style={{ fontWeight: 700, fontSize: 22 }}>Painel Administrativo</h1>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(244,166,232,0.3)' }}>
          {feedback.includes('Erro') ? (
             <AlertTriangle size={16} style={{ color: '#F47870' }} />
          ) : (
             <CheckCircle size={16} style={{ color: '#F4A6E8' }} />
          )}
          <span style={{ color: 'white', fontSize: 14 }}>{feedback}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-0 px-4 md:px-10 pb-10">
        {/* Sidebar */}
        <aside className="md:w-56 md:shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 border-b last:border-0 hover:bg-white/5"
                style={{
                  backgroundColor: activeTab === item.id ? 'rgba(244,166,232,0.1)' : 'transparent',
                  color: activeTab === item.id ? '#F4A6E8' : 'rgba(255,255,255,0.5)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  fontWeight: activeTab === item.id ? 600 : 400,
                  fontSize: 14,
                  borderLeft: activeTab === item.id ? '3px solid #F4A6E8' : '3px solid transparent',
                }}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'usuarios' && (
            <div>
              <h2 className="text-white mb-4" style={{ fontWeight: 600, fontSize: 17 }}>
                Gestão de Usuários ({usersList.length})
              </h2>
              <div className="flex flex-col gap-3">
                {usersList.map(user => {
                  const isBlocked = blockedUsers.includes(user.id);
                  const userPostCount = postsList.filter(p => p.authorId === user.id).length;
                  return (
                    <div key={user.id}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{ backgroundColor: '#1A1A1A', border: `1px solid ${isBlocked ? 'rgba(244,120,112,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate" style={{ fontSize: 14 }}>{user.name}</p>
                          {user.role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                              style={{ backgroundColor: 'rgba(244,166,232,0.15)', color: '#F4A6E8' }}>Admin</span>
                          )}
                          {isBlocked && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                              style={{ backgroundColor: 'rgba(244,120,112,0.15)', color: '#F47870' }}>Bloqueado</span>
                          )}
                        </div>
                        <p className="truncate" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{user.email} · {userPostCount} memórias</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => navigate(`/app/profile/${user.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs transition-colors hover:bg-white/10"
                          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                          Ver
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (isBlocked) { unblockUser(user.id); showFeedback(`${user.name} foi desbloqueado.`); }
                              else { blockUser(user.id); showFeedback(`Acesso de ${user.name} bloqueado.`); }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors hover:opacity-80"
                            style={{
                              border: `1px solid ${isBlocked ? 'rgba(244,166,232,0.25)' : 'rgba(244,120,112,0.25)'}`,
                              color: isBlocked ? '#F4A6E8' : '#F47870',
                            }}>
                            <Ban size={12} />
                            {isBlocked ? 'Desbloquear' : 'Bloquear'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'conteudo' && (
            <div>
              <h2 className="text-white mb-4" style={{ fontWeight: 600, fontSize: 17 }}>
                Moderação de Conteúdo ({postsList.length} memórias)
              </h2>
              <div className="flex flex-col gap-3">
                {postsList.length === 0 ? (
                   <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Nenhuma memória encontrada no banco.</p>
                ) : (
                  postsList.map(post => (
                    <div key={post.id}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={post.image} alt="" className="w-14 h-11 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate" style={{ fontSize: 14 }}>{post.title}</p>
                        <p className="truncate" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                          {usersList.find(u => u.id === post.authorId)?.name || 'Usuário Deletado'} · {post.likes} curtidas
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => navigate(`/app/post/${post.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs hover:bg-white/10 transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                          Ver
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs hover:opacity-80 transition-opacity"
                          style={{ border: '1px solid rgba(244,120,112,0.25)', color: '#F47870' }}>
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'denuncias' && (
            <div>
              <h2 className="text-white mb-4" style={{ fontWeight: 600, fontSize: 17 }}>
                Denúncias ({MOCK_REPORTS.length})
              </h2>
              <div className="flex flex-col gap-3">
                {MOCK_REPORTS.map(report => {
                  const reportedPost = postsList.find(p => p.id === report.postId);
                  const status = report.status;
                  return (
                    <div key={report.id}
                      className="p-4 rounded-2xl"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: status === 'pendente' ? 'rgba(244,168,112,0.15)' : 'rgba(255,255,255,0.05)' }}>
                            <AlertTriangle size={16} style={{ color: status === 'pendente' ? '#F4A870' : 'rgba(255,255,255,0.3)' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate" style={{ fontSize: 14 }}>
                              {reportedPost?.title || 'Postagem já foi removida do sistema'}
                            </p>
                            <p className="truncate" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>
                              Motivo: {report.reason}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                          style={{
                            backgroundColor: status === 'pendente' ? 'rgba(244,168,112,0.15)' : 'rgba(255,255,255,0.06)',
                            color: status === 'pendente' ? '#F4A870' : 'rgba(255,255,255,0.4)',
                          }}>
                          {status === 'pendente' ? 'Pendente' : 'Revisado'}
                        </span>
                      </div>
                      {status === 'pendente' && reportedPost && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => { navigate(`/app/post/${reportedPost.id}`); }}
                            className="px-3 py-1.5 rounded-xl text-xs hover:bg-white/10 transition-colors"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                            Revisar conteúdo
                          </button>
                          <button onClick={() => handleDeletePost(reportedPost.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs hover:opacity-80 transition-opacity"
                            style={{ border: '1px solid rgba(244,120,112,0.25)', color: '#F47870' }}>
                            <Trash2 size={12} /> Excluir Post
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <div>
              <h2 className="text-white mb-4" style={{ fontWeight: 600, fontSize: 17 }}>Configurações Administrativas</h2>
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex flex-col gap-5">
                  {[
                    { label: 'Moderação automática de comentários', desc: 'Filtra automaticamente conteúdo com linguagem de ódio', enabled: true },
                    { label: 'Notificações de novas denúncias', desc: 'Recebe alertas por e-mail quando novos conteúdos são denunciados', enabled: true },
                    { label: 'Modo manutenção', desc: 'Bloqueia novos cadastros e postagens temporariamente', enabled: false },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{setting.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{setting.desc}</p>
                      </div>
                      <button
                        className="w-12 h-6 rounded-full transition-all relative shrink-0"
                        style={{ backgroundColor: setting.enabled ? '#F4A6E8' : 'rgba(255,255,255,0.1)' }}>
                        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{ left: setting.enabled ? '26px' : '2px' }} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>Diretrizes da Comunidade</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}>
                    Esta plataforma está comprometida com um ambiente respeitoso e inclusivo.
                    Conteúdos que violem os direitos de outros usuários, promovam discurso de ódio,
                    ou incluam informações falsas serão removidos. A autoria de materiais deve
                    sempre ser creditada ao criador original. Usuários reincidentes poderão ter
                    sua conta permanentemente bloqueada.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}