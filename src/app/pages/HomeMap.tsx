import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock } from 'lucide-react';
import { getLocations, getPosts, CampusLocation, Post } from '../../services/api';
import { Breadcrumb } from './Breadcrumb';
import { CampusMap } from './CampusMap';

export function HomeMap() {
  const navigate = useNavigate();
  
  // estados da API
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // estados da UI
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locPage, setLocPage] = useState(1);

  // busca os dados 
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedLocations, fetchedPosts] = await Promise.all([
          getLocations(),
          getPosts()
        ]);
        setLocations(fetchedLocations);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Erro ao carregar o mapa principal:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // filtra as localidades e reseta a paginação quando a busca muda
  useEffect(() => { 
    setLocPage(1); 
  }, [searchQuery]);

  const postsByLocation = (locationId: string) => posts.filter(p => p.locationId === locationId);

  const filteredLocations = useMemo(() => {
    return searchQuery.trim()
      ? locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : locations;
  }, [locations, searchQuery]);

  const recentPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [posts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Carregando mapa do campus...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-2xl m-auto"  style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header area */}
      <div className="pt-4 px-4 pb-3">
        <Breadcrumb items={[{ label: 'Mapa' }]} />
        <div className="flex items-center justify-between mt-3 mb-4">
          <div>
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: 22 }}>Campus Cuiabá</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              {posts.length} memórias registradas em {locations.length} locais
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Buscar locais..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl outline-none"
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 14,
              }}
            />
          </div>
          
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            ou
          </span>
          
          <button
            onClick={() => navigate('/app/search')}
            className="shrink-0 px-4 py-3 rounded-2xl font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgba(244,166,232,0.12)',
              color: '#F4A6E8',
              border: '1px solid rgba(244,166,232,0.25)',
              fontSize: 14,
            }}
          >
            Buscar memórias
          </button>
        </div>
      </div>

      {/* Leaflet Campus Map */}
      <div className="mx-4 md:mx-10 rounded-2xl overflow-hidden relative"
        style={{ height: 380, border: '1px solid rgba(255,255,255,0.08)' }}>
        <CampusMap
          onLocationClick={id => navigate(`/app/timeline/${id}`)}
          onLocationHover={setHoveredLocation}
          filteredIds={searchQuery.trim() ? filteredLocations.map(l => l.id) : undefined}
        />

        {/* Hover tooltip */}
        {hoveredLocation && (() => {
          const loc = locations.find(l => l.id === hoveredLocation);
          if (!loc) return null;
          
          const count = postsByLocation(hoveredLocation).length;
          return (
            <div className="absolute bottom-3 left-3 rounded-xl px-3 py-2 pointer-events-none z-[1000]"
              style={{ backgroundColor: 'rgba(13,13,13,0.92)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: '#F4A6E8' }} />
                <span className="text-white font-medium" style={{ fontSize: 13 }}>{loc.name}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                {count} memória{count !== 1 ? 's' : ''} · Clique para explorar
              </p>
            </div>
          );
        })()}
      </div>

      {/* Location list for mobile/quick access */}
      <div className="px-4 md:px-10 mt-6">
        {(() => {
          const PER_PAGE = 4;
          const sorted = [...filteredLocations].sort(
            (a, b) => postsByLocation(b.id).length - postsByLocation(a.id).length
          );
          const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
          const page = Math.min(locPage, totalPages);
          const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

          return (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white" style={{ fontWeight: 600, fontSize: 16 }}>Locais do Campus</h2>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                  {sorted.length} loca{sorted.length !== 1 ? 'is' : 'l'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pageItems.map((loc, rank) => {
                  const locPosts = postsByLocation(loc.id);
                  return (
                    <button key={loc.id}
                      onClick={() => navigate(`/app/timeline/${loc.id}`)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:bg-white/5 group"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(244,166,232,0.10)' }}>
                        <MapPin size={16} style={{ color: '#F4A6E8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate" style={{ fontSize: 14 }}>{loc.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                          {locPosts.length} memória{locPosts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Clock size={14} style={{ color: '#F4A6E8', opacity: 0.5, flexShrink: 0 }}
                        className="group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>

              {/* Paginator */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setLocPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-25"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n}
                      onClick={() => setLocPage(n)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold transition-all hover:opacity-80"
                      style={{
                        backgroundColor: n === page ? '#F4A6E8' : 'rgba(255,255,255,0.06)',
                        color: n === page ? '#0D0D0D' : 'rgba(255,255,255,0.5)',
                      }}>
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setLocPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-25"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                    ›
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Recent memories */}
      {recentPosts.length > 0 && (
        <div className="px-4 md:px-10 mt-6 pb-6">
          <h2 className="text-white mb-3" style={{ fontWeight: 600, fontSize: 16 }}>Memórias Recentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPosts.map(post => (
              <button key={post.id}
                onClick={() => navigate(`/app/post/${post.id}`)}
                className="rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] group"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={post.image} alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-medium leading-tight" style={{ fontSize: 13 }}>{post.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{ backgroundColor: 'rgba(244,166,232,0.12)', color: '#F4A6E8', border: '1px solid rgba(244,166,232,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}