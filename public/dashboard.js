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
        text: 'About',
        icon: 'bx bx-info-circle',
        href: '#about',
        active: false
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
      } else if (item.href === '#about') {
        e.preventDefault();
        if (window.aboutModal) {
          window.aboutModal.open();
        } else {
          openAboutModal();
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
 
        sensorDevicesList.appendChild(sensorItem);
      });
    }
  }

  

  function loadCoops() {
    const currentUser = window.currentUser;
    if (!currentUser) return;
    
    fetch(`/api/coops?userId=${currentUser.userID}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch coops');
        }
        return response.json();
      })
      .then(coops => {
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
            // Convert the database field names to match your frontend code
            const coopData = {
              id: coop.CoopID,
              location: coop.Location,
              size: coop.Size,
              capacity: coop.Capacity,
              dateAdded: coop.DateInstalled,
              status: coop.Status
            };
            
            const coopCard = createCoopCard(coopData);
            coopsGrid.appendChild(coopCard);
          });
        }
        updateCoopManagementTitle();
      })
      .catch(error => {
        console.error('Error fetching coops:', error);
        showNotification('Failed to load chicken coops', 'error');
      });
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
          <i class='bx bx-id-card'></i>
          <span>Coop ID: ${coop.id}</span>
        </div>
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
    
    // Add event handlers (rest of the function remains the same)
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


 

  // Update deleteCoop function to use API
function deleteCoop(coopId) {
  fetch(`/api/coops/${coopId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.error || 'Failed to delete coop');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      loadCoops();
      updateCoopManagementTitle();
      showNotification('Chicken coop deleted successfully!', 'success');
      
      // If no coops left, show the empty state
      fetch(`/api/coops?userId=${window.currentUser.userID}`)
        .then(response => response.json())
        .then(coops => {
          if (coops.length === 0) {
            showChickenCoopManagement();
          }
        });
    } else {
      showNotification(data.error || 'Failed to delete coop', 'error');
    }
  })
  .catch(error => {
    showNotification(error.message || 'Failed to delete coop', 'error');
  });
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

  // Update the addCoopForm to use API
const addCoopForm = document.getElementById('addCoopForm');
if (addCoopForm) {
  addCoopForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const location = document.getElementById('coopLocation').value;
    const size = parseFloat(document.getElementById('coopSize').value);
    const capacity = parseInt(document.getElementById('coopCapacity').value);
    
    if (!location || isNaN(size) || isNaN(capacity)) {
      showNotification('Please fill in all fields correctly', 'error');
      return;
    }
    
    const currentUser = window.currentUser;
    if (!currentUser) {
      showNotification('User session not found', 'error');
      return;
    }
    
    fetch('/api/coops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.userID,
        location,
        size,
        capacity
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to add coop');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        closeModal(document.getElementById('addCoopModal'));
        loadCoops();
        showNotification('Chicken coop added successfully!', 'success');
        
        // After adding the first coop, navigate to its page
        if (data.coop && data.coop.id) {
          setTimeout(() => {
            showWaterQualityManagement(data.coop.id);
          }, 1500);
        }
      } else {
        showNotification(data.error || 'Failed to add coop', 'error');
      }
    })
    .catch(error => {
      showNotification(error.message || 'Failed to add coop', 'error');
    });
  });
}

  // Update editCoopForm to use API
