import { useState } from 'react';
import { loginWithGoogle, AuthDomainError } from '../../../lib/authService';

export function useGoogleAuth(){
   const [isSubmitting, setIsSubmitting] = useState(false); 
   const [error, setError] = useState('');

   const login = async () => {
      setError('');
      setIsSubmitting(true);
      try {
         await loginWithGoogle();
      } catch (err){
         setError(err instanceof AuthDomainError ? err.message: 'Falha ao entrar com o Google.');
         setIsSubmitting(false);
      }
   }
   return { login, isSubmitting, error };
}