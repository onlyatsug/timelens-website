import { Outlet, Navigate } from 'react-router';
import { useApp } from './AppContext';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Root() {
  const { currentUser }:any = useApp();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      <Header />
      <main className="pt-14 md:pt-[72px] pb-[84px] md:pb-6 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
