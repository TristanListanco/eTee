document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar component
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
      name: "Dja-ver Q. Hassan",
      role: "Admin",
      email: "etee@gmail.com",
      image: "admin.png"
    },
    onProfileEdit: function() {
      openProfileModal();
    },
    onNavItemClick: function(e, item) {
      if (item.href === '#sign-out') {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          window.location.href = 'signin.html';
        }
      }
    }
  });

  // Initialize storage
  if (!localStorage.getItem('etee_coops')) {
    localStorage.setItem('etee_coops', JSON.stringify([]));
  }
  if (!localStorage.getItem('etee_measurements')) {
    localStorage.setItem('etee_measurements', JSON.stringify([]));
  }
  if (!localStorage.getItem('etee_manure_logs')) {
    localStorage.setItem('etee_manure_logs', JSON.stringify([]));
  }

  ensureSensorsForAllCoops();



  // Global variable to store the currently selected coop
  let currentCoopId = null;

  // Check if there are existing coops
  const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
  if (coops.length === 0) {
    // Show chicken coop management section
    showChickenCoopManagement();
  } else {
    // Show water quality management section with the first coop
    showWaterQualityManagement(coops[0].id);
  }

  // Chicken Coop Management Functions
  function showChickenCoopManagement() {
    const dashboardSection = document.getElementById('dashboard');
    const coopSection = document.getElementById('chickenCoopManagement');
    const waterSection = document.getElementById('waterQualityManagement');
    
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (waterSection) waterSection.style.display = 'none';
    if (coopSection) coopSection.style.display = 'block';
    
    loadCoops();
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
      const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
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

  // Sensor Devices Functions
function loadSensorData() {
  const sensorDevices = JSON.parse(localStorage.getItem('etee_sensor_devices') || '[]');
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
    
    // Create sensor device items
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
  
  // Add hover effect
  item.addEventListener('mouseenter', () => {
    item.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  });
  
  item.addEventListener('mouseleave', () => {
    item.style.backgroundColor = 'transparent';
  });
  
  // Create status indicator
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
  
  // Add click event to show details
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    showSensorDetailModal(sensor);
  });
  
  return item;
}

