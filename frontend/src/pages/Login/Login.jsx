import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { loginUser } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('admin@manivthatours.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    alert("Google account selection will open here after Google OAuth is configured.");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let valid = true;

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    // Check password length
    if (password.length < 1) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    if (!valid) {
      return;
    }

    setSuccess(true);
    loginUser('session-active-token');

    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        
        {/* BRAND HEADER */}
        <div className={styles.brand}>
          <div className={styles.logo}>🚀</div>
          <h1>Manivtha Tours</h1>
          <p>
            Sign in to access your business health<br />
            dashboard
          </p>
        </div>

        {/* GOOGLE LOGIN */}
        <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
          <span className={styles.googleIcon}>G</span>
          <span>Sign in with Google</span>
        </button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        {/* NORMAL LOGIN FORM */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
              }}
              placeholder="Enter your email"
              autoComplete="email"
              className={emailError ? styles.error : ''}
            />
            {emailError && (
              <div className={`${styles.errorMessage} ${styles.show}`}>
                Please enter a valid email address.
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(false);
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={passwordError ? styles.error : ''}
            />
            {passwordError && (
              <div className={`${styles.errorMessage} ${styles.show}`}>
                Please enter your password.
              </div>
            )}
          </div>

          <div className={styles.options}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <span 
              className={styles.forgot} 
              onClick={() => alert("Please contact system admin to reset password.")}
            >
              Forgot password?
            </span>
          </div>

          <button type="submit" className={styles.signinBtn}>
            Sign In
          </button>
        </form>

        {success && (
          <div className={styles.successMessage}>
            Login successful!
          </div>
        )}

        <div className={styles.bottom}>
          Don't have an account?{' '}
          <span onClick={() => alert("Please contact admin@manivthatours.com to request access.")}>
            Contact Admin
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