const editCoopForm = document.getElementById('editCoopForm');
if (editCoopForm) {
  editCoopForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const coopId = document.getElementById('editCoopId').value;
    const location = document.getElementById('editCoopLocation').value;
    const size = parseFloat(document.getElementById('editCoopSize').value);
    const capacity = parseInt(document.getElementById('editCoopCapacity').value);
    
    if (!location || isNaN(size) || isNaN(capacity)) {
      showNotification('Please fill in all fields correctly', 'error');
      return;
    }
    
    fetch(`/api/coops/${coopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        size,
        capacity
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update coop');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        closeModal(document.getElementById('editCoopModal'));
        loadCoops();
        updateCoopManagementTitle();
        showNotification('Chicken coop updated successfully!', 'success');
      } else {
        showNotification(data.error || 'Failed to update coop', 'error');
      }
    })
    .catch(error => {
      showNotification(error.message || 'Failed to update coop', 'error');
    });
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
    if (!currentCoopId) return;
    
    // Fetch the most recent reading
    fetch(`/api/readings?coopId=${currentCoopId}&limit=1`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch readings');
        }
        return response.json();
      })
      .then(readings => {
        if (readings.length === 0) {
          // No readings available yet
          setZeroValues();
          const tableBody = document.querySelector('tbody');
          if (tableBody) {
            tableBody.innerHTML = `
              <tr id="emptyStateRow">
                <td colspan="6" style="text-align: center; padding: 2rem;">
                  <i class='bx bx-data' style="font-size: 2rem; color: var(--text-light); display: block; margin-bottom: 0.5rem;"></i>
                  <span style="color: var(--text-light);">No sensor readings available. Click "Add Data" to record measurements.</span>
                </td>
              </tr>
            `;
          }
        } else {
          // Update dashboard with the latest reading
          const latestReading = readings[0];
          updateDashboardCards(latestReading);
          
          // Now fetch all readings for the table
          return fetch(`/api/readings?coopId=${currentCoopId}`)
            .then(response => response.json())
            .then(allReadings => {
              updateActivityTable(allReadings);
            });
        }
      })
      .catch(error => {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load sensor data', 'error');
      });
  }

  // Load manure data from database

  const addDataBtn = document.getElementById('addDataBtn');
  const dataEntryModal = document.getElementById('dataEntryModal');
  
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
  
  // Add this function to handle the data entry form submission
  const dataEntryForm = document.getElementById('dataEntryForm');
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
      
      // Save sensor reading data
      const readingData = {
        coopId: currentCoopId,
        temperature,
        humidity,
        co2Level: co2,
        ammoniaLevel: ammonia,
        timestamp: dateTime
      };
      
      // Save manure collection data
      const manureData = {
        coopId: currentCoopId,
        amountCollected: manureAmount,
        timestamp: dateTime
      };
      
      // First save the sensor reading
      fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readingData),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to save sensor readings');
          });
        }
        return response.json();
      })
      .then(readingResult => {
        // Then save the manure log
        return fetch('/api/manure-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(manureData),
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to save manure data');
          });
        }
        return response.json();
      })
      .then(manureResult => {
        // Both saved successfully
        const submitBtn = dataEntryForm.querySelector('.submit-button');
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
          submitBtn.classList.add('success-animation');
        }
        
        // Reload dashboard data
        loadDashboardData();
    
        
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Data';
            submitBtn.classList.remove('success-animation');
          }
          closeModal(document.getElementById('dataEntryModal'));
          showNotification('New data added successfully!', 'success');
        }, 1500);
      })
      .catch(error => {
        showNotification(error.message || 'Failed to save data', 'error');
      });
    });
  }
  
  // Update dashboard card values
  function updateDashboardCards(reading) {
    const temperatureValue = document.querySelector('.temperature-value');
    if (temperatureValue) {
      temperatureValue.textContent = `${reading.Temperature}°C`;
    }
    
    const humidityValue = document.querySelector('.humidity-value');
    if (humidityValue) {
      humidityValue.textContent = `${reading.Humidity}%`;
    }
    
    const co2Value = document.querySelector('.co2-value');
    if (co2Value) {
      co2Value.textContent = `${reading.CO2Level} ppm`;
    }
    
    const ammoniaValue = document.querySelector('.ammonia-value');
    if (ammoniaValue) {
      ammoniaValue.textContent = `${reading.AmmoniaLevel} ppm`;
    }
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
        readingId: measurement.readingIds?.temperature || generateReadingId('TEMP')
      },
      { 
        type: 'humidity', 
        label: 'Humidity reading', 
        value: `${measurement.humidity}%`,
        isNormal: isNormal.humidity,
        readingId: measurement.readingIds?.humidity || generateReadingId('HUMID')
      },
      { 
        type: 'co2', 
        label: 'CO₂ level reading', 
        value: `${measurement.co2} ppm`,
        isNormal: isNormal.co2,
        readingId: measurement.readingIds?.co2 || generateReadingId('CO2')
      },
      { 
        type: 'ammonia', 
        label: 'Ammonia level reading', 
        value: `${measurement.ammonia} ppm`,
        isNormal: isNormal.ammonia,
        readingId: measurement.readingIds?.ammonia || generateReadingId('AMM')
      }
    ];
    
    sensors.forEach(sensor => {
      const newRow = document.createElement('tr');
      newRow.dataset.sensor = sensor.type;
      newRow.dataset.readingId = sensor.readingId;
      
      newRow.innerHTML = `
        <td>${formattedDate} • ${formattedTime}</td>
        <td>${sensor.readingId}</td>
        <td>${sensor.value}</td>
        <td><span class="status ${sensor.isNormal ? 'normal' : 'abnormal'}">${sensor.isNormal ? 'Normal' : 'Abnormal'}</span></td>
        <td style="text-align: center;">
          <i class='bx bx-trash delete-icon' title='Delete'></i>
        </td>
      `;
  
      // Add click event to the delete icon
      const deleteIcon = newRow.querySelector('.delete-icon');
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteModal('sensor', measurement.id, sensor.type);
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
     null;
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

  // Add this function if it doesn't exist already
  function openProfileModal() {
    const currentUser = window.currentUser;
    if (!currentUser) return;
  
    // Split the name into first and last name if not already present
    let firstName = currentUser.firstName || '';
    let lastName = currentUser.lastName || '';
    
    // If firstName/lastName are not available, split from name
    if (!firstName && !lastName && currentUser.name) {
      const nameParts = currentUser.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
  
    // Populate the form fields
    document.getElementById('profileFirstName').value = firstName;
    document.getElementById('profileLastName').value = lastName;
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileAddress').value = currentUser.address || '';
    
    // Set the user role correctly
    const userRoleSelect = document.getElementById('userRole');
    // Convert role to match option case if needed (e.g., 'admin' to 'Admin')
    const normalizedRole = currentUser.role ? 
      currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase() : 
      'Operator'; // Default to Operator if no role exists
    
    // First check if the exact role exists in options
    let roleExists = false;
    for (let i = 0; i < userRoleSelect.options.length; i++) {
      if (userRoleSelect.options[i].value === currentUser.role) {
        userRoleSelect.selectedIndex = i;
        roleExists = true;
        break;
      }
    }
    
    // If not found, try with normalized case
    if (!roleExists) {
      for (let i = 0; i < userRoleSelect.options.length; i++) {
        if (userRoleSelect.options[i].value === normalizedRole) {
          userRoleSelect.selectedIndex = i;
          break;
        }
      }
    }
    
    document.getElementById('userID').value = currentUser.userID || '';
    document.getElementById('dateRegistered').value = currentUser.dateRegistered ? 
      new Date(currentUser.dateRegistered).toLocaleDateString() : '';
    
    // Show the modal
    const profileEditModal = document.getElementById('profileEditModal');
    profileEditModal.classList.add('active');
  }

// Add the form submission handler if it doesn't exist

const profileEditForm = document.getElementById('profileEditForm');
if (profileEditForm) {
  profileEditForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the current user
    const currentUser = window.currentUser;
    if (!currentUser) return;
    
    // Get the form values
    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const role = document.getElementById('userRole').value;
    
    // Basic validation
    if (!firstName || !lastName || !email) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Prepare the data for API
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      role
    };
    
    // Update using API
    fetch(`/api/users/${currentUser.userID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Failed to update profile');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Update localStorage for current session
        const updatedCurrentUser = {
          ...currentUser,
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          email: email,
          phone: phone,
          address: address,
          role: role
        };
        
        localStorage.setItem('etee_current_user', JSON.stringify(updatedCurrentUser));
        
        // Update the current user object
        window.currentUser = updatedCurrentUser;
        
        // Update the sidebar display
        document.getElementById('adminName').textContent = fullName;
        document.getElementById('adminEmail').textContent = email;
        document.getElementById('adminRole').textContent = role;
        
        // Close the modal
        const modal = document.getElementById('profileEditModal');
        modal.classList.remove('active');
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
      } else {
        showNotification(data.error || 'An error occurred', 'error');
      }
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      showNotification(error.message || 'Failed to update profile', 'error');
    });
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

// Delete sensor reading
function deleteSensorReading(readingId) {
  fetch(`/api/readings/${readingId}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadDashboardData();
      showNotification('Reading deleted successfully!', 'success');
    } else {
      showNotification('Failed to delete reading', 'error');
    }
  })
  .catch(error => {
    console.error('Error deleting reading:', error);
    showNotification('Failed to delete reading', 'error');
  });
}

// Delete manure log
function deleteManureLog(logId) {
  fetch(`/api/manure-logs/${logId}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
 
      showNotification('Manure log deleted successfully!', 'success');
    } else {
      showNotification('Failed to delete manure log', 'error');
    }
  })
  .catch(error => {
    console.error('Error deleting manure log:', error);
    showNotification('Failed to delete manure log', 'error');
  });
}

function generateReadingId(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function deleteSensorReading(readingId) {
  fetch(`/api/readings/${readingId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.error || 'Failed to delete reading');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      loadDashboardData();
      showNotification('Sensor reading deleted successfully!', 'success');
    } else {
      showNotification(data.error || 'Failed to delete reading', 'error');
    }
  })
  .catch(error => {
    showNotification(error.message || 'Failed to delete reading', 'error');
  });
}