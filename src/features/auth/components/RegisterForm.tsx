import { useState } from 'react';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function RegisterForm({ onError }: {onError: (msg: string) => void}){
   const { form, updateField, submit, isSubmitting } = useRegisterForm();
   const [showPassword, setShowPassword] = useState(false);

   return (
      <form onSubmit={submit} className="flex flex-col gap-4 opacity-30 pointer-events-none" style={{ cursor: 'not-allowed' }}>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Nome completo</label>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Em breve</span>
          </div>
          <input type="text" disabled placeholder="Seu nome"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>E-mail institucional</label>
          <input type="email" disabled placeholder="seu.nome@aluno.ufmt.br"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Senha</label>
          <input type="password" disabled placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={e => updateField('password', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Confirmar senha</label>
          <input type="password" disabled placeholder="Repita a senha"
            value={form.confirm}
            onChange={e => updateField('confirm', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
          />
        </div>
        <button type="submit" disabled
          className="w-full py-3 rounded-2xl font-semibold opacity-50"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
          Criar conta
        </button>
      </form>
   )
}