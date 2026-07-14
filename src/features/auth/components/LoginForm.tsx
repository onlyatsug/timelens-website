import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm({ onError }: {onError: (msg: string) => void}){
   const { form, updateField, submit, isSubmitting } = useLoginForm();
   const [showPassword, setShowPassword] = useState(false);

   return (
      <form onSubmit={submit} className="flex flex-col gap-4 opacity-30 pointer-events-none" style={{ cursor: 'not-allowed' }}>
         <div className="flex flex-col gap-1.5">
         <div className="flex justify-between items-center">
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>E-mail institucional</label>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Em breve</span>
         </div>
         <input type="email" disabled placeholder="seu.nome@sou.ufmt.br"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
         />
         </div>

         <div className="flex flex-col gap-1.5">
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Senha</label>
            <div className="relative">
               <input type={showPassword ? 'text' : 'password'} disabled placeholder="••••••••"
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-2xl outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
               />
               <button type="button" disabled className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
               </button>
            </div>
         </div>
         <button type="submit" disabled
            className="w-full py-3 rounded-2xl font-semibold opacity-50"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            Entrar
         </button>
      </form>
   )
}