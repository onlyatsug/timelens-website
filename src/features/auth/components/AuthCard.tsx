import { useState } from 'react';

// components
import { FormError } from './FormError';
import { AuthTabs } from './AuthTabs';
import { GoogleAuth } from './GoogleAuth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

// hooks
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function AuthCard({ globalLoading }: {globalLoading: boolean}) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login: loginWithGoogle, isSubmitting, error: googleError } = useGoogleAuth();
  const isBusy = isSubmitting || globalLoading

  return (
    <div className="rounded-3xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
      <AuthTabs tab={tab} onChange={setTab}/>

      <FormError message={googleError}/>

      <GoogleAuth onClick={loginWithGoogle} disabled={isBusy} busy={isBusy}/>

      <div className="flex items-center gap-3 mb-4 opacity-30 pointer-events-none">
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>ou</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </div>
      {tab === 'login' ? (<LoginForm onError={() => {} }/>) : (<RegisterForm onError={() => {} }/>)}
    </div>
  );
}