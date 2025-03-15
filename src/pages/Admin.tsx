
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Admin: React.FC = () => {
  // Normally, this would be handled by a proper auth system
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // Simple demonstration login - in a real app, this would validate with a backend
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard />;
};

export default Admin;
