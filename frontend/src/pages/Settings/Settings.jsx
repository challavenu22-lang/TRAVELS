import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Button from '../../components/Button/Button';
import styles from './Settings.module.css';
import { getStoredSettings, saveStoredSettings } from '../../services/settingsService';
import { getUser, updateStoredUser, logoutUser, getAuthToken } from '../../services/authService';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(() => getUser() || {});
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [messageText, setMessageText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser() || {};
    setCurrentUser(user);
    setFullName(user.full_name || user.name || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
  }, []);

  const handleChangePreference = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => {
      const updated = { ...prev, [name]: checked };
      saveStoredSettings(updated);
      if (name === 'darkMode') {
        if (checked) document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessageText('');
    setErrorText('');

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().replace(/^@/, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorText('Full name must be at least 2 characters.');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorText('Username must be 3-30 characters long and contain only letters, numbers, underscores, and periods.');
      return;
    }

    if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);

    let updatedUser = null;
    let serverError = '';

    const token = getAuthToken();
    if (token) {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: cleanName,
            username: cleanUsername,
            email: cleanEmail
          })
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          updatedUser = data.user;
        } else if (!response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          serverError = data.error || 'Failed to update profile.';
        }
      } catch (err) {
        console.warn('Backend API offline or static deployment, updating local storage.');
      }
    }

    if (serverError) {
      setErrorText(serverError);
      setIsSaving(false);
      return;
    }

    if (!updatedUser) {
      // Local storage profile update fallback
      const existingUsers = JSON.parse(localStorage.getItem('app_registered_users') || '[]');
      
      const dupUser = existingUsers.find(u => 
        u.username.toLowerCase() === cleanUsername.toLowerCase() && u.id !== currentUser.id
      );
      if (dupUser) {
        setErrorText('Username is already taken.');
        setIsSaving(false);
        return;
      }

      const dupEmail = existingUsers.find(u => 
        u.email.toLowerCase() === cleanEmail.toLowerCase() && u.id !== currentUser.id
      );
      if (dupEmail) {
        setErrorText('Email is already registered.');
        setIsSaving(false);
        return;
      }

      updatedUser = {
        ...currentUser,
        full_name: cleanName,
        username: cleanUsername,
        email: cleanEmail
      };
    }

    // Update stored user profile & trigger authChanged event
    updateStoredUser(updatedUser);
    setCurrentUser(updatedUser);

    saveStoredSettings(settings);
    setIsSaving(false);
    setMessageText('Profile updated successfully.');
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <motion.div 
      className={styles.settingsPage}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      <div className={styles.grid}>
        <div className={`card ${styles.settingsCard}`}>
          <h2>Profile Settings</h2>
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formGroup}>
              <label htmlFor="fullNameInput">Full Name</label>
              <input 
                id="fullNameInput"
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="usernameInput">Username</label>
              <input 
                id="usernameInput"
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Choose a username (e.g. venu123)"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="emailInput">Email Address</label>
              <input 
                id="emailInput"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address"
              />
            </div>
          </form>
        </div>

        <div className={`card ${styles.settingsCard}`}>
          <h2>Preferences</h2>
          <form className={styles.form}>
            <div className={styles.formGroupRow}>
              <div className={styles.labelGroup}>
                <label>Dark Mode</label>
                <span className={styles.hint}>Toggle dark appearance</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  name="darkMode"
                  checked={settings.darkMode} 
                  onChange={handleChangePreference}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formGroupRow}>
              <div className={styles.labelGroup}>
                <label>Email Notifications</label>
                <span className={styles.hint}>Receive weekly summary reports</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  name="notifications"
                  checked={settings.notifications} 
                  onChange={handleChangePreference}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </form>
        </div>
      </div>

      {errorText && (
        <div className={styles.errorBox}>
          {errorText}
        </div>
      )}

      {messageText && (
        <div className={styles.successBox}>
          {messageText}
        </div>
      )}

      <div className={styles.actionsRow}>
        <button 
          type="button" 
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>

        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
};

export default Settings;
