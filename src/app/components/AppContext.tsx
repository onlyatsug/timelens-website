import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '../../services/api';
import { syncUser } from '../../services/api';
import { watchAuthState, logout as firebaseLogout, getIdToken } from '../../lib/authService';

interface AppContextValue {
  currentUser: User | null;
  // Exposto para o Auth.tsx setar o usuário assim que o login/cadastro
  // no Firebase + sincronização com o backend terminam.
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
  blockedUsers: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Observa o estado de autenticação do Firebase. Isso roda:
  // - uma vez no carregamento (restaura a sessão se o usuário já
  //   tinha logado antes, sem precisar de auto-login mockado)
  // - toda vez que o usuário loga/desloga (inclusive vindo do Auth.tsx)
  useEffect(() => {
    const unsubscribe = watchAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsInitializing(false);
        return;
      }
      try {
        const idToken = await getIdToken();
        if (!idToken) throw new Error('Token indisponível');
        const user = await syncUser(idToken);
        setCurrentUser(user);
      } catch (error) {
        console.error('Falha ao sincronizar usuário autenticado:', error);
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogout();
    setCurrentUser(null);
  }, []);

  // Bloqueio de usuários mantido localmente (já que o backend atual não tem tabela de bloqueios)
  const blockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => [...prev, userId]);
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  // Evita renderizar o app antes de saber se há uma sessão do Firebase ativa
  if (isInitializing) {
    return <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }} />;
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout,
      blockedUsers,
      blockUser,
      unblockUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return ctx;
}