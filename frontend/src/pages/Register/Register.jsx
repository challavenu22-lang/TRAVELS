import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AtSign, Mail, Lock, Eye, EyeOff, Rocket } from 'lucide-react';
import { loginUser } from '../../services/authService';
import styles from './Register.module.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // 1. Full Name Validation
    if (!cleanFullName) {
      setErrorText('Full name is required.');
      return;
    }
    if (cleanFullName.length < 2) {
      setErrorText('Full name must be at least 2 characters.');
      return;
    }

    // 2. Username Validation
    if (!cleanUsername) {
      setErrorText('Username is required.');
      return;
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorText('Username must be 3-30 characters long and contain only letters, numbers, underscores, and periods.');
      return;
    }

    // 3. Email Validation
    if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    // 4. Password Validation
    if (!password || password.length < 8) {
      setErrorText('Password must be at least 8 characters.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorText('Password must contain at least one letter and one number.');
      return;
    }

    // 5. Confirm Password Validation
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    // 6. Check duplicate username or email in stored local accounts
    const existingUsers = JSON.parse(localStorage.getItem('app_registered_users') || '[]');

    const dupUsername = existingUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (dupUsername) {
      setErrorText('Username is already taken.');
      return;
    }

    const dupEmail = existingUsers.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    if (dupEmail) {
      setErrorText('Email is already registered.');
      return;
    }

    setIsLoading(true);

    let createdUser = null;
    let createdToken = null;
    let serverError = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: cleanFullName,
          username: cleanUsername,
          email: cleanEmail,
          password: password,
          confirm_password: confirmPassword
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        createdUser = data.user;
        createdToken = data.token;
      } else if (!response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        serverError = data.error || 'Registration failed.';
      }
    } catch (err) {
      console.warn('Backend API offline or static host, using client storage fallback.');
    }

    if (serverError) {
      setErrorText(serverError);
      setIsLoading(false);
      return;
    }

    if (!createdUser || !createdToken) {
      // Save locally and authenticate immediately if server API is offline or on static Vercel host
      createdUser = {
        id: `U-${Date.now()}`,
        full_name: cleanFullName,
        username: cleanUsername.toLowerCase(),
        email: cleanEmail.toLowerCase(),
        role: 'user',
        created_at: new Date().toISOString()
      };
      createdToken = `token-${createdUser.id}-${Date.now()}`;

      existingUsers.push({
        ...createdUser,
        password: password
      });
      localStorage.setItem('app_registered_users', JSON.stringify(existingUsers));
    }

    // Authenticate user immediately and redirect DIRECTLY to /dashboard
    loginUser(createdToken, createdUser, true);
    setSuccessText('Account created successfully.');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        
        {/* BRAND HEADER */}
        <div className={styles.brand}>
          <div className={styles.brandLogoRow}>
            <div className={styles.logo}>
              <Rocket size={24} color="#fff" />
            </div>
            <h1>Manivtha Tours</h1>
          </div>
          <h2>CREATE YOUR ACCOUNT</h2>
          <p>Sign up to manage your business health dashboard</p>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleRegister} noValidate>
          
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIconLeft} size={18} />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrorText(''); }}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Username */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <div className={styles.inputWrapper}>
              <AtSign className={styles.inputIconLeft} size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrorText(''); }}
                placeholder="Choose a username (e.g. venu123)"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIconLeft} size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
                placeholder="Enter your email address"
                autoComplete="email"
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
                onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                placeholder="Minimum 8 chars, 1 letter & 1 number"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIconLeft} size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorText(''); }}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className={styles.togglePasswordBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorText && (
            <div className={styles.errorBox}>
              {errorText}
            </div>
          )}

          {successText && (
            <div className={styles.successBox}>
              {successText}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className={styles.bottom}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>
            Login
          </span>
        </div>

      </div>
    </div>
  );
};

export default Register;
