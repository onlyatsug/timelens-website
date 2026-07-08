import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Heart, MessageCircle, Share2, MapPin, Calendar, Trash2, Send, ArrowLeft, X } from 'lucide-react';

import { 
  getPostById, 
  getLocationById, 
  getUserById, 
  getCommentsByPost, 
  createComment, 
  deleteComment, 
  toggleLikePost, 
  formatDate, 
  timeAgo,
  Post,
  CampusLocation,
  User,
  Comment
} from '../../services/api';
import { useApp } from './AppContext';
import { Breadcrumb } from './Breadcrumb';
import { ImageWithFallback } from './figma/ImageWithFallback';

const TAG_COLORS = ['#F4A6E8', '#F4A870', '#A6E8F4', '#A6F4A8', '#E8A6F4'];

export function PostExpanded() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser }:any = useApp();
  
  const [activeTab, setActiveTab] = useState<'conteudo' | 'comentarios'>('conteudo');
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // estados
  const [post, setPost] = useState<Post | null>(null);
  const [location, setLocation] = useState<CampusLocation | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  // foca no input se a URL tiver #comments
  useEffect(() => {
    if (window.location.hash === '#comments') {
      setActiveTab('comentarios');
      setTimeout(() => commentInputRef.current?.focus(), 300);
    }
  }, []);

  // fecha o modal de imagem com ESC
  useEffect(() => {
    if (!showImageModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowImageModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal]);

  // busca os dados da memória
  useEffect(() => {
    if (!postId) return;

    async function loadData() {
      setLoading(true);
      try {
        if (!postId) return;
        const fetchedPost = await getPostById(postId);
        
        if (fetchedPost) {
          setPost(fetchedPost);

          const [fetchedLoc, fetchedAuthor, fetchedComments] = await Promise.all([
            getLocationById(fetchedPost.locationId),
            getUserById(fetchedPost.authorId),
            getCommentsByPost(postId)
          ]);

          setLocation(fetchedLoc || null);
          setAuthor(fetchedAuthor || null);
          setPostComments(fetchedComments);

          const authorIds = Array.from(new Set(fetchedComments.map(c => c.authorId)));
          const usersData = await Promise.all(authorIds.map(id => getUserById(id)));
          
          const usersMap: Record<string, User> = {};
          usersData.forEach(u => {
            if (u) usersMap[u.id] = u;
          });
          setUsersCache(usersMap);
        }
      } catch (error) {
        console.error("Erro ao carregar memória:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [postId]);

  const handleLike = async () => {
    if (!currentUser || !post) return;
    
    const isLiked = post.likedBy.includes(currentUser.id);

    setPost({
      ...post,
      likes: isLiked ? post.likes - 1 : post.likes + 1,
      likedBy: isLiked 
        ? post.likedBy.filter(id => id !== currentUser.id) 
        : [...post.likedBy, currentUser.id]
    });

    try {
      await toggleLikePost(post.id, currentUser.id);
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post || !currentUser) return;
    
    const text = commentText;
    setCommentText('');

    try {
      const newComment = await createComment(post.id, currentUser.id, text);
      setPostComments(prev => [...prev, newComment]);
      
      if (!usersCache[currentUser.id]) {
        setUsersCache(prev => ({ ...prev, [currentUser.id]: currentUser }));
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setPostComments(prev => prev.filter(c => c.id !== commentId));
    
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Carregando memória...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center">
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Memória não encontrada.</p>
          <button onClick={() => navigate('/app')} className="mt-4 px-4 py-2 rounded-xl text-sm transition-colors hover:opacity-80"
            style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
            Voltar ao Mapa
          </button>
        </div>
      </div>
    );
  }

  const liked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const breadcrumbItems = location
    ? [{ label: 'Mapa', path: '/app' }, { label: location.shortName, path: `/app/timeline/${location.id}` }, { label: 'Linha do Tempo', path: `/app/timeline/${location.id}` }, { label: post.title }]
    : [{ label: 'Mapa', path: '/app' }, { label: post.title }];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        {/* mobile back button */}
        <button onClick={() => navigate(-1)} className="flex md:hidden items-center gap-2 mb-3 transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.5)' }}>
          <ArrowLeft size={18} />
          <span style={{ fontSize: 14 }}>Voltar</span>
        </button>

        <div className="hidden md:block mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* hero image */}
        <div
          className="rounded-2xl overflow-hidden mb-5 relative flex items-center justify-center cursor-pointer group"
          style={{ aspectRatio: '16/9', backgroundColor: '#000' }}
          onClick={() => setShowImageModal(true)}
        >
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />

          {/* engagement overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleLike}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: liked ? '#F4A6E8' : 'white' }}>
              <Heart size={16} fill={liked ? '#F4A6E8' : 'none'} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{post.likes}</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => { setActiveTab('comentarios'); commentInputRef.current?.focus(); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white' }}>
                <MessageCircle size={16} />
                <span style={{ fontSize: 13 }}>{postComments.length}</span>
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: copied ? 'rgba(244,166,232,0.8)' : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: copied ? '#0D0D0D' : 'white' }}>
                <Share2 size={16} />
                <span style={{ fontSize: 13 }}>{copied ? 'Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* card */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {(['conteudo', 'comentarios'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-sm transition-all duration-200"
                style={{
                  color: activeTab === tab ? '#F4A6E8' : 'rgba(255,255,255,0.4)',
                  fontWeight: activeTab === tab ? 600 : 400,
                  borderBottom: activeTab === tab ? '2px solid #F4A6E8' : '2px solid transparent',
                }}>
                {tab === 'conteudo' ? 'Conteúdo' : `Comentários (${postComments.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'conteudo' ? (
            <div className="p-5">
              <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.4 }}>
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                {author && (
                  <button onClick={() => navigate(`/app/profile/${author.id}`)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover" />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{author.name}</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{formatDate(post.eventDate)}</span>
                </div>
                {location && (
                  <button onClick={() => navigate(`/app/timeline/${location.id}`)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <MapPin size={13} style={{ color: '#F4A870' }} />
                    <span style={{ color: '#F4A870', fontSize: 13 }}>{location.shortName}</span>
                  </button>
                )}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7 }} className="mb-4">
                {post.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <button key={tag}
                    onClick={() => navigate(`/app/search?tag=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 rounded-full text-xs transition-all hover:opacity-90"
                    style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + '15', color: TAG_COLORS[i % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}35` }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <form onSubmit={handleSubmitComment}
                className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {currentUser && (
                  <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                )}
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Adicione um comentário... Use @nome para mencionar"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                />
                <button type="submit" disabled={!commentText.trim()}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
                  <Send size={14} />
                </button>
              </form>
              
              <div className="divide-y" style={{ ['--tw-divide-color' as any]: 'rgba(255,255,255,0.04)' }}>
                {postComments.length === 0 ? (
                  <div className="text-center py-10">
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Nenhum comentário ainda.</p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 4 }}>Seja o primeiro a comentar!</p>
                  </div>
                ) : (
                  postComments.map(comment => {
                    const commentAuthor = usersCache[comment.authorId] || { name: 'Usuário', avatar: 'https://via.placeholder.com/100', id: comment.authorId };
                    const canDelete = currentUser?.id === comment.authorId || currentUser?.role === 'admin';
                    const contentWithMentions = comment.content.replace(/@(\S+)/g, (_, name) => `<span style="color:#F4A6E8">@${name}</span>`);
                    
                    return (
                      <div key={comment.id} className="flex gap-3 p-4 group">
                        <img src={commentAuthor.avatar} alt={commentAuthor.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer transition-transform hover:scale-105"
                          onClick={() => navigate(`/app/profile/${commentAuthor.id}`)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <button onClick={() => navigate(`/app/profile/${commentAuthor.id}`)}
                              className="font-medium hover:opacity-80 transition-opacity"
                              style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                              {commentAuthor.name}
                            </button>
                            <div className="flex items-center gap-2">
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{timeAgo(comment.createdAt)}</span>
                              {canDelete && (
                                <button onClick={() => handleDeleteComment(comment.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: '#F47870' }}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.5, marginTop: 2 }}
                            dangerouslySetInnerHTML={{ __html: contentWithMentions }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {location && (
          <button onClick={() => navigate(`/app/timeline/${location.id}`)}
            className="mt-4 w-full py-3 rounded-2xl text-sm font-medium transition-colors hover:opacity-80"
            style={{ border: '1px solid rgba(244,166,232,0.25)', color: '#F4A6E8', backgroundColor: 'rgba(244,166,232,0.06)' }}>
            Ver Linha do Tempo Completa de {location.shortName}
          </button>
        )}
      </div>

      {/* modal de imagem em tamanho completo */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
          >
            <X size={20} />
          </button>
          <img
            src={post.image}
            alt={post.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}