function showSensorDetailModal(sensor) {
  const modal = document.getElementById('sensorDetailModal');
  const detailContent = document.getElementById('sensorDetailContent');
  
  const formattedDate = new Date(sensor.installationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  detailContent.innerHTML = `
    <div class="sensor-detail-info">
      <div class="detail-row" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
        <span style="font-weight: 500; color: var(--text-light);">Device ID</span>
        <span style="color: var(--text-color);">${sensor.deviceId}</span>
      </div>
      <div class="detail-row" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
        <span style="font-weight: 500; color: var(--text-light);">Device Type</span>
        <span style="color: var(--text-color);">${sensor.deviceType}</span>
      </div>
      <div class="detail-row" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
        <span style="font-weight: 500; color: var(--text-light);">Model Number</span>
        <span style="color: var(--text-color);">${sensor.modelNumber}</span>
      </div>
      <div class="detail-row" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
        <span style="font-weight: 500; color: var(--text-light);">Installation Date</span>
        <span style="color: var(--text-color);">${formattedDate}</span>
      </div>
      <div class="detail-row" style="display: flex; justify-content: space-between; padding: 1rem 0;">
        <span style="font-weight: 500; color: var(--text-light);">Status</span>
        <span class="status ${sensor.status.toLowerCase()}" style="color: ${sensor.status.toLowerCase() === 'active' ? 'var(--success-color)' : 'var(--danger-color)'};">${sensor.status}</span>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

  function showFullDashboard() {
    const dashboardSection = document.getElementById('dashboard');
    const coopSection = document.getElementById('chickenCoopManagement');
    const waterSection = document.getElementById('waterQualityManagement');
    
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (coopSection) coopSection.style.display = 'none';
    if (waterSection) waterSection.style.display = 'none';
  }

  // Load and display coops
  function loadCoops() {
    const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
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
  }

  // Create coop card element
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
    
    // Add event listeners
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
  // Function to create predefined sensors for a coop
function createPredefinedSensors(coopId) {
  const sensorDevices = JSON.parse(localStorage.getItem('etee_sensor_devices') || '[]');
  
  // Predefined sensor configurations
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
  
  // Add all predefined sensors
  predefinedSensors.forEach(sensor => {
    sensorDevices.push(sensor);
  });
  
  localStorage.setItem('etee_sensor_devices', JSON.stringify(sensorDevices));
}
// Function to ensure all coops have predefined sensors
function ensureSensorsForAllCoops() {
  const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
  const sensorDevices = JSON.parse(localStorage.getItem('etee_sensor_devices') || '[]');
  
  coops.forEach(coop => {
    // Check if this coop already has sensors
    const coopSensors = sensorDevices.filter(sensor => sensor.coopId === coop.id);
    
    // If no sensors exist for this coop, create them
    if (coopSensors.length === 0) {
      createPredefinedSensors(coop.id);
    }
  });
}

  // Delete coop
  function deleteCoop(coopId) {
    let coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
    coops = coops.filter(c => c.id !== coopId);
    localStorage.setItem('etee_coops', JSON.stringify(coops));
    loadCoops();
    showNotification('Chicken coop deleted successfully!', 'success');
    
    // If no coops left, show chicken coop management
    if (coops.length === 0) {
      showChickenCoopManagement();
    }
  }

  // Add Coop Button and Empty State Button Event Listeners
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

  // Open add coop modal
  function openAddCoopModal() {
    const addCoopModal = document.getElementById('addCoopModal');
    addCoopModal.classList.add('active');
  }

  // Open edit coop modal
  function openEditCoopModal(coopId) {
    const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
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

  // Close modal function
  function closeModal(modal) {
    modal.classList.remove('active');
    const form = modal.querySelector('form');
    if (form) {
      setTimeout(() => {
        form.reset();
        // Re-set the current date/time for the next entry
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

  // Add Coop Form Submission
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
      
      const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
      coops.push(newCoop);
      localStorage.setItem('etee_coops', JSON.stringify(coops));
      createPredefinedSensors(newCoop.id);
      
      closeModal(document.getElementById('addCoopModal'));
      loadCoops();
      showNotification('Chicken coop added successfully!', 'success');
      
      // If this was the first coop, switch to water quality management
      if (coops.length === 1) {
        setTimeout(() => {
          showWaterQualityManagement(newCoop.id);
        }, 1500);
      }

    });
  }

  // Edit Coop Form Submission
  const editCoopForm = document.getElementById('editCoopForm');
  if (editCoopForm) {
    editCoopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const coopId = parseInt(document.getElementById('editCoopId').value);
      const location = document.getElementById('editCoopLocation').value;
      const size = parseFloat(document.getElementById('editCoopSize').value);
      const capacity = parseInt(document.getElementById('editCoopCapacity').value);
      
      let coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
      const coopIndex = coops.findIndex(c => c.id === coopId);
      
      if (coopIndex !== -1) {
        coops[coopIndex] = {
          ...coops[coopIndex],
          location,
          size,
          capacity
        };
        
        localStorage.setItem('etee_coops', JSON.stringify(coops));
        closeModal(document.getElementById('editCoopModal'));
        loadCoops();
        showNotification('Chicken coop updated successfully!', 'success');
      }
    });
  }

  // Back to Coops Button
  const backToCoopsBtn = document.getElementById('backToCoopsBtn');
  if (backToCoopsBtn) {
    backToCoopsBtn.addEventListener('click', () => {
      showChickenCoopManagement();
    });
  }

  // Water Quality Management Functions
  
  // Function to set zero values
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

  // Load dashboard data
  function loadDashboardData() {
    const measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
    const coopMeasurements = measurements.filter(m => m.coopId === currentCoopId);
    
    if (coopMeasurements.length === 0) {
      setZeroValues();
      // Show empty state in table
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
      // Sort measurements by timestamp descending
      coopMeasurements.sort((a, b) => b.timestamp - a.timestamp);
      
      // Update dashboard with most recent measurement
      updateDashboardData(coopMeasurements[0]);
      
      // Clear and repopulate the table
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '';
        coopMeasurements.forEach(measurement => {
          updateActivityTable(measurement);
        });
      }
    }
  }

  // Load manure data
function loadManureData() {
  const manureLogs = JSON.parse(localStorage.getItem('etee_manure_logs') || '[]');
  const coopManureLogs = manureLogs.filter(log => log.coopId === currentCoopId);
  
  // Calculate today's total manure collection
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayManure = coopManureLogs
    .filter(log => new Date(log.timestamp) >= today)
    .reduce((total, log) => total + log.amountCollected, 0);
  
  const manureValue = document.querySelector('.manure-value');
  if (manureValue) {
    manureValue.textContent = `${todayManure.toFixed(2)} kg`;
  }
  
  // Update manure table
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

  // Data entry functionality
  const addDataBtn = document.getElementById('addDataBtn');
  const dataEntryModal = document.getElementById('dataEntryModal');
  const dataEntryForm = document.getElementById('dataEntryForm');
  const currentDateTimeField = document.getElementById('currentDateTime');
  
  function openDataModal() {
    const now = new Date();
    // Format date using JSON.stringify
    const jsonDateTime = JSON.stringify(now).replace(/['"]/g, '');
    
    const currentDateTimeField = document.getElementById('currentDateTime');
    currentDateTimeField.value = jsonDateTime;
    
    dataEntryModal.classList.add('active');
    
    setTimeout(() => {
      const tempInput = document.getElementById('temperature');
      if (tempInput) tempInput.focus();
    }, 300);
    
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
      
      // Make sure we have a current coop selected
      if (!currentCoopId) {
        showNotification('Please select a chicken coop first!', 'error');
        return;
      }
      
      const dateTimeField = document.getElementById('currentDateTime');
      const dateTime = dateTimeField.value; // This is already in JSON stringified format
      const temperature = parseFloat(document.getElementById('temperature').value);
      const humidity = parseFloat(document.getElementById('humidity').value);
      const co2 = parseInt(document.getElementById('co2').value);
      const ammonia = parseFloat(document.getElementById('ammonia').value);
      
      // Manure data
      const manureAmount = parseFloat(document.getElementById('manureAmount').value);
      
      // Create sensor measurement
      const newMeasurement = {
        id: Date.now(),
        coopId: currentCoopId,
        dateTime: dateTime, // Store the JSON stringified date
        timestamp: new Date(dateTime).getTime(), // Parse the JSON date to get timestamp
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
      
      // Create manure log
      const newManureLog = {
        logId: Date.now() + 1, // Ensure unique ID
        coopId: currentCoopId,
        timestamp: new Date(dateTime).getTime(), // Parse the JSON date to get timestamp
        dateTime: dateTime, // Store the JSON stringified date
        amountCollected: manureAmount,
      };
      
      // Save measurements
      const measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
      measurements.push(newMeasurement);
      localStorage.setItem('etee_measurements', JSON.stringify(measurements));
      
      // Save manure log
      const manureLogs = JSON.parse(localStorage.getItem('etee_manure_logs') || '[]');
      manureLogs.push(newManureLog);
      localStorage.setItem('etee_manure_logs', JSON.stringify(manureLogs));
      
      const submitBtn = dataEntryForm.querySelector('.submit-button');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
        submitBtn.classList.add('success-animation');
      }
      
      // Update dashboard data immediately
      updateDashboardData(newMeasurement);
      updateManureData(newManureLog);
      
      // Reload dashboard to show new data
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
  
  // Update dashboard with new data
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
  
  // Update manure data
  function updateManureData(manureLog) {
    // Update daily total
    const manureLogs = JSON.parse(localStorage.getItem('etee_manure_logs') || '[]');
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
    
    // Remove empty state row if it exists
    const manureEmptyStateRow = document.getElementById('manureEmptyStateRow');
    if (manureEmptyStateRow) {
      manureEmptyStateRow.remove();
    }
    
    updateManureTable(manureLog);
  }
  
  // Update activity table

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
    
    // Store device ID in data attribute for later use
    newRow.dataset.deviceId = sensor.deviceId;
    newRow.dataset.readingId = sensor.readingId;
    
    newRow.innerHTML = `
      <td>${formattedDate} • ${formattedTime}</td>
      <td>${sensor.readingId}</td>
      <td>${sensor.value}</td>
      <td><span class="status ${sensor.isNormal ? 'normal' : 'abnormal'}">${sensor.isNormal ? 'Normal' : 'Abnormal'}</span></td>
      <td><button class="view-btn"><i class='bx bx-show'></i> View</button></td>
    `;

     // Add hover delete functionality
     newRow.addEventListener('mouseenter', () => {
      if (!newRow.querySelector('.delete-icon')) {
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'bx bx-trash delete-icon';
        deleteIcon.style.cssText = `
          color: var(--danger-color);
          cursor: pointer;
          margin-left: 10px;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          opacity: 0;
          transform: scale(0.8);
        `;
        
        // Add the icon to the DOM first
        newRow.querySelector('td:last-child').appendChild(deleteIcon);
        
        // Trigger animation after a small delay
        setTimeout(() => {
          deleteIcon.style.opacity = '1';
          deleteIcon.style.transform = 'scale(1)';
        }, 10);
        
        deleteIcon.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent row click
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
    
    const sensorSelector = document.getElementById('sensorSelector');
    if (sensorSelector && sensorSelector.value !== 'all' && newRow.dataset.sensor !== sensorSelector.value) {
      newRow.style.display = 'none';
    }
  });
  
  // Add click event listeners to view buttons
  const viewButtons = tableBody.querySelectorAll('.view-btn');
  viewButtons.forEach(btn => {
    if (!btn.hasAttribute('data-listener')) {
      btn.setAttribute('data-listener', 'true');
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const date = row.cells[0].textContent;
        const readingId = row.dataset.readingId;
        const deviceId = row.dataset.deviceId;
        const value = row.cells[2].textContent;
        const status = row.cells[3].textContent;
        
        showDetailModal(date, readingId, deviceId, value, status, row.dataset.sensor);
      });
    }
  });
}


// Update manure table
function updateManureTable(manureLog) {
  const manureTableBody = document.getElementById('manureTableBody');
  if (!manureTableBody) return;
  
  // Format date as JSON stringified format
  const timestamp = new Date(manureLog.timestamp);
  const jsonDate = JSON.stringify(timestamp).replace(/['"]/g, '');
  
  const newRow = document.createElement('tr');
  
  newRow.innerHTML = `
    <td>${jsonDate}</td>
    <td>LOG-${manureLog.logId}</td>
    <td>${manureLog.amountCollected.toFixed(2)} kg</td>
    <td style="text-align: center;"><button class="view-btn"><i class='bx bx-show'></i> View</button></td>
  `;
  
  // Add hover delete functionality
  newRow.addEventListener('mouseenter', () => {
    if (!newRow.querySelector('.delete-icon')) {
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'bx bx-trash delete-icon';
      deleteIcon.style.cssText = `
        color: var(--danger-color);
        cursor: pointer;
        margin-left: 10px;
        font-size: 1.2rem;
        transition: all 0.2s ease;
        opacity: 0;
        transform: scale(0.8);
      `;
      
      // Add the icon to the DOM first
      newRow.querySelector('td:last-child').appendChild(deleteIcon);
      
      // Trigger animation after a small delay
      setTimeout(() => {
        deleteIcon.style.opacity = '1';
        deleteIcon.style.transform = 'scale(1)';
      }, 10);
      
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent row click
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
  
  // Add click event listener to view button
  const viewBtn = newRow.querySelector('.view-btn');
  viewBtn.addEventListener('click', function() {
    showManureDetailModal(manureLog);
  });
}
  
  // Show manure detail modal
  function showManureDetailModal(manureLog) {
    // Check if a detail modal already exists and remove it
    const existingModal = document.querySelector('.detail-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal detail-modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.innerHTML = `<i class='bx bx-package'></i> Manure Collection Details`;
    
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
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Create detail items
    const details = [
      { label: 'Log ID', value: `LOG-${manureLog.logId}` },
      { label: 'Date & Time', value: manureLog.dateTime },
      { label: 'Amount Collected', value: `${manureLog.amountCollected.toFixed(2)} kg` },
    ];
    
    details.forEach(detail => {
      const detailRow = document.createElement('div');
      detailRow.className = 'detail-row';
      
      const detailLabel = document.createElement('div');
      detailLabel.className = 'detail-label';
      detailLabel.textContent = detail.label;
      
      const detailValue = document.createElement('div');
      detailValue.className = 'detail-value';
      detailValue.textContent = detail.value;
      
      detailRow.appendChild(detailLabel);
      detailRow.appendChild(detailValue);
      modalBody.appendChild(detailRow);
    });
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
  }

  // Show delete confirmation modal
function showDeleteModal(type, id, sensorType = null) {
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'modal delete-modal active';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Modal header
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
  
  // Modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = `
    <p style="margin-bottom: 1.5rem;">Are you sure you want to delete this ${type === 'sensor' ? 'sensor reading' : 'manure collection log'}?</p>
    <p style="color: var(--danger-color); font-size: 0.9rem;">This action cannot be undone.</p>
  `;
  
  // Modal actions
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
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalActions);
  modal.appendChild(modalContent);
  
  // Add to DOM
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    }
  });
}

// Delete sensor reading
function deleteSensorReading(measurementId, sensorType) {
  let measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
  measurements = measurements.filter(m => m.id !== measurementId);
  localStorage.setItem('etee_measurements', JSON.stringify(measurements));
  
  loadDashboardData();
  showNotification('Sensor reading deleted successfully!', 'success');
}

// Delete manure log
function deleteManureLog(logId) {
  let manureLogs = JSON.parse(localStorage.getItem('etee_manure_logs') || '[]');
  manureLogs = manureLogs.filter(log => log.logId !== logId);
  localStorage.setItem('etee_manure_logs', JSON.stringify(manureLogs));
  
  loadManureData(); // This will now properly show the empty state if no logs remain
  showNotification('Manure log deleted successfully!', 'success');
}

  // Sensor dropdown filtering
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

  // Chart data selector
  const chartDataSelector = document.getElementById('chartDataSelector');
  if (chartDataSelector) {
    chartDataSelector.addEventListener('change', () => {
      updateChartDisplay(chartDataSelector.value);
    });
  }

  // Chart update function (placeholder)
  function updateChartDisplay(dataType) {
    console.log(`Updating chart to display ${dataType} data`);
    // Implement chart update logic here
  }

  // Show detail modal
function showDetailModal(date, readingId, deviceId, value, status, sensorType) {
  // Check if a detail modal already exists and remove it
  const existingModal = document.querySelector('.detail-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }
  
  // Get the appropriate icon based on sensor type
  let icon;
  switch(sensorType) {
    case 'temperature':
      icon = 'bxs-hot';
      break;
    case 'humidity':
      icon = 'bxs-droplet-half';
      break;
    case 'co2':
      icon = 'bxs-cloud';
      break;
    case 'ammonia':
      icon = 'bxs-flask';
      break;
    default:
      icon = 'bxs-dashboard';
  }
  
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'modal detail-modal active';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h3');
  modalTitle.innerHTML = `<i class='bx ${icon}'></i> Sensor Reading Details`;
  
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
  
  // Modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  // Determine if status is normal or abnormal
  const isNormal = status.toLowerCase().includes('normal') && !status.toLowerCase().includes('abnormal');
  
  // Create detail items
  const details = [
    { label: 'Date & Time', value: date },
    { label: 'Reading ID', value: readingId },
    { label: 'Device ID', value: deviceId },
    { label: 'Value', value: value },
    { label: 'Status', value: status, isStatus: true, type: isNormal ? 'normal' : 'abnormal' },
  ];
  
  details.forEach(detail => {
    const detailRow = document.createElement('div');
    detailRow.className = 'detail-row';
    
    const detailLabel = document.createElement('div');
    detailLabel.className = 'detail-label';
    detailLabel.textContent = detail.label;
    
    const detailValue = document.createElement('div');
    detailValue.className = 'detail-value';
    
    if (detail.isStatus) {
      detailValue.innerHTML = `<span class="status ${detail.type}">${detail.value}</span>`;
    } else {
      detailValue.textContent = detail.value;
    }
    
    detailRow.appendChild(detailLabel);
    detailRow.appendChild(detailValue);
    modalBody.appendChild(detailRow);
  });
  
  // Add a chart placeholder
  const chartSection = document.createElement('div');
  chartSection.className = 'detail-chart';
  chartSection.innerHTML = `
    <h4>Historical Data (Last 24 Hours)</h4>
    <div class="chart-placeholder mini">
      <i class='bx bx-line-chart'></i>
      <p>Historical data chart would appear here</p>
    </div>
  `;
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  
  // Add to DOM
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    }
  });
}

  // Simple notification system
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
  
  // Profile Edit Functionality
  const profileEditModal = document.getElementById('profileEditModal');
  const profileEditForm = document.getElementById('profileEditForm');
  const profileImageInput = document.getElementById('profileImage');
  const profilePreview = document.getElementById('profilePreview');
  
  function openProfileModal() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    document.getElementById('profileName').value = savedProfile ? savedProfile.name : 'Dja-ver Q. Hassan';
    document.getElementById('profileEmail').value = savedProfile ? savedProfile.email : 'etee@gmail.com';
    document.getElementById('profilePhone').value = savedProfile ? savedProfile.phone : '+1234567890';
    document.getElementById('profileAddress').value = savedProfile ? savedProfile.address : '123 Main Street, Anytown, USA';
    document.getElementById('dateRegistered').value = savedProfile ? savedProfile.dateRegistered : 'January 1, 2024';
    document.getElementById('userRole').value = savedProfile ? savedProfile.userRole : 'Admin';
    document.getElementById('userID').value = savedProfile ? savedProfile.userID : 'USR-001';
    
    profilePreview.src = savedProfile && savedProfile.profileImage ? savedProfile.profileImage : 'admin.png';
    
    profileEditModal.classList.add('active');
  }
  
  if (profileImageInput) {
    profileImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const updatedProfile = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        dateRegistered: document.getElementById('dateRegistered').value,
        userRole: document.getElementById('userRole').value,
        userID: document.getElementById('userID').value,
        profileImage: profilePreview.src
      };
      
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      sidebar.setProfile({
        name: updatedProfile.name,
        role: updatedProfile.userRole,
        email: updatedProfile.email,
        image: updatedProfile.profileImage
      });
      
      const submitBtn = profileEditForm.querySelector('.submit-button');
      submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
      submitBtn.classList.add('success-animation');
      
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Changes';
        submitBtn.classList.remove('success-animation');
        profileEditModal.classList.remove('active');
        showNotification('Profile updated successfully!', 'success');
      }, 1500);
    });
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

// Function to generate random reading ID
function generateReadingId(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}