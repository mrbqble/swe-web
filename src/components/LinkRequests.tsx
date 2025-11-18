import React from 'react';
import { LinkRequest } from '../types';

const LinkRequests: React.FC = () => {
  const linkRequests: LinkRequest[] = [
    {
      id: '1',
      requester: 'Dmitry Volkov',
      email: 'dmitry@almatytech.kz',
      organization: 'AlmatyTech Solutions',
      message: 'We are interested in sourcing industrial bearings f...',
      date: 'Dec 25, 2024',
      status: 'pending'
    },
    {
      id: '2',
      requester: 'Elena Kuznetsova',
      email: 'elena@astanaengineering.kz',
      organization: 'Astana Engineering Ltd',
      message: 'Looking for reliable supplier of heavy machinery c...',
      date: 'Dec 24, 2024',
      status: 'pending'
    },
    {
      id: '3',
      requester: 'Babyt Serikbayev',
      email: 'babyt@kazakhmetal.kz',
      organization: 'Kazakhstan Metal Works',
      message: 'We need high-quality metal processing equipment...',
      date: 'Dec 23, 2024',
      status: 'approved'
    },
    {
      id: '4',
      requester: 'Olga Petrova',
      email: 'olga@shymkentindustry.kz',
      organization: 'Shymkent Industrial Group',
      message: 'Interested in bulk orders of industrial supplies.',
      date: 'Dec 22, 2024',
      status: 'rejected'
    }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Link Requests</h1>
        <p>Manage consumer connection requests to your supplier account.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Connection Requests</h2>
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
            {linkRequests.map(request => (
              <React.Fragment key={request.id}>
                <tr>
                  <td>
                    <div style={{ fontWeight: '500' }}>{request.requester}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>{request.email}</div>
                  </td>
                  <td>{request.organization}</td>
                  <td>{request.date}</td>
                  <td className={getStatusClass(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      <button className="btn btn-primary">✓ Approve</button>
                    ) : (
                      <span style={{ color: '#666' }}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ color: '#666', fontSize: '14px', paddingTop: '0' }}>
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