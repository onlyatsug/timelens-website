import { AuthCard, useAuthRedirect } from '@/features/auth'

export default function AuthPage() {
  const { globalLoading } = useAuthRedirect();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="fixed top-20 -left-20 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F4A6E8, transparent)' }} />
      <div className="fixed bottom-20 -right-20 w-80 h-80 rounded-full opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F4A870, transparent)' }} />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>Timelens</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>O memorial do tempo e espaço da UFMT</p>
        </div>
        <AuthCard globalLoading={globalLoading}/>
        <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          Universidade Federal de Mato Grosso · Campus Cuiabá
        </p>
      </div>
    </div>
  );
}