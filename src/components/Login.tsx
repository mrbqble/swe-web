import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'consumer' | 'supplier_owner'>('consumer');
  const { login, signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let success = false;
    if (isSignup) {
      success = await signup(email, password, role);
    } else {
      success = await login(email, password);
    }

    if (!success) {
      setError(
        isSignup
          ? 'Signup failed. Please try again.'
          : 'Invalid email or password',
      );
    }
  };

  const demoAccounts = [
    { email: 'owner@kazsupply.kz', password: 'SecurePass123', role: 'Owner' },
    {
      email: 'manager@kazsupply.kz',
      password: 'SecurePass123',
      role: 'Manager',
    },
    { email: 'sales@kazsupply.kz', password: 'SecurePass123', role: 'Sales' },
  ];

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSignup(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SupplyKZ</h1>
          <p>{isSignup ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          {isSignup && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'consumer' | 'supplier_owner')
                }
                required
                disabled={isLoading}
              >
                <option value="consumer">Consumer</option>
                <option value="supplier_owner">Supplier Owner</option>
              </select>
            </div>
          )}

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
              minLength={8}
            />
            {isSignup && (
              <small>
                Password must be at least 8 characters with uppercase,
                lowercase, and digit
              </small>
            )}
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading
              ? isSignup
                ? 'Creating account...'
                : 'Signing in...'
              : isSignup
                ? 'Sign up'
                : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="switch-button"
          >
            {isSignup
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {!isSignup && (
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
        )}
      </div>
    </div>
  );
};

export default Login;
