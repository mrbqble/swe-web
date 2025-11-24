import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LinkRequests from './components/LinkRequests';
import LinkManagement from './components/LinkManagement';
import Orders from './components/Orders';
import Complaints from './components/Complaints';
import Chat from './components/Chat';
import Settings from './components/Settings';
import CatalogManagement from './components/CatalogManagement';
import Login from './components/Login';
import { useAuth } from './components/AuthContext';
import { isSupplierStaff, getRoleDisplayName } from './utils/permissions';
import { usePermissions } from './hooks/usePermissions';
import { useLanguage } from './hooks/useLanguage';

type Page =
  | 'dashboard'
  | 'link-requests'
  | 'orders'
  | 'complaints'
  | 'chat'
  | 'settings'
  | 'catalog';

// Access Denied component
const AccessDenied: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>Access Denied</h2>
    <p style={{ color: '#666', marginTop: '10px' }}>{message}</p>
  </div>
);

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const permissions = usePermissions();
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Set document language on mount and language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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

  // Enforce supplier staff only access
  if (!isSupplierStaff(user.role)) {
    return (
      <div className="loading-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Access Denied</h2>
          <p>This application is for supplier staff only.</p>
          <button onClick={logout} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Enforce page-level access control
    switch (currentPage) {
      case 'dashboard':
        if (!permissions.canAccessDashboard) {
          return <AccessDenied message="You don't have permission to access the Dashboard." />;
        }
        return <Dashboard />;
      case 'link-requests':
        if (!permissions.canAccessLinkRequests) {
          return <AccessDenied message="You don't have permission to access Link Requests." />;
        }
        return <LinkManagement />;
      case 'orders':
        if (!permissions.canAccessOrders) {
          return <AccessDenied message="You don't have permission to access Orders." />;
        }
        return <Orders />;
      case 'complaints':
        if (!permissions.canAccessComplaints) {
          return <AccessDenied message="You don't have permission to access Complaints." />;
        }
        return <Complaints />;
      case 'chat':
        if (!permissions.canAccessChat) {
          return <AccessDenied message="You don't have permission to access Chat." />;
        }
        return <Chat />;
      case 'settings':
        if (!permissions.canAccessSettings) {
          return <AccessDenied message="You don't have permission to access Settings." />;
        }
        return <Settings />;
      case 'catalog':
        if (!permissions.canManageProducts) {
          return <AccessDenied message="You don't have permission to access Catalog Management." />;
        }
        return <CatalogManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Redirect to dashboard if trying to access unauthorized page
  const handlePageChange = (page: Page) => {
    let targetPage = page;

    // Check permissions before allowing navigation
    switch (page) {
      case 'link-requests':
        if (!permissions.canAccessLinkRequests) {
          targetPage = 'dashboard';
        }
        break;
      case 'orders':
        if (!permissions.canAccessOrders) {
          targetPage = 'dashboard';
        }
        break;
      case 'complaints':
        if (!permissions.canAccessComplaints) {
          targetPage = 'dashboard';
        }
        break;
      case 'chat':
        if (!permissions.canAccessChat) {
          targetPage = 'dashboard';
        }
        break;
      case 'settings':
        if (!permissions.canAccessSettings) {
          targetPage = 'dashboard';
        }
        break;
      case 'catalog':
        if (!permissions.canManageProducts) {
          targetPage = 'dashboard';
        }
        break;
    }

    setCurrentPage(targetPage);
  };

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
                {getRoleDisplayName(user.role)}
              </div>
            </div>
          </div>
        </div>
        <ul className="sidebar-nav">
          {permissions.canAccessDashboard && (
            <li
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => handlePageChange('dashboard')}
            >
              Dashboard
            </li>
          )}
          {permissions.canAccessLinkRequests && (
            <li
              className={currentPage === 'link-requests' ? 'active' : ''}
              onClick={() => handlePageChange('link-requests')}
            >
              Link Requests
            </li>
          )}
          {permissions.canAccessOrders && (
            <li
              className={currentPage === 'orders' ? 'active' : ''}
              onClick={() => handlePageChange('orders')}
            >
              Orders
            </li>
          )}
          {permissions.canAccessComplaints && (
            <li
              className={currentPage === 'complaints' ? 'active' : ''}
              onClick={() => handlePageChange('complaints')}
            >
              Complaints
            </li>
          )}
          {permissions.canAccessChat && (
            <li
              className={currentPage === 'chat' ? 'active' : ''}
              onClick={() => handlePageChange('chat')}
            >
              Chat
            </li>
          )}
          {permissions.canManageProducts && (
            <li
              className={currentPage === 'catalog' ? 'active' : ''}
              onClick={() => handlePageChange('catalog')}
            >
              Catalog
            </li>
          )}
          {permissions.canAccessSettings && (
            <li
              className={currentPage === 'settings' ? 'active' : ''}
              onClick={() => handlePageChange('settings')}
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
