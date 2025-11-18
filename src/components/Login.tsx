import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const demoAccounts = [
    { email: 'owner@kazsupply.kz', password: 'anypassword', role: 'Owner' },
    { email: 'manager@kazsupply.kz', password: 'anypassword', role: 'Manager' },
    { email: 'sales@kazsupply.kz', password: 'anypassword', role: 'Sales' },
  ];

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SupplyKZ</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="demo-accounts">
          <h3>Demo Accounts:</h3>
          {demoAccounts.map((account, index) => (
            <div key={index} className="demo-account">
              <span>
                <strong>{account.role}:</strong> {account.email}
              </span>
              <button
                type="button"
                onClick={() => fillDemo(account.email, account.password)}
                className="demo-fill-button"
                disabled={isLoading}
              >
                Fill
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
