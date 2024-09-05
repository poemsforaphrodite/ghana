import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';

function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="dashboard">
        <div className="header">
          <h1>Welcome to the Dashboard</h1>
          <div className="user-info">
            Logged in as: <strong>{username}</strong> ({role})
          </div>
        </div>
        {role === 'admin' ? <AdminDashboard /> : <HRDashboard />}
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
}

export default Home;