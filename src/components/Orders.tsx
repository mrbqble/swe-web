import React from 'react';
import { Order } from '../types';

const Orders: React.FC = () => {
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      date: 'Dec 25, 2024',
      amount: '₸62,500',
      status: 'pending',
      items: 1
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      date: 'Dec 24, 2024',
      amount: '₸26,250',
      status: 'in-progress',
      items: 1
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: 'Bakyt Serikbayev',
      organization: 'Kazakhstan Metal Works',
      date: 'Dec 23, 2024',
      amount: '₸45,000',
      status: 'completed',
      items: 1
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customer: 'Olga Petrova',
      organization: 'Shymkent Industrial Group',
      date: 'Dec 22, 2024',
      amount: '₸9,600',
      status: 'rejected',
      items: 1
    }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
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
        <h1>Orders</h1>
        <p>Manage customer orders and track fulfillment status.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Orders (4)</h2>
            <div className="filters">
              <select className="status-filter">
                <option>All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Rejected</option>
              </select>
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="search-input"
                style={{ width: '200px' }}
              />
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{order.orderNumber}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>{order.items} item</div>
                </td>
                <td>
                  <div style={{ fontWeight: '500' }}>{order.customer}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>{order.organization}</div>
                </td>
                <td>{order.date}</td>
                <td style={{ fontWeight: '500' }}>{order.amount}</td>
                <td className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </td>
                <td>
                  <button className="btn btn-outline">View</button>
                  {order.status === 'pending' && (
                    <button className="btn btn-primary">Accept</button>
                  )}
                  {order.status === 'in-progress' && (
                    <button className="btn btn-outline">Chat</button>
                  )}
                  {order.status === 'completed' && (
                    <button className="btn btn-outline">Chat</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;