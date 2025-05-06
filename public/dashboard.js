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
      // Set the global currentCoopId variable
      currentCoopId = coopId;
      
      // Fetch the coop details from the database
      fetch(`/api/coops/${coopId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch coop details');
          }
          return response.json();
        })
        .then(coop => {
          // Update the span with ID "coopLocationTitle" with the coop location
          const coopLocationTitle = document.getElementById('coopLocationTitle');
          if (coopLocationTitle) {
            coopLocationTitle.textContent = `${coop.Location} Chicken Coop`;
          }
        })
        .catch(error => {
          console.error('Error fetching coop details:', error);
        });
    }
    
    loadDashboardData();

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
          <span>Count: ${coop.capacity} Chicken/s</span>
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
              <td colspan="5" class="empty-state-cell">
                <div class="empty-state-container">
                  <i class='bx bx-database' style="font-size: 2.5rem; color: #c0c0c0; margin-bottom: 1rem;"></i>
                  <p>No sensor readings available. Click "Add Data" to record measurements.</p>
                </div>
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
              // Log the readings to verify the structure
              console.log('All readings:', allReadings);
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
    
    // Format timestamp for MySQL
    let formattedTimestamp = dateTime;
    if (dateTime.includes('T')) {
      formattedTimestamp = dateTime.replace('T', ' ').split('.')[0];
    }
    
    // Save sensor reading data
    const readingData = {
      coopId: currentCoopId,
      temperature,
      humidity,
      co2Level: co2,
      ammoniaLevel: ammonia,
      timestamp: formattedTimestamp
    };
    
    // Save the sensor reading
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
    .then(data => {
      // Successfully saved the reading
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


// Initialize the delete confirmation modal events
function initDeleteConfirmationModal() {
  const modal = document.getElementById('deleteConfirmationModal');
  const closeButton = modal.querySelector('.close-button');
  const cancelButton = modal.querySelector('.cancel-button');
  const confirmButton = document.getElementById('confirmDeleteBtn');
  
  // Close modal when clicking the X
  closeButton.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  // Close modal when clicking Cancel
  cancelButton.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  // Handle delete confirmation
  confirmButton.addEventListener('click', () => {
    const readingId = document.getElementById('deleteReadingId').value;
    
    // Call the delete function
    deleteSensorReading(readingId);
    
    // Close the modal
    modal.classList.remove('active');
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
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
  
  
  
  function updateActivityTable(readings) {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;
    
    // Clear existing rows except the empty state row
    const emptyStateRow = document.getElementById('emptyStateRow');
    if (emptyStateRow) {
      emptyStateRow.style.display = 'none';
    } else {
      tableBody.innerHTML = '';
    }
    
    readings.forEach(reading => {
      // Format date and time
      const timestamp = new Date(reading.TimeStamp);
      const formattedDate = timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const formattedTime = timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Create a new row
      const newRow = document.createElement('tr');
      
      // IMPORTANT: Use the actual ReadingID from the database
      newRow.dataset.readingId = reading.ReadingID;
      
      // Check if the reading is normal based on the sensor type
      const isTemperatureNormal = reading.Temperature >= 26.0 && reading.Temperature <= 29.0;
      const isHumidityNormal = reading.Humidity >= 50 && reading.Humidity <= 70;
      const isCO2Normal = reading.CO2Level >= 350 && reading.CO2Level <= 500;
      const isAmmoniaNormal = reading.AmmoniaLevel >= 0 && reading.AmmoniaLevel <= 0.25;
      
      // Determine which reading to display based on what's available
      let value, isNormal;
      if (reading.Temperature !== null && reading.Temperature !== undefined) {
        value = `${reading.Temperature}°C`;
        isNormal = isTemperatureNormal;
      } else if (reading.Humidity !== null && reading.Humidity !== undefined) {
        value = `${reading.Humidity}%`;
        isNormal = isHumidityNormal;
      } else if (reading.CO2Level !== null && reading.CO2Level !== undefined) {
        value = `${reading.CO2Level} ppm`;
        isNormal = isCO2Normal;
      } else if (reading.AmmoniaLevel !== null && reading.AmmoniaLevel !== undefined) {
        value = `${reading.AmmoniaLevel} ppm`;
        isNormal = isAmmoniaNormal;
      } else {
        value = 'N/A';
        isNormal = true;
      }
      
      newRow.innerHTML = `
        <td>${formattedDate} • ${formattedTime}</td>
        <td>${reading.ReadingID}</td>
        <td>${value}</td>
        <td><span class="status ${isNormal ? 'normal' : 'abnormal'}">${isNormal ? 'Normal' : 'Abnormal'}</span></td>
        <td style="text-align: center;">
          <i class='bx bx-trash delete-icon' title='Delete'></i>
        </td>
      `;
      
      // Add event listener to delete icon
      const deleteIcon = newRow.querySelector('.delete-icon');
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        // Pass the actual ReadingID from the database to the delete confirmation modal
        console.log('Clicked delete for reading ID:', reading.ReadingID);
        showDeleteConfirmationModal(reading.ReadingID);
      });
      
      // Check current chart filter
      const sensorSelector = document.getElementById('sensorSelector');
      if (sensorSelector) {
        const selectedSensor = sensorSelector.value;
        if (selectedSensor !== 'all') {
          const hasTemperature = reading.Temperature !== null && reading.Temperature !== undefined;
          const hasHumidity = reading.Humidity !== null && reading.Humidity !== undefined;
          const hasCO2 = reading.CO2Level !== null && reading.CO2Level !== undefined;
          const hasAmmonia = reading.AmmoniaLevel !== null && reading.AmmoniaLevel !== undefined;
          
          if ((selectedSensor === 'temperature' && !hasTemperature) ||
              (selectedSensor === 'humidity' && !hasHumidity) ||
              (selectedSensor === 'co2' && !hasCO2) ||
              (selectedSensor === 'ammonia' && !hasAmmonia)) {
            newRow.style.display = 'none';
          }
        }
      }
      
      tableBody.appendChild(newRow);
    });
  }

  function showDeleteConfirmationModal(readingId) {
    console.log('Showing delete confirmation for ID:', readingId);
    
    // Get the modal (create it if it doesn't exist)
    let modal = document.getElementById('deleteConfirmationModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'deleteConfirmationModal';
      modal.className = 'modal';
      
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class='bx bx-trash'></i> Delete Sensor Reading</h3>
            <button class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this sensor reading?</p>
            <p style="color: var(--danger-color); font-size: 0.9rem;">This action cannot be undone.</p>
            
            <input type="hidden" id="deleteReadingId" value="">
            
            <div class="form-actions">
              <button type="button" class="cancel-button">Cancel</button>
              <button type="button" id="confirmDeleteBtn" class="submit-button" style="background-color: var(--danger-color);">
                <i class='bx bx-trash'></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Initialize the new modal
      initDeleteConfirmationModal();
    }
    
    // Store the reading ID and show the modal
    document.getElementById('deleteReadingId').value = readingId;
    modal.classList.add('active');
  }
  function deleteSensorReading(readingId) {
    if (!readingId) {
      console.error('No reading ID provided for deletion');
      showNotification('Error: No reading ID provided', 'error');
      return;
    }
    
    console.log('Deleting reading with ID:', readingId);
    
    fetch(`/api/readings/${readingId}`, {
      method: 'DELETE'
    })
    .then(response => {
      console.log('Delete response status:', response.status);
      
      // Parse the JSON response
      return response.json().then(data => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete reading');
        }
        return data;
      });
    })
    .then(data => {
      console.log('Delete response data:', data);
      
      if (data.success) {
        // Close the modal if it's still open
        const modal = document.getElementById('deleteConfirmationModal');
        if (modal) modal.classList.remove('active');
        
        // Reload dashboard data to refresh the table
        loadDashboardData();
        showNotification('Sensor reading deleted successfully!', 'success');
      } else {
        showNotification(data.error || 'Failed to delete reading', 'error');
      }
    })
    .catch(error => {
      console.error('Error deleting reading:', error);
      showNotification(error.message || 'Failed to delete reading', 'error');
    });
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