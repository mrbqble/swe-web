import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await dataService.getOrders(
        1,
        20,
        statusFilter || undefined,
      );
      setOrders(response.items);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Fallback to mock data if API fails
      setOrders(getMockOrders());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockOrders = (): Order[] => [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      date: 'Dec 25, 2024',
      amount: '₸62,500',
      status: 'pending',
      items: 1,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      date: 'Dec 24, 2024',
      amount: '₸26,250',
      status: 'in_progress',
      items: 1,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: 'Bakyt Serikbayev',
      organization: 'Kazakhstan Metal Works',
      date: 'Dec 23, 2024',
      amount: '₸45,000',
      status: 'completed',
      items: 1,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customer: 'Olga Petrova',
      organization: 'Shymkent Industrial Group',
      date: 'Dec 22, 2024',
      amount: '₸9,600',
      status: 'rejected',
      items: 1,
    },
  ];

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await dataService.updateOrderStatus(parseInt(orderId), newStatus);
      loadOrders(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-in-progress';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      completed: 'Completed',
      rejected: 'Rejected',
    };
    return (
      statusMap[status] ||
      status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.organization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div>
        <div className="header">
          <h1>Orders</h1>
          <p>Manage customer orders and track fulfillment status.</p>
        </div>
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Orders</h1>
        <p>Manage customer orders and track fulfillment status.</p>
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
            <h2>Orders ({filteredOrders.length})</h2>
            <div className="filters">
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Search orders..."
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
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{order.orderNumber}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {order.items} item
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '500' }}>{order.customer}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {order.organization}
                  </div>
                </td>
                <td>{order.date}</td>
                <td style={{ fontWeight: '500' }}>{order.amount}</td>
                <td className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </td>
                <td>
                  <button className="btn btn-outline">View</button>
                  {order.status === 'pending' &&
                    user?.role === 'supplier_owner' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(order.id, 'accepted')}
                      >
                        Accept
                      </button>
                    )}
                  {order.status === 'accepted' &&
                    user?.role === 'supplier_owner' && (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleStatusUpdate(order.id, 'in_progress')
                        }
                      >
                        Start Processing
                      </button>
                    )}
                  {order.status === 'in_progress' &&
                    user?.role === 'supplier_owner' && (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleStatusUpdate(order.id, 'completed')
                        }
                      >
                        Complete
                      </button>
                    )}
                  {(order.status === 'in_progress' ||
                    order.status === 'completed') && (
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
