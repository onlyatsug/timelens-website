import React, { useState } from 'react';
import type { LoginFormData } from '../types/authTypes';
import { loginWithEmail, AuthDomainError } from '../../../lib/authService';

export function useLoginForm(){
   const [form, setForm] = useState<LoginFormData>({email: '', password: ''});
   const [isSubmitting, setIsSubmitting] = useState(false); 
   const [error, setError] = useState('');

   const updateField = (field: keyof LoginFormData, value: string) =>
      setForm(f => ({ ...f, [field]: value }));

   const submit = async (e: React.SubmitEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);
      try {
         await loginWithEmail(form.email, form.password);
      } catch (err){
         setError(err instanceof AuthDomainError ? err.message: 'E-mail ou senha incorretos.');
         setIsSubmitting(false);
      }
   }
   return { form, updateField, submit, isSubmitting, error, setError }
}