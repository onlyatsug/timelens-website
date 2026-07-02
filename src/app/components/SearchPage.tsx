import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, X, Filter, Heart, MapPin } from 'lucide-react';
// Importe as funções da sua API
import { 
  getPosts, 
  getLocations, 
  getTags, 
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

const TAG_COLORS = ['#F4A6E8', '#F4A870', '#A6E8F4', '#A6F4A8', '#E8A6F4'];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useApp();
  
  // Estados de Filtro
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tag') ? [searchParams.get('tag')!] : []
  );
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Estados da API
  const [posts, setPosts] = useState<Post[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  // Busca inicial dos dados
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Busca paralela para otimizar o tempo de resposta
        const [fetchedPosts, fetchedLocations, fetchedTags] = await Promise.all([
          getPosts(), // Busca todos para permitir filtro rápido no cliente
          getLocations(),
          getTags()
        ]);

        setPosts(fetchedPosts);
        setLocations(fetchedLocations);
        setAllTags(fetchedTags);

        // Faz o cache dos autores
        const authorIds = Array.from(new Set(fetchedPosts.map(p => p.authorId)));
        const usersData = await Promise.all(authorIds.map(id => getUserById(id)));
        
        const usersMap: Record<string, User> = {};
        usersData.forEach(u => {
          if (u) usersMap[u.id] = u;
        });
        setUsersCache(usersMap);

      } catch (error) {
        console.error("Erro ao carregar os dados de busca:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extrai os anos disponíveis a partir dos posts carregados
  const allYears = useMemo(() => {
    return [...new Set(posts.map(p => new Date(p.eventDate).getFullYear()))].sort((a, b) => b - a);
  }, [posts]);

  // Filtra os resultados de forma performática no cliente
  const results = useMemo(() => {
    return posts.filter(post => {
      const matchesQuery = !query.trim() ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => post.tags.includes(tag));
      const year = new Date(post.eventDate).getFullYear();
      const matchesFrom = !yearFrom || year >= parseInt(yearFrom);
      const matchesTo = !yearTo || year <= parseInt(yearTo);
      
      return matchesQuery && matchesTags && matchesFrom && matchesTo;
    });
  }, [posts, query, selectedTags, yearFrom, yearTo]);

  // Função para curtir com "Optimistic Update"
  const handleLike = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation(); // Evita navegar para a página do post ao clicar no curtir
    if (!currentUser) return;
    
    const isLiked = post.likedBy.includes(currentUser.id);

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

    try {
      await toggleLikePost(post.id, currentUser.id);
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const hasActiveFilters = selectedTags.length > 0 || yearFrom || yearTo;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <Breadcrumb items={[{ label: 'Mapa', path: '/app' }, { label: query ? `Buscar › "${query}"` : 'Buscar' }]} />

        <h1 className="text-white mt-3 mb-4" style={{ fontWeight: 700, fontSize: 22 }}>Buscar Memórias</h1>

        {/* Search input */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input type="text"
            placeholder="Buscar por título, relato ou local..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl outline-none transition-colors"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14 }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
            style={{
              backgroundColor: showFilters || hasActiveFilters ? 'rgba(244,166,232,0.12)' : 'transparent',
              color: showFilters || hasActiveFilters ? '#F4A6E8' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${showFilters || hasActiveFilters ? 'rgba(244,166,232,0.25)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: 13,
            }}>
            <Filter size={14} />
            Filtros {hasActiveFilters ? `(${selectedTags.length + (yearFrom ? 1 : 0) + (yearTo ? 1 : 0)})` : ''}
          </button>
          {!loading && (
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mb-4">
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 10 }}>Tags Temáticas</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, i) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="px-3 py-1 rounded-full text-xs transition-all"
                    style={{
                      backgroundColor: selectedTags.includes(tag) ? TAG_COLORS[i % TAG_COLORS.length] + '20' : 'rgba(255,255,255,0.05)',
                      color: selectedTags.includes(tag) ? TAG_COLORS[i % TAG_COLORS.length] : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${selectedTags.includes(tag) ? TAG_COLORS[i % TAG_COLORS.length] + '50' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>A partir de</p>
                <select value={yearFrom} onChange={e => setYearFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, colorScheme: 'dark' }}>
                  <option value="">Qualquer ano</option>
                  {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Até</p>
                <select value={yearTo} onChange={e => setYearTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, colorScheme: 'dark' }}>
                  <option value="">Qualquer ano</option>
                  {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={() => { setSelectedTags([]); setYearFrom(''); setYearTo(''); }}
                className="mt-3 text-sm transition-colors hover:opacity-80"
                style={{ color: '#F47870' }}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex flex-col gap-3">
          {loading ? (
             <div className="text-center py-20 w-full">
               <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Buscando memórias...</p>
             </div>
          ) : !query.trim() && selectedTags.length === 0 && !yearFrom && !yearTo ? (
            <>
              {/* Top tags suggestion */}
              <div className="mb-2">
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 }}>Tags em destaque</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map((tag, i) => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                      style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + '15', color: TAG_COLORS[i % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}30` }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {/* Locations */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 }}>Explorar por local</p>
                <div className="grid grid-cols-2 gap-2">
                  {locations.map(loc => (
                    <button key={loc.id} onClick={() => navigate(`/app/timeline/${loc.id}`)}
                      className="flex items-center gap-2 p-3 rounded-xl text-left transition-colors hover:bg-white/5"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <MapPin size={14} style={{ color: '#F4A6E8' }} />
                      <span className="truncate" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{loc.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Nenhuma memória encontrada.</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 4 }}>Tente outros termos ou filtros.</p>
            </div>
          ) : (
            results.map(post => {
              const loc = locations.find(l => l.id === post.locationId);
              const liked = currentUser ? post.likedBy.includes(currentUser.id) : false;
              
              return (
                <button key={post.id}
                  onClick={() => navigate(`/app/post/${post.id}`)}
                  className="flex gap-3 p-3 rounded-2xl text-left transition-all hover:bg-white/5"
                  style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0">
                    <ImageWithFallback src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate" style={{ fontSize: 14 }}>{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {loc && <span className="truncate" style={{ color: '#F4A870', fontSize: 11, maxWidth: '50%' }}>{loc.shortName}</span>}
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{formatDate(post.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px]"
                          style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + '15', color: TAG_COLORS[i % TAG_COLORS.length] }}>
                          {tag}
                        </span>
                      ))}
                      <button 
                        onClick={(e) => handleLike(e, post)}
                        className="ml-auto flex items-center gap-1 transition-colors hover:text-white" 
                        style={{ color: liked ? '#F4A6E8' : 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                        <Heart size={11} fill={liked ? '#F4A6E8' : 'none'} /> {post.likes}
                      </button>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}