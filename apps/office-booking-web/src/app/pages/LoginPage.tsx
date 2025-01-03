import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // If remember me is checked, save email in localStorage
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-title">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        <div className="remember-forgot">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <Link to="/forgot-password" className="forgot-password">
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="signup-link">
          Don't have an account?
          <Link to="/signup">Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;