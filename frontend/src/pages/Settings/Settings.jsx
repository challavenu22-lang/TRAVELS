import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button/Button';
import styles from './Settings.module.css';
import { getStoredSettings, saveStoredSettings } from '../../services/settingsService';
import { getUser } from '../../services/authService';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      if (type === 'checkbox') {
        saveStoredSettings(updated);
      }

      if (name === 'darkMode') {
        if (checked) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
      return updated;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredSettings(settings);
    alert('Settings saved successfully!');
  };

  const fullNameVal = currentUser?.full_name || currentUser?.name || settings.name || '';
  const usernameVal = currentUser?.username ? `@${currentUser.username}` : '';
  const emailVal = currentUser?.email || settings.email || '';

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
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={fullNameVal} 
                readOnly
              />
            </div>

            {usernameVal && (
              <div className={styles.formGroup}>
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={usernameVal} 
                  readOnly
                />
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={emailVal} 
                readOnly
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </motion.div>
  );
};

export default Settings;
