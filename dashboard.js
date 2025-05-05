// Check authentication first
function checkAuth() {
  const currentUser = localStorage.getItem('etee_current_user');
  
  if (!currentUser) {
    window.location.href = 'signin.html';
    return null;
  }
  
  try {
    const user = JSON.parse(currentUser);
    if (!user.email || !user.userID) {
      localStorage.removeItem('etee_current_user');
      window.location.href = 'signin.html';
      return null;
    }
    return user;
  } catch (e) {
    localStorage.removeItem('etee_current_user');
    window.location.href = 'signin.html';
    return null;
  }
}

// Get user-specific storage key
function getUserStorageKey(baseKey) {
  return `${baseKey}_${window.currentUser.userID}`;
}

// Get user-specific data
function getUserData(baseKey) {
  const storageKey = getUserStorageKey(baseKey);
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
}

// Set user-specific data
function setUserData(baseKey, data) {
  const storageKey = getUserStorageKey(baseKey);
  localStorage.setItem(storageKey, JSON.stringify(data));
}

document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const currentUser = checkAuth();
  if (!currentUser) return; // Will redirect to signin if not authenticated
  
  window.currentUser = currentUser;
  
  // Initialize sidebar component with current user data
  const sidebar = new Sidebar({
    containerId: 'sidebar',
    companyName: 'ETee',
    navItems: [
      {
        text: 'Dashboard',
        icon: 'bx bxs-dashboard',
        href: '#dashboard',
        active: true
      },
      {
        text: 'Sign out',
        icon: 'bx bxs-log-out',
        href: '#sign-out',
        class: 'sign-out'
      }
    ],
    profile: {
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email,
      image: "admin.png"
    },
    onProfileEdit: function() {
      openProfileModal();
    },
    onNavItemClick: function(e, item) {
      if (item.href === '#sign-out') {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          localStorage.removeItem('etee_current_user');
          window.location.href = 'signin.html';
        }
      }
    }
  });

  // Initialize storage with user-specific keys
  if (!getUserData('etee_coops').length) {
    setUserData('etee_coops', []);
  }
  if (!getUserData('etee_measurements').length) {
    setUserData('etee_measurements', []);
  }
  if (!getUserData('etee_manure_logs').length) {
    setUserData('etee_manure_logs', []);
  }
  if (!getUserData('etee_sensor_devices').length) {
    setUserData('etee_sensor_devices', []);
  }

  ensureSensorsForAllCoops();

  // Global variable to store the currently selected coop
  let currentCoopId = null;

  // Check if there are existing coops
  const coops = getUserData('etee_coops');
  if (coops.length === 0) {
    showChickenCoopManagement();
  } else {
    showWaterQualityManagement(coops[0].id);
  }
  
  updateCoopManagementTitle();


  // Update all localStorage calls to use user-specific data
  function showChickenCoopManagement() {
    const dashboardSection = document.getElementById('dashboard');
    const coopSection = document.getElementById('chickenCoopManagement');
    const waterSection = document.getElementById('waterQualityManagement');
    
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (waterSection) waterSection.style.display = 'none';
    if (coopSection) coopSection.style.display = 'block';
    
    loadCoops();
    updateCoopManagementTitle();

  }

  function showWaterQualityManagement(coopId = null) {
    const dashboardSection = document.getElementById('dashboard');
    const coopSection = document.getElementById('chickenCoopManagement');
    const waterSection = document.getElementById('waterQualityManagement');
    
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (coopSection) coopSection.style.display = 'none';
    if (waterSection) waterSection.style.display = 'block';
    
    if (coopId) {
      currentCoopId = coopId;
      const coops = getUserData('etee_coops');
      const selectedCoop = coops.find(coop => coop.id === coopId);
      
      if (selectedCoop) {
        const coopLocationTitle = document.getElementById('coopLocationTitle');
        if (coopLocationTitle) {
          coopLocationTitle.textContent = `${selectedCoop.location} Chicken Coop`;
        }
      }
    }
    
    loadDashboardData();
    loadManureData();
    loadSensorData();
  }

  function loadSensorData() {
    const sensorDevices = getUserData('etee_sensor_devices');
    const coopSensors = sensorDevices.filter(sensor => sensor.coopId === currentCoopId);
    
    const sensorDevicesList = document.getElementById('sensorDevicesList');
    const sensorEmptyState = document.getElementById('sensorEmptyState');
    
    if (coopSensors.length === 0) {
      sensorDevicesList.style.display = 'none';
      sensorEmptyState.style.display = 'block';
    } else {
      sensorDevicesList.style.display = 'grid';
      sensorEmptyState.style.display = 'none';
      
      sensorDevicesList.innerHTML = '';
      
      coopSensors.forEach(sensor => {
        const sensorItem = createSensorItem(sensor);
        sensorDevicesList.appendChild(sensorItem);
      });
    }
  }

  function createSensorItem(sensor) {
    const item = document.createElement('div');
    item.className = 'sensor-item';
    item.style.cssText = `
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    `;
    
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });
    
    const statusColor = sensor.status.toLowerCase() === 'active' ? '#22c55e' : '#ef4444';
    
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor};"></div>
        <div>
          <div style="font-weight: 600; color: var(--text-color);">${sensor.deviceType}</div>
          <div style="font-size: 0.875rem; color: var(--text-light);">#${sensor.modelNumber}</div>
        </div>
      </div>
    `;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      showSensorDetailModal(sensor);
    });
    
    return item;
  }

  function loadCoops() {
    const coops = getUserData('etee_coops');
    const emptyState = document.getElementById('coopEmptyState');
    const coopsGrid = document.getElementById('coopsGrid');
    
    if (coops.length === 0) {
      emptyState.style.display = 'block';
      coopsGrid.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      coopsGrid.style.display = 'grid';
      coopsGrid.innerHTML = '';
      
      coops.forEach(coop => {
        const coopCard = createCoopCard(coop);
        coopsGrid.appendChild(coopCard);
      });
    }
    updateCoopManagementTitle();

  }

  function updateCoopManagementTitle() {
    const coops = getUserData('etee_coops');
    const titleElement = document.getElementById('coopManagementTitle');
    
    if (titleElement && window.currentUser) {
      const firstName = window.currentUser.firstName || window.currentUser.name.split(' ')[0];
      
      if (coops.length === 0 || coops.length === 1) {
        titleElement.textContent = `${firstName}'s Chicken Coop`;
      } else {
        titleElement.textContent = `${firstName}'s Chicken Coops`;
      }
    }
  }

  function createCoopCard(coop) {
    const card = document.createElement('div');
    card.className = 'coop-card';
    card.dataset.coopId = coop.id;
    
    card.innerHTML = `
      <div class="coop-header">
        <div class="coop-title">
          <i class='bx bxs-building-house'></i>
          ${coop.location}
        </div>
        <div class="coop-actions">
          <button class="coop-action-btn edit-btn" title="Edit">
            <i class='bx bx-edit'></i>
          </button>
          <button class="coop-action-btn delete-btn" title="Delete">
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </div>
      <div class="coop-info">
        <div class="info-row">
          <i class='bx bx-ruler'></i>
          <span>Size: ${coop.size} sq ft</span>
        </div>
        <div class="info-row">
          <i class='bx bxs-group'></i>
          <span>Capacity: ${coop.capacity} birds</span>
        </div>
        <div class="info-row">
          <i class='bx bx-calendar'></i>
          <span>Added: ${new Date(coop.dateAdded).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="coop-status">
        <span class="status-badge status-active">
          <i class='bx bx-check-circle'></i> Active
        </span>
      </div>
      <button class="coop-action-button view-dashboard-btn">
        <i class='bx bxs-dashboard'></i> View Coop
      </button>
    `;
    
    const viewDashboardBtn = card.querySelector('.view-dashboard-btn');
    viewDashboardBtn.addEventListener('click', () => {
      showWaterQualityManagement(coop.id);
    });
    
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this chicken coop?')) {
        deleteCoop(coop.id);
      }
    });
    
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
      openEditCoopModal(coop.id);
    });
    
    return card;
  }

  function createPredefinedSensors(coopId) {
    const sensorDevices = getUserData('etee_sensor_devices');
    
    const predefinedSensors = [
      {
        deviceId: `TEMP-${coopId}-001`,
        coopId: coopId,
        deviceType: 'Temperature Sensor',
        modelNumber: 'DHT22-PRO',
        installationDate: new Date().toISOString(),
        status: 'Active'
      },
      {
        deviceId: `HUMID-${coopId}-001`,
        coopId: coopId,
        deviceType: 'Humidity Sensor',
        modelNumber: 'DHT22-PRO',
        installationDate: new Date().toISOString(),
        status: 'Active'
      },
      {
        deviceId: `CO2-${coopId}-001`,
        coopId: coopId,
        deviceType: 'CO2 Sensor',
        modelNumber: 'MH-Z19B',
        installationDate: new Date().toISOString(),
        status: 'Active'
      },
      {
        deviceId: `AMM-${coopId}-001`,
        coopId: coopId,
        deviceType: 'Ammonia Sensor',
        modelNumber: 'MQ-137',
        installationDate: new Date().toISOString(),
        status: 'Active'
      }
    ];
    
    predefinedSensors.forEach(sensor => {
      sensorDevices.push(sensor);
    });
    
    setUserData('etee_sensor_devices', sensorDevices);
  }

  function ensureSensorsForAllCoops() {
    const coops = getUserData('etee_coops');
    const sensorDevices = getUserData('etee_sensor_devices');
    
    coops.forEach(coop => {
      const coopSensors = sensorDevices.filter(sensor => sensor.coopId === coop.id);
      
      if (coopSensors.length === 0) {
        createPredefinedSensors(coop.id);
      }
    });
  }

  function deleteCoop(coopId) {
    let coops = getUserData('etee_coops');
    coops = coops.filter(c => c.id !== coopId);
    setUserData('etee_coops', coops);
    loadCoops();
    updateCoopManagementTitle();
    showNotification('Chicken coop deleted successfully!', 'success');
    
    if (coops.length === 0) {
      showChickenCoopManagement();
    }
  }

  const addCoopBtn = document.getElementById('addCoopBtn');
  const emptyStateBtn = document.querySelector('.empty-state-btn');
  
  if (addCoopBtn) {
    addCoopBtn.addEventListener('click', () => {
      openAddCoopModal();
    });
  }
  
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener('click', () => {
      openAddCoopModal();
    });
  }

  function openAddCoopModal() {
    const addCoopModal = document.getElementById('addCoopModal');
    addCoopModal.classList.add('active');
  }

  function openEditCoopModal(coopId) {
    const coops = getUserData('etee_coops');
    const coop = coops.find(c => c.id === coopId);
    
    if (coop) {
      document.getElementById('editCoopId').value = coop.id;
      document.getElementById('editCoopLocation').value = coop.location;
      document.getElementById('editCoopSize').value = coop.size;
      document.getElementById('editCoopCapacity').value = coop.capacity;
      
      const editCoopModal = document.getElementById('editCoopModal');
      editCoopModal.classList.add('active');
    }
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    const form = modal.querySelector('form');
    if (form) {
      setTimeout(() => {
        form.reset();
        if (modal.id === 'dataEntryModal') {
          const now = new Date();
          const jsonDateTime = JSON.stringify(now).replace(/['"]/g, '');
          const currentDateTimeField = document.getElementById('currentDateTime');
          if (currentDateTimeField) {
            currentDateTimeField.value = jsonDateTime;
          }
        }
      }, 300);
    }
  }

  const addCoopForm = document.getElementById('addCoopForm');
  if (addCoopForm) {
    addCoopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const location = document.getElementById('coopLocation').value;
      const size = parseFloat(document.getElementById('coopSize').value);
      const capacity = parseInt(document.getElementById('coopCapacity').value);
      
      const newCoop = {
        id: Date.now(),
        location,
        size,
        capacity,
        dateAdded: new Date().toISOString(),
        status: 'active'
      };
      
      const coops = getUserData('etee_coops');
      coops.push(newCoop);
      setUserData('etee_coops', coops);
      createPredefinedSensors(newCoop.id);
      
      closeModal(document.getElementById('addCoopModal'));
      loadCoops();
      updateCoopManagementTitle();
      showNotification('Chicken coop added successfully!', 'success');
      
      if (coops.length === 1) {
        setTimeout(() => {
          showWaterQualityManagement(newCoop.id);
        }, 1500);
      }
    });
  }

  const editCoopForm = document.getElementById('editCoopForm');
  if (editCoopForm) {
    editCoopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const coopId = parseInt(document.getElementById('editCoopId').value);
      const location = document.getElementById('editCoopLocation').value;
      const size = parseFloat(document.getElementById('editCoopSize').value);
      const capacity = parseInt(document.getElementById('editCoopCapacity').value);
      
      let coops = getUserData('etee_coops');
      const coopIndex = coops.findIndex(c => c.id === coopId);
      
      if (coopIndex !== -1) {
        coops[coopIndex] = {
          ...coops[coopIndex],
          location,
          size,
          capacity
        };
        
        setUserData('etee_coops', coops);
        closeModal(document.getElementById('editCoopModal'));
        loadCoops();
        updateCoopManagementTitle();

        showNotification('Chicken coop updated successfully!', 'success');
      }
    });
  }

  const backToCoopsBtn = document.getElementById('backToCoopsBtn');
  if (backToCoopsBtn) {
    backToCoopsBtn.addEventListener('click', () => {
      showChickenCoopManagement();
    });
  }

  function setZeroValues() {
    const temperatureValue = document.querySelector('.temperature-value');
    if (temperatureValue) {
      temperatureValue.textContent = '0°C';
    }
    
    const humidityValue = document.querySelector('.humidity-value');
    if (humidityValue) {
      humidityValue.textContent = '0%';
    }
    
    const co2Value = document.querySelector('.co2-value');
    if (co2Value) {
      co2Value.textContent = '0 ppm';
    }
    
    const ammoniaValue = document.querySelector('.ammonia-value');
    if (ammoniaValue) {
      ammoniaValue.textContent = '0 ppm';
    }
    
    const manureValue = document.querySelector('.manure-value');
    if (manureValue) {
      manureValue.textContent = '0 kg';
    }
  }

  function loadDashboardData() {
    const measurements = getUserData('etee_measurements');
    const coopMeasurements = measurements.filter(m => m.coopId === currentCoopId);
    
    if (coopMeasurements.length === 0) {
      setZeroValues();
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr id="emptyStateRow">
            <td colspan="5" style="text-align: center; padding: 2rem;">
              <i class='bx bx-data' style="font-size: 2rem; color: var(--text-light); display: block; margin-bottom: 0.5rem;"></i>
              <span style="color: var(--text-light);">No sensor readings available. Click "Add Data" to record measurements.</span>
            </td>
          </tr>
        `;
      }
    } else {
      coopMeasurements.sort((a, b) => b.timestamp - a.timestamp);
      updateDashboardData(coopMeasurements[0]);
      
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '';
        coopMeasurements.forEach(measurement => {
          updateActivityTable(measurement);
        });
      }
    }
  }

  function loadManureData() {
    const manureLogs = getUserData('etee_manure_logs');
    const coopManureLogs = manureLogs.filter(log => log.coopId === currentCoopId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayManure = coopManureLogs
      .filter(log => new Date(log.timestamp) >= today)
      .reduce((total, log) => total + log.amountCollected, 0);
    
    const manureValue = document.querySelector('.manure-value');
    if (manureValue) {
      manureValue.textContent = `${todayManure.toFixed(2)} kg`;
    }
    
    const manureTableBody = document.getElementById('manureTableBody');
    if (manureTableBody) {
      if (coopManureLogs.length === 0) {
        manureTableBody.innerHTML = `
          <tr id="manureEmptyStateRow">
            <td colspan="4" style="text-align: center; padding: 2rem;">
              <i class='bx bx-package' style="font-size: 2rem; color: var(--text-light); display: block; margin-bottom: 0.5rem;"></i>
              <span style="color: var(--text-light);">No manure collection records available. Click "Add Data" to record collections.</span>
            </td>
          </tr>
        `;
      } else {
        manureTableBody.innerHTML = '';
        coopManureLogs.sort((a, b) => b.timestamp - a.timestamp);
        coopManureLogs.forEach(log => {
          updateManureTable(log);
        });
      }
    }
  }

  const addDataBtn = document.getElementById('addDataBtn');
  const dataEntryModal = document.getElementById('dataEntryModal');
  const dataEntryForm = document.getElementById('dataEntryForm');
  
  function openDataModal() {
    const now = new Date();
    const jsonDateTime = JSON.stringify(now).replace(/['"]/g, '');
    
    const currentDateTimeField = document.getElementById('currentDateTime');
    currentDateTimeField.value = jsonDateTime;
    
    dataEntryModal.classList.add('active');
    
    setTimeout(() => {
      const tempInput = document.getElementById('temperature');
      if (tempInput) tempInput.focus();
    }, 300);
  }
  
  if (addDataBtn) {
    addDataBtn.addEventListener('click', openDataModal);
  }
  
  if (dataEntryForm) {
    dataEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!currentCoopId) {
        showNotification('Please select a chicken coop first!', 'error');
        return;
      }
      
      const dateTimeField = document.getElementById('currentDateTime');
      const dateTime = dateTimeField.value;
      const temperature = parseFloat(document.getElementById('temperature').value);
      const humidity = parseFloat(document.getElementById('humidity').value);
      const co2 = parseInt(document.getElementById('co2').value);
      const ammonia = parseFloat(document.getElementById('ammonia').value);
      const manureAmount = parseFloat(document.getElementById('manureAmount').value);
      
      const newMeasurement = {
        id: Date.now(),
        coopId: currentCoopId,
        dateTime: dateTime,
        timestamp: new Date(dateTime).getTime(),
        temperature,
        humidity,
        co2,
        ammonia,
        readingIds: {
          temperature: generateReadingId('TEMP'),
          humidity: generateReadingId('HUMID'),
          co2: generateReadingId('CO2'),
          ammonia: generateReadingId('AMM')
        },
        deviceIds: {
          temperature: 'DHT22-PRO',
          humidity: 'DHT22-PRO',
          co2: 'MH-Z19B',
          ammonia: 'MQ-137'
        }
      };
      
      const newManureLog = {
        logId: Date.now() + 1,
        coopId: currentCoopId,
        timestamp: new Date(dateTime).getTime(),
        dateTime: dateTime,
        amountCollected: manureAmount,
      };
      
      const measurements = getUserData('etee_measurements');
      measurements.push(newMeasurement);
      setUserData('etee_measurements', measurements);
      
      const manureLogs = getUserData('etee_manure_logs');
      manureLogs.push(newManureLog);
      setUserData('etee_manure_logs', manureLogs);
      
      const submitBtn = dataEntryForm.querySelector('.submit-button');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
        submitBtn.classList.add('success-animation');
      }
      
      updateDashboardData(newMeasurement);
      updateManureData(newManureLog);
      
      loadDashboardData();
      loadManureData();
      
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Data';
          submitBtn.classList.remove('success-animation');
        }
        closeModal(dataEntryModal);
        showNotification('New data added successfully!', 'success');
      }, 1500);
    });
  }
  
  function updateDashboardData(measurement) {
    const emptyStateRow = document.getElementById('emptyStateRow');
    if (emptyStateRow) {
      emptyStateRow.remove();
    }

    const temperatureValue = document.querySelector('.temperature-value');
    if (temperatureValue) {
      temperatureValue.textContent = `${measurement.temperature}°C`;
    }
    
    const humidityValue = document.querySelector('.humidity-value');
    if (humidityValue) {
      humidityValue.textContent = `${measurement.humidity}%`;
    }
    
    const co2Value = document.querySelector('.co2-value');
    if (co2Value) {
      co2Value.textContent = `${measurement.co2} ppm`;
    }
    
    const ammoniaValue = document.querySelector('.ammonia-value');
    if (ammoniaValue) {
      ammoniaValue.textContent = `${measurement.ammonia} ppm`;
    }
    
    updateActivityTable(measurement);
  }
  
  function updateManureData(manureLog) {
    const manureLogs = getUserData('etee_manure_logs');
    const coopManureLogs = manureLogs.filter(log => log.coopId === currentCoopId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayManure = coopManureLogs
      .filter(log => new Date(log.timestamp) >= today)
      .reduce((total, log) => total + log.amountCollected, 0);
    
    const manureValue = document.querySelector('.manure-value');
    if (manureValue) {
      manureValue.textContent = `${todayManure.toFixed(2)} kg`;
    }
    
    const manureEmptyStateRow = document.getElementById('manureEmptyStateRow');
    if (manureEmptyStateRow) {
      manureEmptyStateRow.remove();
    }
    
    updateManureTable(manureLog);
  }
  
  function updateActivityTable(measurement) {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;
    
    const now = new Date(measurement.timestamp);
    const formattedDate = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const normalRanges = {
      temperature: { min: 26.0, max: 29.0 },
      humidity: { min: 50, max: 70 },
      co2: { min: 350, max: 500 },
      ammonia: { min: 0, max: 0.25 }
    };
    
    const isNormal = {
      temperature: measurement.temperature >= normalRanges.temperature.min && 
                   measurement.temperature <= normalRanges.temperature.max,
      humidity: measurement.humidity >= normalRanges.humidity.min && 
                measurement.humidity <= normalRanges.humidity.max,
      co2: measurement.co2 >= normalRanges.co2.min && 
           measurement.co2 <= normalRanges.co2.max,
      ammonia: measurement.ammonia >= normalRanges.ammonia.min && 
               measurement.ammonia <= normalRanges.ammonia.max
    };
    
    const sensors = [
      { 
        type: 'temperature', 
        label: 'Temperature reading', 
        value: `${measurement.temperature}°C`,
        isNormal: isNormal.temperature,
        readingId: measurement.readingIds?.temperature || generateReadingId('TEMP'),
        deviceId: measurement.deviceIds?.temperature || 'DHT22-PRO'
      },
      { 
        type: 'humidity', 
        label: 'Humidity reading', 
        value: `${measurement.humidity}%`,
        isNormal: isNormal.humidity,
        readingId: measurement.readingIds?.humidity || generateReadingId('HUMID'),
        deviceId: measurement.deviceIds?.humidity || 'DHT22-PRO'
      },
      { 
        type: 'co2', 
        label: 'CO₂ level reading', 
        value: `${measurement.co2} ppm`,
        isNormal: isNormal.co2,
        readingId: measurement.readingIds?.co2 || generateReadingId('CO2'),
        deviceId: measurement.deviceIds?.co2 || 'MH-Z19B'
      },
      { 
        type: 'ammonia', 
        label: 'Ammonia level reading', 
        value: `${measurement.ammonia} ppm`,
        isNormal: isNormal.ammonia,
        readingId: measurement.readingIds?.ammonia || generateReadingId('AMM'),
        deviceId: measurement.deviceIds?.ammonia || 'MQ-137'
      }
    ];
    
    sensors.forEach(sensor => {
      const newRow = document.createElement('tr');
      newRow.dataset.sensor = sensor.type;
      newRow.dataset.deviceId = sensor.deviceId;
      newRow.dataset.readingId = sensor.readingId;
      
      newRow.innerHTML = `
        <td>${formattedDate} • ${formattedTime}</td>
        <td>${sensor.readingId}</td>
        <td>${sensor.value}</td>
        <td><span class="status ${sensor.isNormal ? 'normal' : 'abnormal'}">${sensor.isNormal ? 'Normal' : 'Abnormal'}</span></td>
        <td style="text-align: center;"></td>
      `;
  
      // Add hover delete functionality
      newRow.addEventListener('mouseenter', () => {
        if (!newRow.querySelector('.delete-icon')) {
          const deleteIcon = document.createElement('i');
          deleteIcon.className = 'bx bx-trash delete-icon';
          deleteIcon.style.cssText = `
            color: var(--danger-color);
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.2s ease;
            opacity: 0;
            transform: scale(0.8);
          `;
          
          newRow.querySelector('td:last-child').appendChild(deleteIcon);
          
          setTimeout(() => {
            deleteIcon.style.opacity = '1';
            deleteIcon.style.transform = 'scale(1)';
          }, 10);
          
          deleteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteModal('sensor', measurement.id, sensor.type);
          });
        }
      });
      
      newRow.addEventListener('mouseleave', () => {
        const deleteIcon = newRow.querySelector('.delete-icon');
        if (deleteIcon) {
          deleteIcon.style.opacity = '0';
          deleteIcon.style.transform = 'scale(0.8)';
          setTimeout(() => {
            if (deleteIcon.parentNode) {
              deleteIcon.remove();
            }
          }, 200);
        }
      });
      
      if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
      } else {
        tableBody.appendChild(newRow);
      }
      
      // Check current chart filter
      const chartDataSelector = document.getElementById('chartDataSelector');
      if (chartDataSelector && chartDataSelector.value !== sensor.type) {
        newRow.style.display = 'none';
      }
    });
  }

  function updateManureTable(manureLog) {
    const manureTableBody = document.getElementById('manureTableBody');
    if (!manureTableBody) return;
    
    const timestamp = new Date(manureLog.timestamp);
    const jsonDate = JSON.stringify(timestamp).replace(/['"]/g, '');
    
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
      <td>${jsonDate}</td>
      <td>LOG-${manureLog.logId}</td>
      <td>${manureLog.amountCollected.toFixed(2)} kg</td>
      <td style="text-align: center;"></td>
    `;
    
    // Add hover delete functionality
    newRow.addEventListener('mouseenter', () => {
      if (!newRow.querySelector('.delete-icon')) {
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'bx bx-trash delete-icon';
        deleteIcon.style.cssText = `
          color: var(--danger-color);
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          opacity: 0;
          transform: scale(0.8);
        `;
        
        newRow.querySelector('td:last-child').appendChild(deleteIcon);
        
        setTimeout(() => {
          deleteIcon.style.opacity = '1';
          deleteIcon.style.transform = 'scale(1)';
        }, 10);
        
        deleteIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          showDeleteModal('manure', manureLog.logId);
        });
      }
    });
    
    newRow.addEventListener('mouseleave', () => {
      const deleteIcon = newRow.querySelector('.delete-icon');
      if (deleteIcon) {
        deleteIcon.style.opacity = '0';
        deleteIcon.style.transform = 'scale(0.8)';
        setTimeout(() => {
          if (deleteIcon.parentNode) {
            deleteIcon.remove();
          }
        }, 200);
      }
    });
    
    if (manureTableBody.firstChild) {
      manureTableBody.insertBefore(newRow, manureTableBody.firstChild);
    } else {
      manureTableBody.appendChild(newRow);
    }
  }

  function showDeleteModal(type, id, sensorType = null) {
    const modal = document.createElement('div');
    modal.className = 'modal delete-modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.innerHTML = `<i class='bx bx-trash'></i> Delete ${type === 'sensor' ? 'Sensor Reading' : 'Manure Log'}`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = `
      <p style="margin-bottom: 1.5rem;">Are you sure you want to delete this ${type === 'sensor' ? 'sensor reading' : 'manure collection log'}?</p>
      <p style="color: var(--danger-color); font-size: 0.9rem;">This action cannot be undone.</p>
    `;
    
    const modalActions = document.createElement('div');
    modalActions.className = 'form-actions';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'submit-button';
    deleteButton.style.backgroundColor = 'var(--danger-color)';
    deleteButton.innerHTML = '<i class="bx bx-trash"></i> Delete';
    deleteButton.addEventListener('click', () => {
      if (type === 'sensor') {
        deleteSensorReading(id, sensorType);
      } else {
        deleteManureLog(id);
      }
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    modalActions.appendChild(cancelButton);
    modalActions.appendChild(deleteButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalActions);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
  }

  function deleteSensorReading(measurementId, sensorType) {
    let measurements = getUserData('etee_measurements');
    measurements = measurements.filter(m => m.id !== measurementId);
    setUserData('etee_measurements', measurements);
    
    loadDashboardData();
    showNotification('Sensor reading deleted successfully!', 'success');
  }

  function deleteManureLog(logId) {
    let manureLogs = getUserData('etee_manure_logs');
    manureLogs = manureLogs.filter(log => log.logId !== logId);
    setUserData('etee_manure_logs', manureLogs);
    
    loadManureData();
    showNotification('Manure log deleted successfully!', 'success');
  }

  const sensorSelector = document.getElementById('sensorSelector');
  if (sensorSelector) {
    sensorSelector.addEventListener('change', () => {
      const selectedSensor = sensorSelector.value;
      const allRows = document.querySelectorAll('tbody tr:not(#emptyStateRow)');
      
      allRows.forEach(row => {
        if (selectedSensor === 'all' || row.dataset.sensor === selectedSensor) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  function showNotification(message, type = 'info') {
    let notifContainer = document.querySelector('.notification-container');
    if (!notifContainer) {
      notifContainer = document.createElement('div');
      notifContainer.className = 'notification-container';
      document.body.appendChild(notifContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let title;
    switch (type) {
      case 'success':
        title = 'Success';
        break;
      case 'error':
        title = 'Error';
        break;
      case 'warning':
        title = 'Warning';
        break;
      default:
        title = 'Information';
    }
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'bx bx-check-circle' : 
                     type === 'error' ? 'bx bx-error-circle' : 
                     type === 'warning' ? 'bx bx-error' : 'bx bx-info-circle';
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'notification-title';
    titleEl.textContent = title;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;
    
    content.appendChild(titleEl);
    content.appendChild(messageEl);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<i class="bx bx-x"></i>';
    closeButton.addEventListener('click', () => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (notification.parentElement) {
          notifContainer.removeChild(notification);
        }
      }, 300);
    });
    
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    notifContainer.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
          if (notification.parentElement) {
            notifContainer.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  // Close button event listeners
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) {
          setTimeout(() => form.reset(), 300);
        }
      }
    });
  });
  
  // Cancel button event listeners
  document.querySelectorAll('.cancel-button').forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) {
          setTimeout(() => form.reset(), 300);
        }
      }
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
      const form = e.target.querySelector('form');
      if (form) {
        setTimeout(() => form.reset(), 300);
      }
    }
  });
  
  // Enable escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal.active');
      activeModals.forEach(modal => {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) {
          setTimeout(() => form.reset(), 300);
        }
      });
    }
  });
});

function generateReadingId(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}