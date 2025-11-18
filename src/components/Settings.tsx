import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Manager } from '../types';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([
    {
      id: '1',
      name: 'Aida Sultanova',
      email: 'aida.sultanova@kazsupply.kz',
      role: 'sales',
      created: 'Jan 15, 2024',
    },
    {
      id: '2',
      name: 'Nursultan Bekov',
      email: 'nursultan.bekov@kazsupply.kz',
      role: 'manager',
      created: 'Feb 20, 2024',
    },
  ]);

  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    role: 'sales' as 'manager' | 'sales',
  });

  const isOwner = user?.role === 'owner';

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    const manager: Manager = {
      id: Date.now().toString(),
      ...newManager,
      created: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    setManagers([...managers, manager]);
    setNewManager({ name: '', email: '', role: 'sales' });
  };

  const handleDeleteManager = (id: string) => {
    if (!isOwner) return;
    setManagers(managers.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div className="header">
        <h1>Settings</h1>
        <p>Manage your team and settings</p>
      </div>

      <div className="managers-section">
        <div className="section-header">
          <h2>Managers</h2>
          <div style={{ color: '#666' }}>
            {isOwner
              ? 'Add and remove managers from your organization'
              : 'View organization managers'}
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
                    className={`role-badge ${manager.role === 'owner' ? 'role-owner' : manager.role === 'manager' ? 'role-manager' : 'role-sales'}`}
                  >
                    {manager.role.charAt(0).toUpperCase() +
                      manager.role.slice(1)}
                  </span>
                </td>
                <td>{manager.created}</td>
                <td>
                  <button className="btn btn-outline">💬</button>
                  {isOwner && manager.role !== 'owner' && (
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
    </div>
  );
};

export default Settings;
