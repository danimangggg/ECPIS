import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AutoContext';

const useProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const history = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      history.push('/signIn');
    }
  }, [isAuthenticated, loading, history]);

  return { isAuthenticated, loading };
};

export default useProtectedRoute;
