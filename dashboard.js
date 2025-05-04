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
  if (!localStorage.getItem('active_coop')) {
    localStorage.setItem('active_coop', JSON.stringify(null));
  }
  

  // Check if there are existing coops
  const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
  if (coops.length === 0) {
    // Show chicken coop management section
    showChickenCoopManagement();
  } else {
    // Show water quality management section
    showWaterQualityManagement();
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

  function showWaterQualityManagement() {
    const dashboardSection = document.getElementById('dashboard');
    const coopSection = document.getElementById('chickenCoopManagement');
    const waterSection = document.getElementById('waterQualityManagement');
    
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (coopSection) coopSection.style.display = 'none';
    if (waterSection) waterSection.style.display = 'block';
    
    loadDashboardData();
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
      showWaterQualityManagement();
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
      setTimeout(() => form.reset(), 300);
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
      
      closeModal(document.getElementById('addCoopModal'));
      loadCoops();
      showNotification('Chicken coop added successfully!', 'success');
      
      // If this was the first coop, switch to water quality management
      if (coops.length === 1) {
        setTimeout(() => {
          showWaterQualityManagement();
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
  }

  // Load dashboard data
  function loadDashboardData() {
    const measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
    
    if (measurements.length === 0) {
      setZeroValues();
    } else {
      // Sort measurements by timestamp descending
      measurements.sort((a, b) => b.timestamp - a.timestamp);
      
      // Update dashboard with most recent measurement
      updateDashboardData(measurements[0]);
      
      // Clear and repopulate the table
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '';
        measurements.forEach(measurement => {
          updateActivityTable(measurement);
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
    const formattedDateTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    currentDateTimeField.value = formattedDateTime;
    
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
      
      const dateTime = currentDateTimeField.value;
      const temperature = parseFloat(document.getElementById('temperature').value);
      const humidity = parseFloat(document.getElementById('humidity').value);
      const co2 = parseInt(document.getElementById('co2').value);
      const ammonia = parseFloat(document.getElementById('ammonia').value);
      
      const newMeasurement = {
        id: Date.now(),
        dateTime,
        timestamp: new Date().getTime(),
        temperature,
        humidity,
        co2,
        ammonia,
      };
      
      // Save measurement
      const measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
      measurements.push(newMeasurement);
      localStorage.setItem('etee_measurements', JSON.stringify(measurements));
      
      const submitBtn = dataEntryForm.querySelector('.submit-button');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
        submitBtn.classList.add('success-animation');
      }
      
      updateDashboardData(newMeasurement);
      
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Data';
          submitBtn.classList.remove('success-animation');
        }
        closeModal(dataEntryModal);
        showNotification('New measurement data added successfully!', 'success');
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
        isNormal: isNormal.temperature
      },
      { 
        type: 'humidity', 
        label: 'Humidity reading', 
        value: `${measurement.humidity}%`,
        isNormal: isNormal.humidity
      },
      { 
        type: 'co2', 
        label: 'CO₂ level reading', 
        value: `${measurement.co2} ppm`,
        isNormal: isNormal.co2
      },
      { 
        type: 'ammonia', 
        label: 'Ammonia level reading', 
        value: `${measurement.ammonia} ppm`,
        isNormal: isNormal.ammonia
      }
    ];
    
    sensors.forEach(sensor => {
      const newRow = document.createElement('tr');
      newRow.dataset.sensor = sensor.type;
      
      newRow.innerHTML = `
        <td>${formattedDate} • ${formattedTime}</td>
        <td>${sensor.label}</td>
        <td>${sensor.value}</td>
        <td><span class="status ${sensor.isNormal ? 'normal' : 'abnormal'}">${sensor.isNormal ? 'Normal' : 'Abnormal'}</span></td>
        <td><button class="view-btn"><i class='bx bx-show'></i> View</button></td>
      `;
      
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
          const activity = row.cells[1].textContent;
          const value = row.cells[2].textContent;
          const status = row.cells[3].textContent;
          
          showDetailModal(date, activity, value, status, row.dataset.sensor);
        });
      }
    });
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
  function showDetailModal(date, activity, value, status, sensorType) {
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
    modalTitle.innerHTML = `<i class='bx ${icon}'></i> ${activity} Details`;
    
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
      { label: 'Date & Time', value: date },
      { label: 'Device ID', value: value },
      { label: 'Status', value: status, isStatus: true, type: status.toLowerCase().includes('normal') ? 'normal' : 'abnormal' },
      { label: 'Reading ID', value: `SEN-${sensorType.substring(0, 3).toUpperCase()}-001` },
      { label: 'Location', value: 'Main Tank' }
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