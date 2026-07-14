import type { AuthTab } from '../types/authTypes'

interface AuthTabsProps {
   tab: AuthTab;
   onChange: (tab: AuthTab) => void;
}

export function AuthTabs({tab, onChange}: AuthTabsProps) {
   return (
      <div className="flex rounded-2xl p-1 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
         {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => onChange(t)}
               className="flex-1 py-2 rounded-xl transition-all duration-200 capitalize text-sm font-medium"
               style={{ backgroundColor: tab === t ? '#F4A6E8' : 'transparent', color: tab === t ? '#0D0D0D' : 'rgba(255,255,255,0.5)' }}>
               {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
         ))}
      </div>
   )
}