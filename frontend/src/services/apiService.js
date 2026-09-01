import { getUser } from './authService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_TEMPLATES = [
  { id: 'T-1', name: 'Good', description: 'Template for highly rated monthly feedback.', icon: 'star', color: 'success' },
  { id: 'T-2', name: 'Average', description: 'Analyze impact and propose recruitment strategies.', icon: 'users', color: 'warning' },
  { id: 'T-3', name: 'Excellent', description: 'Breakdown of route efficiency and fuel costs.', icon: 'trending-down', color: 'danger' },
  { id: 'T-4', name: 'OK', description: 'Action plan for increasing seasonal bookings.', icon: 'alert-circle', color: 'secondary' }
];

const getUserStorageKey = () => {
  const user = getUser();
  return user?.id ? `userData_${user.id}` : 'userData_default';
};

const getUserData = () => {
  const key = getUserStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored user data', e);
    }
  }
  return {
    dashboard: {
      stats: { totalReports: 0, averageRating: 0.0, monthlyReports: 0, mostUsedTemplate: 'None' },
      recentReports: []
    },
    templates: DEFAULT_TEMPLATES,
    history: [],
    analytics: {
      monthlyReports: [
        { name: 'Jan', reports: 0 }, { name: 'Feb', reports: 0 }, { name: 'Mar', reports: 0 },
        { name: 'Apr', reports: 0 }, { name: 'May', reports: 0 }, { name: 'Jun', reports: 0 }
      ],
      averageQuality: [
        { name: 'Jan', quality: 0.0 }, { name: 'Feb', quality: 0.0 }, { name: 'Mar', quality: 0.0 },
        { name: 'Apr', quality: 0.0 }, { name: 'May', quality: 0.0 }, { name: 'Jun', quality: 0.0 }
      ],
      commonRisks: [],
      topRecommendations: []
    },
    drivers: [],
    vehicles: []
  };
};

const saveUserData = (data) => {
  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDashboardStats = async () => {
  await delay(300);
  const data = getUserData();
  
  let totalRating = 0;
  let count = 0;
  
  (data.drivers || []).forEach(d => {
    const rating = parseFloat(d.rating);
    if (!isNaN(rating)) { totalRating += rating; count++; }
  });
  
  (data.vehicles || []).forEach(v => {
    const rating = parseFloat(v.rating);
    if (!isNaN(rating)) { totalRating += rating; count++; }
  });
  
  const avgRating = count > 0 ? (totalRating / count).toFixed(1) : "0.0";

  return {
    totalReports: (data.history || []).length,
    averageRating: parseFloat(avgRating),
    monthlyReports: (data.history || []).length,
    mostUsedTemplate: (data.history || []).length > 0 ? data.history[0].title : 'None',
    totalDrivers: (data.drivers || []).length,
    totalVehicles: (data.vehicles || []).length
  };
};

export const getRecentReports = async () => {
  await delay(300);
  const data = getUserData();
  return (data.history || []).slice(0, 5).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    status: item.status,
    rating: 4.5
  }));
};

export const getHistory = async () => {
  await delay(300);
  const data = getUserData();
  return data.history || [];
};

export const getTemplates = async () => {
  await delay(200);
  const data = getUserData();
  return data.templates || DEFAULT_TEMPLATES;
};

export const getAnalytics = async () => {
  await delay(300);
  const data = getUserData();
  const reportsCount = (data.history || []).length;
  return {
    monthlyReports: [
      { name: 'Jan', reports: Math.min(reportsCount, 2) },
      { name: 'Feb', reports: Math.min(reportsCount, 4) },
      { name: 'Mar', reports: Math.min(reportsCount, 6) },
      { name: 'Apr', reports: Math.min(reportsCount, 8) },
      { name: 'May', reports: Math.min(reportsCount, 10) },
      { name: 'Jun', reports: reportsCount }
    ],
    averageQuality: [
      { name: 'Jan', quality: 4.2 },
      { name: 'Feb', quality: 4.5 },
      { name: 'Mar', quality: 4.8 },
      { name: 'Apr', quality: 4.1 },
      { name: 'May', quality: 4.6 },
      { name: 'Jun', quality: 4.9 }
    ],
    commonRisks: [
      { name: 'Fuel', value: 400 },
      { name: 'Drivers', value: 300 },
      { name: 'Maintenance', value: 200 }
    ],
    topRecommendations: [
      'Implement Eco-driving training program',
      'Optimize vehicle maintenance schedules'
    ]
  };
};

