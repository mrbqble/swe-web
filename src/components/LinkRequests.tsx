import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { LinkRequest } from '../types';

const LinkRequests: React.FC = () => {
  const [linkRequests, setLinkRequests] = useState<LinkRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLinkRequests();
  }, []);

  const loadLinkRequests = async () => {
    try {
      const response = await dataService.getIncomingLinks();
      // Transform backend data to frontend format
      const transformedRequests: LinkRequest[] = response.items.map(
        (item: any) => ({
          id: item.id.toString(),
          requester: `User ${item.consumer_id}`, // You might want to fetch consumer details
          email: 'user@example.com', // You'll need to get this from consumer data
          organization: 'Organization', // You'll need to get this from consumer data
          message: 'Link request message...',
          date: new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          status: item.status,
        }),
      );
      setLinkRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to load link requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (linkId: string) => {
    try {
      await dataService.updateLinkStatus(parseInt(linkId), 'accepted');
      loadLinkRequests(); // Reload the list
    } catch (error) {
      console.error('Failed to approve link request:', error);
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
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApprove(request.id)}
                      >
                        ✓ Approve
                      </button>
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
