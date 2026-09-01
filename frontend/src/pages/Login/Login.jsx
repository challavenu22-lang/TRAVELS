import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Rocket, Mail } from 'lucide-react';
import { loginUser } from '../../services/authService';
import styles from './Login.module.css';

const Login = () => {
  // Fields MUST start empty
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginErrorText, setLoginErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatusText, setForgotStatusText] = useState('');
  const [forgotErrorText, setForgotErrorText] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const navigate = useNavigate();

  function showLoginError(message) {
    setLoginErrorText(message);
  }

  function hideError() {
    setLoginErrorText('');
  }

  // ===============================
  // REAL LOGIN (Email or Username + Password)
  // ===============================
  const loginWithCredentials = async () => {
    hideError();

    const identVal = identifier.trim();
    const passwordVal = password;

    if (!identVal) {
      showLoginError("Please enter your email or username.");
      return;
    }

    if (!passwordVal) {
      showLoginError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identVal, password: passwordVal })
      });

      const data = await response.json();

      if (!response.ok) {
        showLoginError("Invalid username/email or password.");
        setIsLoading(false);
        return;
      }

      // Successful backend login
      loginUser(data.token, data.user, rememberMe);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login request error:", error);
      showLoginError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loginWithCredentials();
  };

  // ===============================
  // FORGOT PASSWORD HANDLER
  // ===============================
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setForgotStatusText('');
    setForgotErrorText('');

    if (!forgotEmail.trim()) {
      setForgotErrorText('Please enter your email address.');
      return;
    }

    setIsSendingForgot(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStatusText(data.message || 'Password reset link sent successfully.');
      } else {
        setForgotErrorText(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      setForgotErrorText('Something went wrong. Please try again.');
    } finally {
      setIsSendingForgot(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        
        {/* BRAND HEADER */}
        <div className={styles.brand}>
          <div className={styles.brandLogoRow}>
            <div className={styles.logo}>
              <Rocket size={24} color="#fff" />
            </div>
            <h1>Manivtha Tours</h1>
          </div>
          <p>
            Sign in to access your business health<br />
            dashboard
          </p>
        </div>

        {/* LOGIN FORM */}
        <form id="loginForm" onSubmit={handleSubmit} noValidate>
          
          {/* Email or Username */}
          <div className={styles.formGroup}>
            <label htmlFor="identifier">Email or Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIconLeft} size={18} />
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  hideError();
                }}
                placeholder="Enter your email or username"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIconLeft} size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  hideError();
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.options}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <span 
              className={styles.forgot} 
              onClick={() => {
                setForgotEmail(identifier.includes('@') ? identifier : '');
                setForgotStatusText('');
                setForgotErrorText('');
                setShowForgotModal(true);
              }}
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            className={styles.signinBtn}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "SIGN IN"}
          </button>
        </form>

        <div 
          id="loginError" 
          className={styles.loginErrorBox} 
          style={{ display: loginErrorText ? 'block' : 'none' }}
        >
          {loginErrorText}
        </div>

        <div className={styles.bottom}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')}>
            Create Account
          </span>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2>Forgot Password</h2>
            <p>Enter your account email address below to receive a password reset link.</p>
            
            <form onSubmit={handleSendResetLink}>
              <div className={styles.formGroup}>
                <label htmlFor="forgotEmailInput">Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIconLeft} size={18} />
                  <input
                    id="forgotEmailInput"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>

              {forgotErrorText && (
                <div className={styles.loginErrorBox}>
                  {forgotErrorText}
                </div>
              )}

              {forgotStatusText && (
                <div className={styles.successBox}>
                  {forgotStatusText}
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={styles.signinBtn}
                  disabled={isSendingForgot}
                  style={{ flex: 1 }}
                >
                  {isSendingForgot ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
