import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '@/app/AppContext';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const { currentUser, loading: globalLoading }:any = useApp(); 

  useEffect(() => {
    if (currentUser && !globalLoading) {
      navigate('/app');
    }
  }, [currentUser, globalLoading, navigate]);

  return { globalLoading };
}
