import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['loginContainer']}>
      <div className={styles['loginCard']}>
        <div className={styles['header']}>
          <h1 className={styles['title']}>Welcome back</h1>
          <p className={styles['subtitle']}>Please enter your credentials to sign in</p>
        </div>

        {error && <div className={styles['error']}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles['form']}>
          <div className={styles['formGroup']}>
            <label htmlFor="email" className={styles['label']}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles['input']}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles['formGroup']}>
            <label htmlFor="password" className={styles['label']}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles['input']}
              placeholder="Enter your password"
            />
          </div>

          <div className={styles['flexRow']}>
            <div className={styles['rememberMe']}>
              <input
                type="checkbox"
                id="remember-me"
                className={styles['checkbox']}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <a href="#" className={styles['link']}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles['button']}
          >
            {isLoading ? (
              <>
                <span className={styles['loading']}></span>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className={styles['signupText']}>
          Don't have an account?{' '}
          <a href="#" className={styles['link']}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;