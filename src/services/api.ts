const API_URL = 'https://timelens-server-psi.vercel.app/api';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  bio: string;
  role: UserRole;
  joinDate: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  shortName: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lat: number;
  lng: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  eventDate: string;
  createdAt: string;
  authorId: string;
  locationId: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  type: 'event' | 'project' | 'collective' | 'general';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'mention' | 'proximity';
  body: string;
  postId?: string;
  createdAt: string;
  read: boolean;
}


// FUNÇÕES UTILITÁRIAS (Síncronas)

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Agora pouco';
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}sem atrás`;
  return formatDate(dateStr);
}


// SERVIÇOS DA API (Assíncronos)

// --- Autenticação ---
export async function syncUser(idToken: string, name?: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao sincronizar usuário com o backend');
  }
  return res.json();
}

// --- Usuários ---
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const res = await fetch(`${API_URL}/users/${userId}/posts`);
  return res.json();
}

// --- Locais ---
export async function getLocations(): Promise<CampusLocation[]> {
  const res = await fetch(`${API_URL}/locations`);
  return res.json();
}

export async function getLocationById(id: string): Promise<CampusLocation | undefined> {
  const res = await fetch(`${API_URL}/locations/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function getPostsByLocation(locationId: string): Promise<Post[]> {
  const res = await fetch(`${API_URL}/locations/${locationId}/posts`);
  return res.json();
}

export async function createLocation(data: Partial<CampusLocation>): Promise<CampusLocation> {
  const res = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error('Falha ao criar novo local');
  }
  
  return res.json();
}

// --- Posts (Memórias) ---
export async function getPosts(filters?: { tag?: string; locationId?: string; authorId?: string; type?: string; search?: string }): Promise<Post[]> {
  const url = new URL(`${API_URL}/posts`);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }
  const res = await fetch(url.toString());
  return res.json();
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const res = await fetch(`${API_URL}/posts/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao criar a memória');
  }
  
  return res.json();
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
}

export async function toggleLikePost(postId: string, userId: string): Promise<void> {
  await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

// --- Comentários ---
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`);
  return res.json();
}

export async function createComment(postId: string, authorId: string, content: string): Promise<Comment> {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorId, content }),
  });
  return res.json();
}

export async function deleteComment(id: string): Promise<void> {
  await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE' });
}

// --- Notificações ---
export async function getNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(`${API_URL}/notifications?userId=${userId}`);
  return res.json();
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

// --- Tags ---
export async function getTags(): Promise<string[]> {
  const res = await fetch(`${API_URL}/tags`);
  return res.json();
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  // Removendo o '#' caso venha, para evitar problemas na URL, dependendo de como sua API trata
  const safeTag = encodeURIComponent(tag);
  const res = await fetch(`${API_URL}/tags/${safeTag}/posts`);
  return res.json();
}