export const generateSummary = async (payload) => {
  await delay(1000);
  const data = getUserData();
  const user = getUser();
  const userId = user?.id || 'guest';
  
  const dateStr = new Date().toISOString().split('T')[0];
  const title = payload.title || 'Custom Generated Summary';
  
  const wins = payload.wins ? payload.wins : 'maintained steady operations';
  const risks = payload.risks ? payload.risks : 'standard operational overhead';
  const actions = payload.actions ? payload.actions : 'continue monitoring metrics';

  const previewText = `For the period ending ${dateStr}, operations focused on "${title}". Key wins: ${wins}. Risks: ${risks}. Action items: ${actions}.`;
  
  let determinedStatus = 'OK';
  const upperTitle = title.toUpperCase();
  if (upperTitle.includes('GOOD')) determinedStatus = 'GOOD';
  else if (upperTitle.includes('EXCELLENT')) determinedStatus = 'EXCELLENT';
  else if (upperTitle.includes('AVERAGE')) determinedStatus = 'AVERAGE';
  else if (upperTitle.includes('OK')) determinedStatus = 'OK';

  const newReport = {
    id: `H-${Math.floor(Math.random() * 10000)}`,
    userId: userId,
    title: title,
    date: dateStr,
    status: determinedStatus,
    preview: previewText
  };

  data.history.unshift(newReport);
  saveUserData(data);

  return {
    executiveSummary: previewText,
    keyInsights: [
      `Performance overview: Successfully ${wins.substring(0, 50)}...`,
      `Identified bottleneck: ${risks.substring(0, 60)}...`
    ],
    recommendations: [
      `Action item: ${actions.substring(0, 50)}...`
    ],
    qualityScore: '4.8',
    status: determinedStatus
  };
};

export const deleteReport = async (id) => {
  await delay(200);
  const data = getUserData();
  data.history = data.history.filter(item => item.id !== id);
  saveUserData(data);
  return true;
};

// Driver CRUD (User-Scoped)
export const getDrivers = async () => {
  await delay(200);
  const data = getUserData();
  return data.drivers || [];
};

export const addDriver = async (driver) => {
  await delay(200);
  const data = getUserData();
  const user = getUser();
  const newDriver = {
    id: `D-${Math.floor(Math.random() * 10000)}`,
    userId: user?.id || 'guest',
    name: driver.name,
    age: parseInt(driver.age, 10) || 0,
    rating: parseFloat(driver.rating) || 5.0
  };
  data.drivers.push(newDriver);
  saveUserData(data);
  return newDriver;
};

export const updateDriver = async (id, updatedData) => {
  await delay(200);
  const data = getUserData();
  const index = data.drivers.findIndex(d => d.id === id);
  if (index > -1) {
    data.drivers[index] = {
      ...data.drivers[index],
      name: updatedData.name,
      age: parseInt(updatedData.age, 10) || 0,
      rating: parseFloat(updatedData.rating) || 5.0
    };
    saveUserData(data);
    return data.drivers[index];
  }
  throw new Error("Driver not found");
};

export const deleteDriver = async (id) => {
  await delay(200);
  const data = getUserData();
  data.drivers = data.drivers.filter(d => d.id !== id);
  saveUserData(data);
  return true;
};

// Vehicle CRUD (User-Scoped)
export const getVehicles = async () => {
  await delay(200);
  const data = getUserData();
  return data.vehicles || [];
};

export const addVehicle = async (vehicle) => {
  await delay(200);
  const data = getUserData();
  const user = getUser();
  const newVehicle = {
    id: `V-${Math.floor(Math.random() * 10000)}`,
    userId: user?.id || 'guest',
    name: vehicle.name,
    registration: vehicle.registration,
    rating: parseFloat(vehicle.rating) || 5.0
  };
  data.vehicles.push(newVehicle);
  saveUserData(data);
  return newVehicle;
};

export const updateVehicle = async (id, updatedData) => {
  await delay(200);
  const data = getUserData();
  const index = data.vehicles.findIndex(v => v.id === id);
  if (index > -1) {
    data.vehicles[index] = {
      ...data.vehicles[index],
      name: updatedData.name,
      registration: updatedData.registration,
      rating: parseFloat(updatedData.rating) || 5.0
    };
    saveUserData(data);
    return data.vehicles[index];
  }
  throw new Error("Vehicle not found");
};

export const deleteVehicle = async (id) => {
  await delay(200);
  const data = getUserData();
  data.vehicles = data.vehicles.filter(v => v.id !== id);
  saveUserData(data);
  return true;
};
