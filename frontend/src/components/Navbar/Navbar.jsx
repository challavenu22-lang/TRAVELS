import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { getUser, logoutUser } from '../../services/authService';

const Navbar = ({ toggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getUser());
    };
    window.addEventListener('authChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const displayName = currentUser?.full_name || currentUser?.name || 'User Account';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>
      
      <div className={styles.right}>
        <div className={styles.profileDropdown} onClick={() => navigate('/settings')}>
          <div className={styles.avatar}>{firstLetter}</div>
          <span className={styles.name}>{displayName}</span>
          <ChevronDown size={16} className={styles.chevron} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
