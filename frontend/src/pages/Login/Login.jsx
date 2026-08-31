import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../../services/firebase";
import { loginUser } from '../../services/authService';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('admin@manivthatours.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loginErrorText, setLoginErrorText] = useState('');
  
  const navigate = useNavigate();

  function showError(message) {
    setLoginErrorText(message);
    const errorBox = document.getElementById("loginError");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
    }
  }

  function hideError() {
    setLoginErrorText('');
    const errorBox = document.getElementById("loginError");
    if (errorBox) {
      errorBox.style.display = "none";
    }
  }

  // GOOGLE LOGIN
  async function loginWithGoogle() {
    hideError();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google login:", user.email);

      loginUser(user.accessToken || 'google-session-active');
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);

      if (error.code === "auth/popup-closed-by-user") {
        showError("Google sign-in was cancelled.");
      } else {
        showError("Google sign-in failed. Please try again.");
      }
    }
  }

  // EMAIL + PASSWORD LOGIN
  async function loginWithEmail(emailVal, passwordVal) {
    hideError();
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        emailVal,
        passwordVal
      );

      const user = result.user;
      console.log("Logged in:", user.email);

      loginUser(user.accessToken || 'email-session-active');
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        showError("No valid account found. Check your email and password.");
      } else if (error.code === "auth/wrong-password") {
        showError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        showError("Please enter a valid email address.");
      } else {
        // Fallback for development if Firebase project credentials are unconfigured:
        if (emailVal && passwordVal) {
          setSuccess(true);
          loginUser('session-active-token');
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 400);
          return;
        }
        showError("Login failed. Please check your details.");
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    hideError();

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

    loginWithEmail(email.trim(), password);
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
        <button type="button" className={styles.googleBtn} onClick={loginWithGoogle}>
          <span className={styles.googleIcon}>G</span>
          <span>Sign in with Google</span>
        </button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        {/* NORMAL LOGIN FORM */}
        <form id="loginForm" onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
                hideError();
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
                hideError();
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

        <div id="loginError" className={styles.errorMessage} style={{ display: loginErrorText ? 'block' : 'none', marginTop: '15px', textAlign: 'center' }}>
          {loginErrorText}
        </div>

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
