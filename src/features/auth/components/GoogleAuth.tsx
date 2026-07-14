import { useGoogleAuth } from "../hooks/useGoogleAuth";

interface GoogleAuthProps {
   onClick: () => void;
   disabled: boolean;
   busy: boolean;
}

export function GoogleAuth({ onClick, disabled, busy}: GoogleAuthProps){
   const { login: loginWithGoogle, isSubmitting, error: googleError } = useGoogleAuth();
   
   return (
      <button type="button" onClick={onClick} disabled={disabled}
         className="w-full py-3 rounded-2xl font-semibold mb-4 transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
         style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 14 }}>
         {busy ? 'Sincronizando...' : 'Continuar com Google'}
      </button>
   )
}