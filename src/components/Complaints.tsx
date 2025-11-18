import React from 'react';
import { Complaint } from '../types';

const Complaints: React.FC = () => {
  const complaints: Complaint[] = [
    {
      id: '1',
      complaintNumber: 'CMP-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      subject: 'Defective bearing components',
      priority: 'high',
      status: 'in-progress',
      updated: 'Dec 25',
      orderNumber: 'ORD-2024-001',
      issueType: 'Quality Issue'
    },
    {
      id: '2',
      complaintNumber: 'CMP-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      subject: 'Delayed delivery',
      priority: 'medium',
      status: 'pending',
      updated: 'Dec 23',
      orderNumber: 'ORD-2024-002',
      issueType: 'Delivery Issue'
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
      issueType: 'Product Mismatch'
    }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-completed';
      default: return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div>
      <div className="header">
        <h1>Complaints</h1>
        <p>Manage customer complaints and resolve issues.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Complaints (3)</h2>
            <div className="filters">
              <select className="status-filter">
                <option>All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <select className="status-filter">
                <option>All Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <input 
                type="text" 
                placeholder="Search complaints..." 
                className="search-input"
                style={{ width: '200px' }}
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
            {complaints.map(complaint => (
              <React.Fragment key={complaint.id}>
                <tr>
                  <td style={{ fontWeight: '500' }}>{complaint.complaintNumber}</td>
                  <td style={{ fontWeight: '500' }}>{complaint.customer}</td>
                  <td style={{ fontWeight: '500' }}>{complaint.subject}</td>
                  <td className={getPriorityClass(complaint.priority)}>
                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                  </td>
                  <td className={getStatusClass(complaint.status)}>
                    {getStatusText(complaint.status)}
                  </td>
                  <td>{complaint.updated}</td>
                  <td>🔥</td>
                </tr>
                <tr>
                  <td colSpan={7} style={{ color: '#666', fontSize: '14px', paddingTop: '0' }}>
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