import React from 'react';

const Chat: React.FC = () => {
  return (
    <div>
      <div className="header">
        <h1>SupplyKZ</h1>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div
          className="sidebar"
          style={{
            width: '300px',
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            style={{ width: '100%', marginBottom: '20px' }}
          />
        </div>

        <div
          className="chat-placeholder"
          style={{ flex: 1, background: 'white', borderRadius: '8px' }}
        >
          <h3>Chat page coming soon...</h3>
        </div>
      </div>
    </div>
  );
};

export default Chat;
