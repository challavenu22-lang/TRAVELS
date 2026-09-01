import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Button from '../../components/Button/Button';
import styles from './Settings.module.css';
import { getStoredSettings, saveStoredSettings } from '../../services/settingsService';
import { getUser, logoutUser } from '../../services/authService';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(() => getUser() || {});
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [messageText, setMessageText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser() || {};
    setCurrentUser(user);
    setFullName(user.full_name || user.name || '');
    setUsername(user.username ? `@${user.username}` : '');
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

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    saveStoredSettings(settings);
    setTimeout(() => {
      setIsSaving(false);
      setMessageText('Preferences saved successfully.');
    }, 300);
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
            {/* Full Name - Disabled / Read Only with 🚫 cursor */}
            <div className={styles.formGroup}>
              <label htmlFor="fullNameInput">Full Name</label>
              <input 
                id="fullNameInput"
                type="text" 
                value={fullName} 
                readOnly
                disabled
                className={styles.readOnlyInput}
                title="Full Name cannot be edited"
              />
            </div>

            {/* Username - Disabled / Read Only with 🚫 cursor */}
            <div className={styles.formGroup}>
              <label htmlFor="usernameInput">Username</label>
              <input 
                id="usernameInput"
                type="text" 
                value={username} 
                readOnly
                disabled
                className={styles.readOnlyInput}
                title="Username cannot be edited"
              />
            </div>
            
            {/* Email Address - Disabled / Read Only with 🚫 cursor */}
            <div className={styles.formGroup}>
              <label htmlFor="emailInput">Email Address</label>
              <input 
                id="emailInput"
                type="email" 
                value={email} 
                readOnly
                disabled
                className={styles.readOnlyInput}
                title="Email Address cannot be edited"
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
