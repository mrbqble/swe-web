import React, { useState, useEffect, useCallback } from 'react';
import { Complaint } from '../types';
import { dataService } from '../services/dataService';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from './AuthContext';
import ComplaintDetail from './ComplaintDetail';

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const permissions = usePermissions();
  const { user } = useAuth();

  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await dataService.getComplaints(
        currentPage,
        20,
        statusFilter || undefined,
      );
      setComplaints(response.items || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

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
      alert(`Complaint ${newStatus === 'escalated' ? 'escalated' : 'resolved'} successfully`);
      loadComplaints(); // Reload to reflect changes
      if (selectedComplaintId === complaintId) {
        setSelectedComplaintId(null); // Close detail if open
      }
    } catch (error: any) {
      console.error('Failed to update complaint status:', error);
      alert(error?.response?.data?.detail || 'Failed to update complaint status');
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => setSelectedComplaintId(complaint.id)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        View Details
                      </button>
                      {complaint.status !== 'resolved' && (
                        <>
                          {complaint.status === 'open' && permissions.canEscalateComplaints && (
                            <button
                              className="btn btn-outline"
                              onClick={() =>
                                handleStatusUpdate(complaint.id, 'escalated')
                              }
                              style={{
                                fontSize: '12px',
                                padding: '4px 8px',
                                color: '#ff9800',
                                borderColor: '#ff9800',
                              }}
                            >
                              Escalate
                            </button>
                          )}
                          {permissions.canResolveComplaints && (
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
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Resolve
                            </button>
                          )}
                        </>
                      )}
                    </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onStatusUpdate={loadComplaints}
        />
      )}
    </div>
  );
};

export default Complaints;
