import { Outlet, Navigate } from 'react-router';
import { useApp } from './AppContext';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Root() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      <Header />
      {/* pt accounts for floating header (h≈44px + top-4=16px + gap=12px = 72px)
          pb accounts for floating bottom nav (h≈56px + bottom-4=16px + gap=12px = 84px) */}
      <main className="pt-14 md:pt-[72px] pb-[84px] md:pb-6 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
