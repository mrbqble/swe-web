import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { LinkRequest } from '../types';
import { useAuth } from './AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const LinkRequests: React.FC = () => {
  const [linkRequests, setLinkRequests] = useState<LinkRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const permissions = usePermissions();

  const loadLinkRequests = useCallback(async () => {
    try {
      const response = await dataService.getIncomingLinks();
      // Transform backend data to frontend format
      const transformedRequests: LinkRequest[] = response.items.map(
        (item: any) => {
          // Use consumer data from backend if available
          const consumer = item.consumer || {};
          const consumerName = consumer.user
            ? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
            : consumer.organization_name || `Consumer ${item.consumer_id}`;
          const consumerEmail = consumer.user?.email || 'N/A';
          const organization = consumer.organization_name || 'N/A';

          return {
            id: item.id.toString(),
            requester: consumerName,
            email: consumerEmail,
            organization: organization,
            message: item.message || 'Requesting to connect with your supplier account',
            date: new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            status: item.status,
            backendData: item, // Keep original data for reference
          };
        },
      );
      setLinkRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to load link requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinkRequests();
  }, [loadLinkRequests]);

  const handleApprove = async (linkId: string) => {
    if (!permissions.canApproveLinkRequests) {
      alert('You do not have permission to approve link requests');
      return;
    }
    try {
      await dataService.updateLinkStatus(parseInt(linkId), 'accepted');
      loadLinkRequests(); // Reload the list
    } catch (error) {
      console.error('Failed to approve link request:', error);
      alert('Failed to approve link request');
    }
  };

  const handleReject = async (linkId: string) => {
    if (!permissions.canRejectLinkRequests) {
      alert('You do not have permission to reject link requests');
      return;
    }
    try {
      await dataService.updateLinkStatus(parseInt(linkId), 'denied');
      loadLinkRequests(); // Reload the list
    } catch (error) {
      console.error('Failed to reject link request:', error);
      alert('Failed to reject link request');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-approved';
      case 'denied':
        return 'status-rejected';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="header">
        <h1>Link Requests</h1>
        <p>Manage consumer connection requests to your supplier account.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Connection Requests ({linkRequests.length})</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Requester</th>
              <th>Organization</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {linkRequests.map((request) => (
              <React.Fragment key={request.id}>
                <tr>
                  <td>
                    <div style={{ fontWeight: '500' }}>{request.requester}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {request.email}
                    </div>
                  </td>
                  <td>{request.organization}</td>
                  <td>{request.date}</td>
                  <td className={getStatusClass(request.status)}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      permissions.canApproveLinkRequests ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleApprove(request.id)}
                          >
                            ✓ Approve
                          </button>
                          {permissions.canRejectLinkRequests && (
                            <button
                              className="btn btn-outline"
                              onClick={() => handleReject(request.id)}
                              style={{ color: '#ef4444', borderColor: '#ef4444' }}
                            >
                              ✗ Reject
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#666' }}>No permission</span>
                      )
                    ) : (
                      <span style={{ color: '#666' }}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={5}
                    style={{ color: '#666', fontSize: '14px', paddingTop: '0' }}
                  >
                    {request.message}
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

export default LinkRequests;
