import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Heart, MessageCircle, Share2, MapPin, Calendar, Filter } from 'lucide-react';
// funções e tipagens da API
import { 
  getPosts, 
  getPostsByLocation, 
  getLocationById, 
  getUserById, 
  toggleLikePost, 
  formatDate,
  Post, 
  CampusLocation, 
  User 
} from '../../services/api';
import { useApp } from './AppContext';
import { Breadcrumb } from './Breadcrumb';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Tab = 'cronologico' | 'tags' | 'eventos' | 'projetos' | 'coletivos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'cronologico', label: 'Cronológico' },
  { id: 'tags', label: 'Por Tags' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'coletivos', label: 'Coletivos' },
];

const TAG_COLORS = ['#F4A6E8', '#F4A870', '#A6E8F4', '#A6F4A8', '#E8A6F4'];

export function Timeline() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<Tab>('cronologico');
  const [periodFilter, setPeriodFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // estados para dados da API
  const [posts, setPosts] = useState<Post[]>([]);
  const [location, setLocation] = useState<CampusLocation | null>(null);
  const [usersCache, setUsersCache] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  // busca inicial dos dados
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. buscar detalhes do local (se houver ID)
        if (locationId) {
          const loc = await getLocationById(locationId);
          setLocation(loc || null);
        } else {
          setLocation(null);
        }

        // 2. buscar posts (do local específico ou globais)
        const fetchedPosts = locationId 
          ? await getPostsByLocation(locationId) 
          : await getPosts();
        
        setPosts(fetchedPosts);

        // 3. buscar e fazer cache dos autores dos posts
        const authorIds = Array.from(new Set(fetchedPosts.map(p => p.authorId)));
        const usersData = await Promise.all(authorIds.map(id => getUserById(id)));
        
        const usersMap: Record<string, User> = {};
        usersData.forEach(u => {
          if (u) usersMap[u.id] = u;
        });
        setUsersCache(usersMap);

      } catch (error) {
        console.error("Erro ao carregar a timeline:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locationId]);

  // função para curtir com "Optimistic Update" (atualiza a UI antes da API responder)
  const handleLike = async (post: Post) => {
    if (!currentUser) return;
    
    const isLiked = post.likedBy.includes(currentUser.id);

    // atualiza o estado local imediatamente
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          likedBy: isLiked 
            ? p.likedBy.filter(id => id !== currentUser.id) 
            : [...p.likedBy, currentUser.id]
        };
      }
      return p;
    }));

    // chama a API em background
    try {
      await toggleLikePost(post.id, currentUser.id);
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      // em caso de erro, você poderia reverter o estado aqui se desejado
    }
  };

  // filtros aplicados via useMemo para performance
  const filteredPosts = useMemo(() => {
    let base = posts;
    if (activeTab === 'eventos') base = base.filter(p => p.type === 'event');
    else if (activeTab === 'projetos') base = base.filter(p => p.type === 'project');
    else if (activeTab === 'coletivos') base = base.filter(p => p.type === 'collective');
    else if (activeTab === 'tags' && selectedTag) base = base.filter(p => p.tags.includes(selectedTag));

    if (periodFilter) {
      const year = parseInt(periodFilter);
      base = base.filter(p => new Date(p.eventDate).getFullYear() === year);
    }

    return [...base].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [posts, activeTab, selectedTag, periodFilter]);

  const allTags = [...new Set(posts.flatMap(p => p.tags))];
  const years = [...new Set(posts.map(p => new Date(p.eventDate).getFullYear()))].sort((a, b) => b - a);

  const breadcrumbItems = location
    ? [{ label: 'Mapa', path: '/app' }, { label: location.shortName, path: `/app/timeline/${location.id}` }, { label: 'Linha do Tempo' }]
    : [{ label: 'Mapa', path: '/app' }, { label: 'Linha do Tempo Global' }];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />

        {/* header */}
        <div className="mt-3 mb-5">
          {location && (
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} style={{ color: '#F4A6E8' }} />
              <span style={{ color: '#F4A6E8', fontSize: 13 }}>{location.name}</span>
            </div>
          )}
          <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22 }}>Linha do Tempo</h1>
          {!loading && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              {filteredPosts.length} memória{filteredPosts.length !== 1 ? 's' : ''}
              {periodFilter && ` em ${periodFilter}`}
            </p>
          )}
        </div>

        {/* period filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-1 shrink-0">
            <Filter size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <button
            onClick={() => setPeriodFilter('')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors"
            style={{
              backgroundColor: !periodFilter ? '#F4A6E8' : 'rgba(255,255,255,0.06)',
              color: !periodFilter ? '#0D0D0D' : 'rgba(255,255,255,0.5)',
              fontWeight: !periodFilter ? 600 : 400,
            }}>
            Todos
          </button>
          {years.map(year => (
            <button key={year}
              onClick={() => setPeriodFilter(periodFilter === String(year) ? '' : String(year))}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors"
              style={{
                backgroundColor: periodFilter === String(year) ? '#F4A6E8' : 'rgba(255,255,255,0.06)',
                color: periodFilter === String(year) ? '#0D0D0D' : 'rgba(255,255,255,0.5)',
                fontWeight: periodFilter === String(year) ? 600 : 400,
              }}>
              {year}
            </button>
          ))}
        </div>

        {/* tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedTag(null); }}
              className="shrink-0 px-4 py-2 rounded-full transition-all duration-200 text-sm"
              style={{
                backgroundColor: activeTab === tab.id ? 'rgba(244,166,232,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#F4A6E8' : 'rgba(255,255,255,0.4)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                border: activeTab === tab.id ? '1px solid rgba(244,166,232,0.3)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* tag filter chips */}
        {activeTab === 'tags' && (
          <div className="flex gap-2 flex-wrap mb-4">
            {allTags.map((tag, i) => (
              <button key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="px-3 py-1 rounded-full text-xs transition-all duration-200"
                style={{
                  backgroundColor: selectedTag === tag ? TAG_COLORS[i % TAG_COLORS.length] + '25' : 'rgba(255,255,255,0.05)',
                  color: selectedTag === tag ? TAG_COLORS[i % TAG_COLORS.length] : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${selectedTag === tag ? TAG_COLORS[i % TAG_COLORS.length] + '50' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* posts list */}
        <div className="pb-8">
          {loading ? (
            <div className="text-center py-20 w-full">
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Carregando linha do tempo...</p>
            </div>
          ) : !Array.isArray(filteredPosts) || filteredPosts.length === 0 ? (
            <div className="text-center py-20 w-full">
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Nenhuma memória registrada aqui ainda.</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 4 }}>Que tal ser o primeiro?</p>
            </div>
          ) : (

            <div className="relative flex flex-col gap-6">
              {/* ── linha guia vertical única de fundo ── */}
              <div style={{
                position: 'absolute',
                top: 20,
                bottom: 20,
                left: 18, // metade do espaço do indicador da esquerda (36px / 2)
                width: 1,
                background: 'linear-gradient(to bottom, rgba(244,166,232,0.4), rgba(244,166,232,0.06))',
                zIndex: 0,
              }} />

              {/* um único mapeamento para garantir alinhamento perfeito de cada linha */}
              {filteredPosts.map(post => {
                const author = usersCache[post.authorId];
                const liked = currentUser ? post.likedBy?.includes(currentUser.id) : false;
                
                // conversão e tratamento seguro da data do marcador lateral
                let formattedSideDate = '';
                try {
                  if (post.eventDate) {
                    formattedSideDate = new Date(post.eventDate)
                      .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                      .replace('.', '')
                      .toLowerCase();
                  }
                } catch (e) {
                  formattedSideDate = '---';
                }

                return (
                  <div key={post.id} className="flex items-start w-full relative z-10">
                    
                    {/* indicador lateral da Linha do Tempo */}
                    <div className="flex flex-col items-center shrink-0" style={{ width: 36, marginRight: 12 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F4A6E8, #F4A870)',
                        border: '2px solid #0D0D0D',
                        boxShadow: '0 0 0 2px rgba(244,166,232,0.35), 0 0 8px rgba(244,166,232,0.3)',
                        flexShrink: 0,
                        marginTop: 20,
                      }} />
                      <div style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        background: 'linear-gradient(to top, #F4A870, #F4A6E8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: 1.1,
                        marginTop: 8,
                        userSelect: 'none',
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))',
                      }}>
                        {formattedSideDate}
                      </div>
                    </div>

                    {/* card do Post alinhado ao indicador atual */}
                    <article className="flex-1 min-w-0 rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                      
                      {/* imagem do Card */}
                      <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '4/3' }}
                        onClick={() => navigate(`/app/post/${post.id}`)}>
                        <ImageWithFallback src={post.image} alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#F4A870', backdropFilter: 'blur(4px)' }}>
                          {post.type === 'event' ? 'Evento' : post.type === 'project' ? 'Projeto' : post.type === 'collective' ? 'Coletivo' : 'Geral'}
                        </div>
                      </div>

                      {/* corpo do Conteúdo */}
                      <div className="p-3 sm:p-4">
                        <h3 className="text-white font-semibold mb-1 cursor-pointer hover:text-[#F4A6E8] transition-colors"
                          style={{ fontSize: 16, lineHeight: 1.4 }}
                          onClick={() => navigate(`/app/post/${post.id}`)}>
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{formatDate(post.eventDate)}</span>
                          </div>
                          {author && (
                            <button onClick={() => navigate(`/app/profile/${author.id}`)}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                              <img src={author.avatar} alt={author.name} className="w-4 h-4 rounded-full object-cover" />
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{author.name?.split(' ')[0]}</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag, i) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs"
                              style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + '15', color: TAG_COLORS[i % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}30` }}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* ações de Interação */}
                        <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button onClick={() => handleLike(post)}
                            className="flex items-center gap-1.5 transition-colors"
                            style={{ color: liked ? '#F4A6E8' : 'rgba(255,255,255,0.4)' }}>
                            <Heart size={16} fill={liked ? '#F4A6E8' : 'none'} />
                            <span style={{ fontSize: 13 }}>{post.likes ?? 0}</span>
                          </button>
                          <button onClick={() => navigate(`/app/post/${post.id}#comments`)}
                            className="flex items-center gap-1.5 transition-colors hover:text-white"
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <MessageCircle size={16} />
                            <span style={{ fontSize: 13 }}>Comentar</span>
                          </button>
                          <button className="flex items-center gap-1.5 transition-colors hover:text-white ml-auto"
                            style={{ color: 'rgba(255,255,255,0.4)' }}
                            onClick={() => navigator.clipboard?.writeText(window.location.origin + `/app/post/${post.id}`)}>
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>

                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}