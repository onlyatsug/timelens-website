import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
// Removemos o ./data e importamos a API
import { getLocations, getPosts, CampusLocation, Post } from '../../services/api';

const CAMPUS_CENTER: [number, number] = [-15.609437, -56.06549];
const ZOOM = 16;

function createPinIcon(count: number) {
  const html = `<div style="width:44px;height:44px;position:relative"><div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#F4A6E8;transform:rotate(-45deg);border:3px solid #0D0D0D;box-shadow:0 3px 14px rgba(244,166,232,0.55);position:absolute;top:0;left:0"></div><span style="position:absolute;top:7px;left:9px;color:#0D0D0D;font-weight:700;font-size:12px;line-height:1;font-family:Syne,sans-serif;z-index:1;width:100%;text-align:center;margin-left:-9px;">${count}</span></div>`;
  return L.divIcon({ className: '', html, iconSize: [44, 44], iconAnchor: [19, 38] });
}

interface CampusMapProps {
  onLocationClick: (id: string) => void;
  onLocationHover: (id: string | null) => void;
  filteredIds?: string[];
}

export function CampusMap({ onLocationClick, onLocationHover, filteredIds }: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const callbacksRef = useRef({ onLocationClick, onLocationHover });

  // Estados da API
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Mantém as callbacks atualizadas sem precisar recriar o mapa
  useEffect(() => {
    callbacksRef.current = { onLocationClick, onLocationHover };
  });

  // 1. Busca os dados da API
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedLocs, fetchedPosts] = await Promise.all([
          getLocations(),
          getPosts()
        ]);
        setLocations(fetchedLocs);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Erro ao buscar dados para o mapa:", error);
      }
    }
    fetchData();
  }, []);

  // 2. Inicializa a base do mapa UMA ÚNICA VEZ
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CAMPUS_CENTER,
      zoom: ZOOM,
      scrollWheelZoom: true,
      zoomControl: true,
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      //attribution: '<p>work in progress</p>',
      //subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // 3. Adiciona ou atualiza os pinos (markers) quando os dados chegarem
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove os pinos antigos antes de desenhar os novos para evitar duplicação
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    locations.forEach(loc => {
      const count = posts.filter(p => p.locationId === loc.id).length;
      const marker = L.marker([loc.lat, loc.lng], { icon: createPinIcon(count) }).addTo(map);
      
      marker.on('click', () => callbacksRef.current.onLocationClick(loc.id));
      marker.on('mouseover', () => callbacksRef.current.onLocationHover(loc.id));
      marker.on('mouseout', () => callbacksRef.current.onLocationHover(null));
      
      markersRef.current[loc.id] = marker;
    });

    // Reaplica a opacidade caso já exista um filtro ativo
    if (filteredIds) {
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const dimmed = filteredIds.length > 0 && !filteredIds.includes(id);
        marker.setOpacity(dimmed ? 0.35 : 1);
      });
    }

  }, [locations, posts]); // Roda sempre que novas localidades ou posts chegarem do banco

  // 4. Atualiza a opacidade dos pinos ao pesquisar (filtrar)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const dimmed = filteredIds && filteredIds.length > 0 && !filteredIds.includes(id);
      marker.setOpacity(dimmed ? 0.35 : 1);
    });
  }, [filteredIds]);

  return (
    <>
      <style>{`
        .leaflet-container { background: #0A120A; font-family: 'Syne', sans-serif; }
        .leaflet-control-zoom a { background: #1A1A1A !important; color: #F4A6E8 !important; border-color: rgba(255,255,255,0.12) !important; }
        .leaflet-control-zoom a:hover { background: #262626 !important; }
        .leaflet-control-attribution { background: rgba(13,13,13,0.75) !important; color: rgba(255,255,255,0.3) !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: rgba(244,166,232,0.6) !important; }
      `}</style>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </>
  );
}