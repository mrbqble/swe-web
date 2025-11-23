import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LinkRequests from './components/LinkRequests';
import Orders from './components/Orders';
import Complaints from './components/Complaints';
import Chat from './components/Chat';
import Settings from './components/Settings';
import Login from './components/Login';
import { useAuth } from './components/AuthContext';

type Page =
  | 'dashboard'
  | 'link-requests'
  | 'orders'
  | 'complaints'
  | 'chat'
  | 'settings';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'link-requests':
        return <LinkRequests />;
      case 'orders':
        return <Orders />;
      case 'complaints':
        return <Complaints />;
      case 'chat':
        return <Chat />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Only supplier_owner and supplier_manager can access settings
  const canAccessSettings =
    user.role === 'supplier_owner' || user.role === 'supplier_manager';

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>SupplyKZ</h1>
          <div className="user-info">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">
                {user.role === 'supplier_owner'
                  ? 'Supplier Owner'
                  : user.role === 'supplier_manager'
                    ? 'Supplier Manager'
                    : user.role === 'supplier_sales'
                      ? 'Sales Representative'
                      : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
          </div>
        </div>
        <ul className="sidebar-nav">
          <li
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={currentPage === 'link-requests' ? 'active' : ''}
            onClick={() => setCurrentPage('link-requests')}
          >
            Link Requests
          </li>
          <li
            className={currentPage === 'orders' ? 'active' : ''}
            onClick={() => setCurrentPage('orders')}
          >
            Orders
          </li>
          <li
            className={currentPage === 'complaints' ? 'active' : ''}
            onClick={() => setCurrentPage('complaints')}
          >
            Complaints
          </li>
          <li
            className={currentPage === 'chat' ? 'active' : ''}
            onClick={() => setCurrentPage('chat')}
          >
            Chat
          </li>
          {canAccessSettings && (
            <li
              className={currentPage === 'settings' ? 'active' : ''}
              onClick={() => setCurrentPage('settings')}
            >
              Settings
            </li>
          )}
          <li onClick={logout} className="logout-button">
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">{renderPage()}</div>
    </div>
  );
}

// Main App component that doesn't use hooks directly
function App() {
  return <AppContent />;
}

export default App;
