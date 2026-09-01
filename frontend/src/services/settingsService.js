const DEFAULT_SETTINGS = {
  darkMode: false,
  startupPage: 'Dashboard',
  notifications: true,
  exportFormat: 'PDF'
};

export const getStoredSettings = () => {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error parsing settings', e);
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveStoredSettings = (settings) => {
  localStorage.setItem('appSettings', JSON.stringify(settings));
  // Apply dark mode immediately to body
  if (settings.darkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  // Dispatch a custom event to notify other components
  window.dispatchEvent(new Event('settingsUpdated'));
};

export const initSettings = () => {
  const settings = getStoredSettings();
  if (settings.darkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
};
