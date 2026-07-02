import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Upload, X, CheckCircle, MapPin, Tag, AlertCircle, Plus } from 'lucide-react';
// Importações do Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getLocations, getTags, createPost, createLocation, CampusLocation } from '../../services/api';
import { useApp } from './AppContext';
import { Breadcrumb } from './Breadcrumb';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Step = 1 | 2 | 3;
type PostType = 'event' | 'project' | 'collective' | 'general';

const TAG_COLORS = ['#F4A6E8', '#F4A870', '#A6E8F4', '#A6F4A8', '#E8A6F4'];

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: 'general', label: 'Geral' },
  { id: 'event', label: 'Evento' },
  { id: 'project', label: 'Projeto' },
  { id: 'collective', label: 'Coletivo' },
];

export function NewMemory() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  const [step, setStep] = useState<Step>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [type, setType] = useState<PostType>('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  
  // Estados de Localização
  const [locationId, setLocationId] = useState('');
  const [mapPin, setMapPin] = useState<{ lat: number; lng: number } | null>(null);
  
  // ---> ESTADOS DO NOVO LOCAL (o erro estava aqui!) <---
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocShortName, setNewLocShortName] = useState('');
  
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [fetchedLocations, fetchedTags] = await Promise.all([
          getLocations(),
          getTags()
        ]);
        setLocations(fetchedLocations);
        setAllTags(fetchedTags);
      } catch (err) {
        console.error("Erro ao carregar opções do formulário:", err);
      }
    }
    loadFormOptions();
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem ultrapassa o tamanho máximo. Tente uma foto menor.');
      return;
    }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTag.startsWith('#') ? customTag : `#${customTag}`;
    if (t.length > 1 && !selectedTags.includes(t)) {
      setSelectedTags(prev => [...prev, t]);
    }
    setCustomTag('');
  };

  // Componente interno do Leaflet para capturar cliques
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setMapPin(e.latlng);
        setIsNewLocation(true);
        setLocationId('');
      },
    });
    return mapPin ? <Marker position={mapPin} /> : null;
  }

