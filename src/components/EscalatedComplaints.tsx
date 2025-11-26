import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from './AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { t, formatDateTime } from '../utils/i18n';

interface EscalatedComplaintDetail {
  id: number;
  order_id: number;
  consumer_id: number;
  sales_rep_id: number;
  manager_id: number;
  status: string;
  description: string;
  resolution: string | null;
  consumer_feedback: boolean | null;
  created_at: string;
  order?: {
    id: number;
    orderNumber?: string;
    status?: string;
  };
  consumer?: {
    id: number;
    organization_name: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

const EscalatedComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<EscalatedComplaintDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<EscalatedComplaintDetail | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const permissions = usePermissions();
  const { user } = useAuth();
  const { language } = useLanguage();

  const loadEscalatedComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all complaints and filter for escalated status on frontend
      const response = await dataService.getComplaints(1, 1000);
      const allComplaints = response.items || [];

      // Filter for escalated complaints
      const escalated = allComplaints
        .filter((complaint: any) => complaint.status === 'escalated')
        .map((complaint: any) => {
          // Fetch full details for each escalated complaint
          return {
            id: complaint.id || complaint.backendData?.id,
            order_id: complaint.backendData?.order_id || complaint.order_id,
            consumer_id: complaint.backendData?.consumer_id || complaint.consumer_id,
            sales_rep_id: complaint.backendData?.sales_rep_id || complaint.sales_rep_id,
            manager_id: complaint.backendData?.manager_id || complaint.manager_id,
            status: complaint.status || complaint.backendData?.status,
            description: complaint.backendData?.description || complaint.description,
            resolution: complaint.backendData?.resolution || complaint.resolution,
            consumer_feedback: complaint.backendData?.consumer_feedback || complaint.consumer_feedback,
            created_at: complaint.backendData?.created_at || complaint.created_at,
            order: complaint.backendData?.order || complaint.order,
            consumer: complaint.backendData?.consumer || complaint.consumer,
          };
        });

      // Load full details for each escalated complaint
      const detailedComplaints = await Promise.all(
        escalated.map(async (complaint) => {
          try {
            const detail = await dataService.getComplaint(complaint.id);
            return detail || complaint;
          } catch (error) {
            console.error(`Failed to load details for complaint ${complaint.id}:`, error);
            return complaint;
          }
        })
      );

      setComplaints(detailedComplaints);
    } catch (error) {
      console.error('Failed to load escalated complaints:', error);
      alert('Failed to load escalated complaints');
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEscalatedComplaints();
  }, [loadEscalatedComplaints]);

  const handleOpenChat = (complaint: EscalatedComplaintDetail) => {
    if ((window as any).navigateToChat && complaint.consumer_id) {
      // Navigate to chat with the consumer_id
      (window as any).navigateToChat(Number(complaint.consumer_id));
    } else {
      alert('Unable to open chat. Please try again.');
    }
  };

  const handleResolve = async (complaint: EscalatedComplaintDetail) => {
    if (!resolutionText.trim()) {
      alert('Please enter a resolution text');
      return;
    }

    if (!window.confirm('Are you sure you want to resolve this complaint?')) {
      return;
    }

    try {
      setIsResolving(true);
      await dataService.updateComplaintStatus(
        complaint.id,
        'resolved',
        resolutionText,
      );
      alert('Complaint resolved successfully');
      setShowResolutionInput(false);
      setResolutionText('');
      setSelectedComplaint(null);
      await loadEscalatedComplaints();
    } catch (error: any) {
      console.error('Failed to resolve complaint:', error);
      alert(error?.response?.data?.detail || 'Failed to resolve complaint');
    } finally {
      setIsResolving(false);
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

  if (isLoading) {
    return (
      <div>
        <div className="header">
          <h1>Escalated Complaints</h1>
          <p>Review and resolve escalated customer complaints.</p>
        </div>
        <div className="loading">Loading escalated complaints...</div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div>
        <div className="header">
          <h1>Escalated Complaints</h1>
          <p>Review and resolve escalated customer complaints.</p>
        </div>
        <div className="table-container">
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No escalated complaints found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Escalated Complaints</h1>
        <p>Review and resolve escalated customer complaints.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Escalated Complaints ({complaints.length})</h2>
        </div>

        {complaints.map((complaint) => {
          const consumer = (complaint.consumer as any) || {};
          const consumerName = consumer.user
            ? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
            : consumer.organization_name || `Consumer ${complaint.consumer_id}`;
          const consumerEmail = consumer.user?.email || 'N/A';
          const organization = consumer.organization_name || 'N/A';
          const isManager = user?.id === complaint.manager_id.toString();
          const canResolve = permissions.canResolveComplaints && isManager;

          return (
            <div
              key={complaint.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, marginBottom: '10px' }}>
                    Complaint #{complaint.id}
                  </h3>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    <span className={getStatusClass(complaint.status)}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                    {' • '}
                    Created: {formatDateTime(complaint.created_at, language)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {canResolve && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowResolutionInput(true);
                        setResolutionText(complaint.resolution || '');
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    className="btn btn-outline"
                    onClick={() => handleOpenChat(complaint)}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Open Chat
                  </button>
                </div>
              </div>

              {/* Complaint Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Consumer Information</h4>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Name:</strong> {consumerName}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Organization:</strong> {organization}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Email:</strong> {consumerEmail}
                    </div>
                    <div>
                      <strong>Consumer ID:</strong> {complaint.consumer_id}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Complaint Information</h4>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Order ID:</strong> {complaint.order_id}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Sales Rep ID:</strong> {complaint.sales_rep_id}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Manager ID:</strong> {complaint.manager_id}
                    </div>
                    {complaint.resolution && (
                      <div>
                        <strong>Resolution:</strong> {complaint.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ marginBottom: '10px' }}>Description</h4>
                <div
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                    minHeight: '60px',
                  }}
                >
                  {complaint.description || 'No description provided'}
                </div>
              </div>

              {/* Resolution Input Modal */}
              {showResolutionInput && selectedComplaint?.id === complaint.id && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '2px solid #007bff',
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Enter Resolution</h4>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Enter resolution details..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      marginBottom: '10px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleResolve(complaint)}
                      disabled={isResolving || !resolutionText.trim()}
                    >
                      {isResolving ? 'Resolving...' : 'Save Resolution'}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setShowResolutionInput(false);
                        setResolutionText('');
                        setSelectedComplaint(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscalatedComplaints;

