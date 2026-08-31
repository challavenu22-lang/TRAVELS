import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import styles from './Login.module.css';
import { loginUser } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('admin@manivthatours.com');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    loginUser('session-active-token');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoHeader}>
          <div className={styles.logoIcon}>
            <Rocket size={28} color="#fff" />
          </div>
          <h2>Manivtha Tours</h2>
        </div>
        <p className={styles.subtitle}>Sign in to access your business health dashboard</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@manivthatours.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