const handlePublish = async () => {
    setError('');
    
    if (!title.trim()) { setError('O título da memória não pode ficar em branco.'); return; }
    if (!content.trim()) { setError('O relato histórico é obrigatório.'); return; }
    if (!currentUser) { setError('Você precisa estar logado para publicar.'); return; }
    if (!locationId && !isNewLocation) { setError('Selecione um local ou clique no mapa.'); return; }

    setPublishing(true);
    
    try {
      // URL padrão caso o usuário não envie imagem
      let finalImageUrl = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&h=600'; 

      if (imageFile) {
        // Substitua com os dados que você pegou no Passo 1:
        const CLOUD_NAME = "ywlyewrt"; 
        const UPLOAD_PRESET = "uprql93c"; 

        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);

        // Faz a requisição direto para a API do Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Falha ao enviar a imagem para o servidor de hospedagem.');
        }

        const data = await response.json();
        finalImageUrl = data.secure_url; // 🔥 Aqui está o link público e curto da imagem!
      }

      let finalLocationId = locationId;

      if (isNewLocation) {
        if (!newLocName.trim() || !newLocShortName.trim() || !mapPin) {
          throw new Error('Preencha o nome do novo local e clique no mapa.');
        }

        const createdLocation = await createLocation({
          name: newLocName,
          shortName: newLocShortName,
          description: 'Local adicionado pela comunidade',
          lat: mapPin.lat,
          lng: mapPin.lng,
          x: 100, y: 100, width: 50, height: 50 
        });
        
        finalLocationId = createdLocation.id;
      }

      if (!finalLocationId) {
        throw new Error('Falha ao definir o local da memória.');
      }

      // Envia o post para o seu backend com a URL limpa do Cloudinary
      await createPost({
        title,
        content,
        image: finalImageUrl, 
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        authorId: currentUser.id,
        locationId: finalLocationId,
        tags: selectedTags,
        type,
      });

      setPublished(true);
      setTimeout(() => navigate('/app'), 2000);
      
    } catch (err: any) {
      console.error("Erro ao publicar memória:", err);
      setError(err.message || 'Ocorreu um erro ao publicar.');
    } finally {
      setPublishing(false);
    }
  };

  const STEP_LABELS = ['Mídia', 'Conteúdo', 'Localização'];

  if (published) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(244,166,232,0.2)' }}>
            <CheckCircle size={32} style={{ color: '#F4A6E8' }} />
          </div>
          <h2 className="text-white mb-2" style={{ fontWeight: 700, fontSize: 20 }}>Memória publicada!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Ela já está visível na linha do tempo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-10">
        <Breadcrumb items={[{ label: 'Mapa', path: '/app' }, { label: '+ Nova Memória' }]} />

        <h1 className="text-white mt-3 mb-6" style={{ fontWeight: 700, fontSize: 22 }}>Nova Memória</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as Step;
            const done = step > s;
            const active = step === s;
            return (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: done ? '#F4A6E8' : active ? 'rgba(244,166,232,0.2)' : 'rgba(255,255,255,0.05)',
                      color: done ? '#0D0D0D' : active ? '#F4A6E8' : 'rgba(255,255,255,0.3)',
                      border: active ? '2px solid #F4A6E8' : done ? 'none' : '2px solid rgba(255,255,255,0.1)',
                    }}>
                    {done ? <CheckCircle size={14} /> : s}
                  </div>
                  <span style={{ fontSize: 12, color: active ? '#F4A6E8' : 'rgba(255,255,255,0.35)' }}>{label}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px mx-1" style={{ backgroundColor: done ? '#F4A6E8' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(244,120,112,0.15)', border: '1px solid rgba(244,120,112,0.3)' }}>
            <AlertCircle size={15} style={{ color: '#F47870' }} />
            <p style={{ color: '#F47870', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* Step 1: Image */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setImagePreview(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 py-14 rounded-2xl border-dashed transition-all hover:border-[#F4A6E8]/50"
                style={{ border: '2px dashed rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(244,166,232,0.1)' }}>
                  <Upload size={28} style={{ color: '#F4A6E8' }} />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium" style={{ fontSize: 15 }}>Selecionar Fotografia</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>PNG, JPG até 10MB</p>
                </div>
              </button>
            )}

            <button onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Título da memória *</label>
              <input type="text" required placeholder="Ex: I SECOMP — Semana de Computação 2019"
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14 }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Categoria da memória *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POST_TYPES.map(t => (
                  <button key={t.id} type="button" onClick={() => setType(t.id)}
                    className="px-3 py-2 rounded-xl text-sm transition-all text-center"
                    style={{
                      backgroundColor: type === t.id ? 'rgba(244,166,232,0.12)' : 'rgba(255,255,255,0.04)',
                      color: type === t.id ? '#F4A6E8' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${type === t.id ? 'rgba(244,166,232,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      fontWeight: type === t.id ? 600 : 400,
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Relato histórico</label>
              <textarea rows={4} placeholder="Descreva o contexto, impacto e relevância desta memória para o campus..."
                value={content} onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl outline-none resize-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, lineHeight: 1.6 }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Data do evento</label>
              <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, colorScheme: 'dark' }}
              />
            </div>

{/* Tags */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <Tag size={14} /> Tags temáticas
              </label>

              {/* Top tags suggestion (Sugestões globais vindas do banco) */}
              <div className="mb-2">
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 6 }}>Tags em destaque</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map((tag, i) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: isSelected ? TAG_COLORS[i % TAG_COLORS.length] + '30' : TAG_COLORS[i % TAG_COLORS.length] + '15', 
                          color: TAG_COLORS[i % TAG_COLORS.length], 
                          border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}${isSelected ? '80' : '30'}`,
                          fontWeight: isSelected ? 600 : 400
                        }}>
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🔥 Minhas Tags Adicionadas (Mostra as tags ativas neste post) */}
              {selectedTags.length > 0 && (
                <div className="mb-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>Tags adicionadas a esta memória:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag, i) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: 'rgba(244,166,232,0.1)', 
                          color: '#F4A6E8', 
                          border: '1px solid rgba(244,166,232,0.25)' 
                        }}>
                        {tag}
                        <button type="button" onClick={() => toggleTag(tag)} className="hover:text-white transition-colors ml-0.5">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Campo para criar Tag Customizada */}
              <div className="flex gap-2">
                <input type="text" placeholder="#NovaTag" value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  className="flex-1 px-3 py-2 rounded-xl outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                />
                <button type="button" onClick={addCustomTag}
                  className="px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(244,166,232,0.1)', color: '#F4A6E8', border: '1px solid rgba(244,166,232,0.2)' }}>
                  Adicionar
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                Voltar
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
                Continuar
              </button>
            </div>

          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 mb-1" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <MapPin size={14} style={{ color: '#F4A6E8' }} /> Escolha um local abaixo ou clique no mapa *
              </label>

              {/* MAPA LEAFLET INTERATIVO */}
              <div className="rounded-2xl overflow-hidden relative z-0" style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0F1A0F' }}>
                <div style={{ height: 300 }}>
                  <MapContainer 
                    center={[-15.6035, -56.0875]}
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      className="map-tiles-dark"
                    />
                    <LocationPicker />
                  </MapContainer>
                </div>
              </div>

              {/* Se o usuário clicou no mapa (Local Novo) */}
              {isNewLocation && (
                <div className="mt-2 p-4 rounded-2xl flex flex-col gap-3" style={{ backgroundColor: 'rgba(244,166,232,0.05)', border: '1px solid rgba(244,166,232,0.2)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Plus size={16} style={{ color: '#F4A6E8' }} />
                      <p style={{ color: '#F4A6E8', fontSize: 14, fontWeight: 600 }}>Adicionando novo local</p>
                    </div>
                    {/* Botão de Cancelar para voltar à lista */}
                    <button type="button" onClick={() => { setIsNewLocation(false); setMapPin(null); setLocationId(''); }}
                      className="text-xs transition-colors hover:opacity-80" style={{ color: '#F47870' }}>
                      Cancelar
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Nome completo (Ex: Bloco Didático II)</label>
                    <input type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Nome curto (Ex: Bloco D2)</label>
                    <input type="text" value={newLocShortName} onChange={e => setNewLocShortName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Lista de Locais Existentes */}
              {!isNewLocation && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {locations.map(loc => (
                    <button key={loc.id} type="button" 
                      onClick={() => { 
                        setLocationId(loc.id); 
                        setIsNewLocation(false);
                        setMapPin({ lat: loc.lat, lng: loc.lng }); 
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:bg-white/5"
                      style={{
                        backgroundColor: locationId === loc.id ? 'rgba(244,166,232,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${locationId === loc.id ? 'rgba(244,166,232,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <MapPin size={14} style={{ color: locationId === loc.id ? '#F4A6E8' : 'rgba(255,255,255,0.3)' }} />
                      <span className="truncate" style={{ color: locationId === loc.id ? '#F4A6E8' : 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        {loc.shortName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                Voltar
              </button>
              <button onClick={handlePublish} disabled={publishing}
                className="flex-1 py-3 rounded-2xl font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F4A6E8', color: '#0D0D0D' }}>
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}