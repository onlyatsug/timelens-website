import React, { useState } from 'react';
import type { RegisterFormData } from '../types/authTypes';
import { registerWithEmail, AuthDomainError } from '../../../lib/authService';

export function useRegisterForm(){
   const [form, setForm] = useState<RegisterFormData>({ name: '', email: '', password: '', confirm: '' });
   const [isSubmitting, setIsSubmitting] = useState(false); 
   const [error, setError] = useState('');

   const updateField = (field: keyof RegisterFormData, value: string) =>
      setForm(f => ({ ...f, [field]: value }));

   const submit = async (e: React.SubmitEvent) => {
      e.preventDefault();
      setError('');
      if (form.password.length < 8) return setError('A senha deve ter ao menos 8 caracteres!');
      if (form.password == form.confirm) return setError('As senhas não coincidem!');
      setIsSubmitting(true);
      try {
         await registerWithEmail(form.name, form.email, form.password);
      } catch (err){
         setError(err instanceof AuthDomainError ? err.message: 'Não foi possível criar a conta.');
         setIsSubmitting(false);
      }
   }
   return { form, updateField, submit, isSubmitting, error, setError }
}