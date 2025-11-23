import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await dataService.getComplaints(
        1,
        20,
        statusFilter || undefined,
      );
      setComplaints(response.items);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      // Fallback to mock data if API fails
      setComplaints(getMockComplaints());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockComplaints = (): Complaint[] => [
    {
      id: '1',
      complaintNumber: 'CMP-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      subject: 'Defective bearing components',
      priority: 'high',
      status: 'open',
      updated: 'Dec 25',
      orderNumber: 'ORD-2024-001',
      issueType: 'Quality Issue',
    },
    {
      id: '2',
      complaintNumber: 'CMP-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      subject: 'Delayed delivery',
      priority: 'medium',
      status: 'open',
      updated: 'Dec 23',
      orderNumber: 'ORD-2024-002',
      issueType: 'Delivery Issue',
    },
    {
      id: '3',
      complaintNumber: 'CMP-2024-003',
      customer: 'Bakyt Serikbayev',
      organization: 'Kazakhstan Metal Works',
      subject: 'Incorrect product specifications',
      priority: 'medium',
      status: 'resolved',
      updated: 'Dec 22',
      orderNumber: '',
      issueType: 'Product Mismatch',
    },
  ];

  const handleStatusUpdate = async (
    complaintId: string,
    newStatus: string,
    resolution?: string,
  ) => {
    try {
      await dataService.updateComplaintStatus(
        parseInt(complaintId),
        newStatus,
        resolution,
      );
      loadComplaints(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      alert('Failed to update complaint status');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'status-pending';
      case 'escalated':
        return 'status-in-progress';
      case 'resolved':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const canManageComplaint =
    user?.role === 'supplier_owner' || user?.role === 'supplier_manager';

  const filteredComplaints = complaints
    .filter(
      (complaint) =>
        complaint.complaintNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter(
      (complaint) => !priorityFilter || complaint.priority === priorityFilter,
    );

  if (isLoading) {
    return (
      <div>
        <div className="header">
          <h1>Complaints</h1>
          <p>Manage customer complaints and resolve issues.</p>
        </div>
        <div className="loading">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Complaints</h1>
        <p>Manage customer complaints and resolve issues.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2>Complaints ({filteredComplaints.length})</h2>
            <div className="filters">
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                className="status-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="text"
                placeholder="Search complaints..."
                className="search-input"
                style={{ width: '200px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <React.Fragment key={complaint.id}>
                <tr>
                  <td style={{ fontWeight: '500' }}>
                    {complaint.complaintNumber}
                  </td>
                  <td style={{ fontWeight: '500' }}>{complaint.customer}</td>
                  <td style={{ fontWeight: '500' }}>{complaint.subject}</td>
                  <td className={getPriorityClass(complaint.priority)}>
                    {complaint.priority.charAt(0).toUpperCase() +
                      complaint.priority.slice(1)}
                  </td>
                  <td className={getStatusClass(complaint.status)}>
                    {getStatusText(complaint.status)}
                  </td>
                  <td>{complaint.updated}</td>
                  <td>
                    {canManageComplaint && complaint.status !== 'resolved' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {complaint.status === 'open' && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              handleStatusUpdate(complaint.id, 'escalated')
                            }
                          >
                            Escalate
                          </button>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const resolution = prompt('Enter resolution:');
                            if (resolution) {
                              handleStatusUpdate(
                                complaint.id,
                                'resolved',
                                resolution,
                              );
                            }
                          }}
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                    {complaint.status === 'resolved' && (
                      <span style={{ color: '#666' }}>Resolved</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={7}
                    style={{ color: '#666', fontSize: '14px', paddingTop: '0' }}
                  >
                    Order: {complaint.orderNumber} • {complaint.issueType}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
