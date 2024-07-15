import React from 'react';
import useProtectedRoute from './useProtectedRoute';

const ProtectedComponent = () => {
  const { isAuthenticated, loading } = useProtectedRoute();

  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading spinner
  }

  if (!isAuthenticated) {
    return null; // or a redirect can be handled by the hook
  }

  return (
    <div>
      <h2>Protected Content</h2>
      <p>This content is only visible to authenticated users.</p>
    </div>
  );
};

export default ProtectedComponent;
