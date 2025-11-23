import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Manager, Supplier } from '../types';
import { dataService } from '../services/dataService';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'managers' | 'suppliers'>(
    'managers',
  );
  const [managers, setManagers] = useState<Manager[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    role: 'sales' as 'manager' | 'sales',
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    companyName: '',
    email: '',
    isActive: true,
  });

  const isOwner = user?.role === 'supplier_owner';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (isOwner) {
        const [managersData, suppliersData] = await Promise.all([
          dataService.getManagers(),
          dataService.getSuppliers(),
        ]);
        setManagers(managersData);
        setSuppliers(suppliersData);
      } else {
        const managersData = await dataService.getManagers();
        setManagers(managersData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      const manager = await dataService.addManager(newManager);
      setManagers([...managers, manager]);
      setNewManager({ name: '', email: '', role: 'sales' });
    } catch (error) {
      console.error('Failed to add manager:', error);
      alert('Failed to add team member');
    }
  };

  const handleDeleteManager = async (id: string) => {
    if (!isOwner) return;

    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await dataService.deleteManager(id);
        setManagers(managers.filter((m) => m.id !== id));
      } catch (error) {
        console.error('Failed to delete manager:', error);
        alert('Failed to delete team member');
      }
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      const supplier = await dataService.createSupplier(newSupplier);
      setSuppliers([...suppliers, supplier]);
      setNewSupplier({ name: '', companyName: '', email: '', isActive: true });
    } catch (error) {
      console.error('Failed to add supplier:', error);
      alert('Failed to add supplier');
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="header">
          <h1>Settings</h1>
          <p>Manage your team and settings</p>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Settings</h1>
        <p>Manage your team and settings</p>
      </div>

      {/* Tab Navigation */}
      {isOwner && (
        <div className="tab-navigation" style={{ marginBottom: '20px' }}>
          <button
            className={`tab-button ${activeTab === 'managers' ? 'active' : ''}`}
            onClick={() => setActiveTab('managers')}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: activeTab === 'managers' ? '#007bff' : 'white',
              color: activeTab === 'managers' ? 'white' : '#333',
              cursor: 'pointer',
            }}
          >
            Team Management
          </button>
          <button
            className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: activeTab === 'suppliers' ? '#007bff' : 'white',
              color: activeTab === 'suppliers' ? 'white' : '#333',
              cursor: 'pointer',
            }}
          >
            Supplier Management
          </button>
        </div>
      )}

      {/* Team Management Tab */}
      {activeTab === 'managers' && (
        <div className="managers-section">
          <div className="section-header">
            <h2>Team Management</h2>
            <div style={{ color: '#666' }}>
              {isOwner
                ? 'Add and remove team members from your organization'
                : 'View organization team members'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Sales Representatives</h3>
          </div>

          {/* Add Manager Form - Only for Owner */}
          {isOwner && (
            <form onSubmit={handleAddManager} className="add-manager-form">
              <h4>Add New Team Member</h4>
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-end',
                  marginBottom: '20px',
                }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={newManager.name}
                    onChange={(e) =>
                      setNewManager({ ...newManager, name: e.target.value })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={newManager.email}
                    onChange={(e) =>
                      setNewManager({ ...newManager, email: e.target.value })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newManager.role}
                    onChange={(e) =>
                      setNewManager({
                        ...newManager,
                        role: e.target.value as 'manager' | 'sales',
                      })
                    }
                    style={{ width: '120px' }}
                  >
                    <option value="sales">Sales</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          )}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td style={{ fontWeight: '500' }}>{manager.name}</td>
                  <td>{manager.email}</td>
                  <td>
                    <span
                      className={`role-badge ${manager.role === 'manager' ? 'role-manager' : 'role-sales'}`}
                    >
                      {manager.role.charAt(0).toUpperCase() +
                        manager.role.slice(1)}
                    </span>
                  </td>
                  <td>{manager.created}</td>
                  <td>
                    <button className="btn btn-outline">💬</button>
                    {isOwner && (
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDeleteManager(manager.id)}
                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isOwner && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                color: '#666',
                textAlign: 'center',
              }}
            >
              Only owners can add or remove team members.
            </div>
          )}
        </div>
      )}

      {/* Supplier Management Tab */}
      {activeTab === 'suppliers' && isOwner && (
        <div className="suppliers-section">
          <div className="section-header">
            <h2>Supplier Management</h2>
            <div style={{ color: '#666' }}>
              Manage your supplier accounts and information
            </div>
          </div>

          {/* Add Supplier Form */}
          <form onSubmit={handleAddSupplier} className="add-supplier-form">
            <h4>Add New Supplier</h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={newSupplier.companyName}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      companyName: e.target.value,
                    })
                  }
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newSupplier.isActive.toString()}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      isActive: e.target.value === 'true',
                    })
                  }
                  style={{ width: '100%' }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Supplier
            </button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td style={{ fontWeight: '500' }}>{supplier.name}</td>
                  <td>{supplier.companyName}</td>
                  <td>{supplier.email}</td>
                  <td>
                    <span
                      className={`status-badge ${supplier.isActive ? 'status-completed' : 'status-rejected'}`}
                    >
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{supplier.created}</td>
                  <td>
                    <button className="btn btn-outline">Edit</button>
                    <button
                      className="btn btn-outline"
                      style={{
                        color: '#ef4444',
                        borderColor: '#ef4444',
                        marginLeft: '5px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Settings;
