import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let success = false;
    if (isSignup) {
      // Validate required fields for signup
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required');
        return;
      }
      // Web app always signs up as supplier_owner
      success = await signup(
        email,
        password,
        firstName,
        lastName,
        'supplier_owner',
        companyName.trim() || undefined,
      );
    } else {
      success = await login(email, password);
    }

    if (!success) {
      // More specific error messages could be added here based on error type
      setError(
        isSignup
          ? 'Signup failed. Please check your information and try again. Make sure your password meets the requirements.'
          : 'Invalid email or password. Please try again.',
      );
    }
  };


  // Reset form when switching between login/signup
  const handleToggleSignup = () => {
    setIsSignup(!isSignup);
    setError('');
    setFirstName('');
    setLastName('');
    setCompanyName('');
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
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={1}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={1}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name (Optional)</label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
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
            onClick={handleToggleSignup}
            className="switch-button"
          >
            {isSignup
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
