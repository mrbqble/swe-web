import React from 'react';
import { Activity } from '../types';

const Dashboard: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      initials: 'AK',
      content: 'New order #ORD-2024-001 - Order for 50 units of Industrial Bearing Set by Aida Kozhanova',
      time: 'about 2 hours ago'
    }
  ];

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>Pending Link Requests</div>
          <div className="stat-number">3</div>
          <div className="stat-change positive">+20% from last month</div>
        </div>
        <div className="stat-card">
          <div>Open Orders</div>
          <div className="stat-number">12</div>
          <div className="stat-change positive">+8% from last month</div>
        </div>
        <div className="stat-card">
          <div>Open Complaints</div>
          <div className="stat-number">2</div>
          <div className="stat-change negative">-15% from last month</div>
        </div>
        <div className="stat-card">
          <div>Revenue</div>
          <div className="stat-number">₸1,250,000</div>
          <div className="stat-change positive">+25% from last month</div>
        </div>
      </div>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e5e5' }} />

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-avatar">{activity.initials}</div>
            <div className="activity-content">
              <div>{activity.content}</div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;