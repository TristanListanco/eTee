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

  // ===== Dashboard Specific Functionality =====
  
  // Function to set zero values
  function setZeroValues() {
    // Set zero values for cards
    const temperatureValue = document.querySelector('.card:nth-child(1) .card-value');
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
    
    // Set empty state for table
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

  // ===== Sensor Dropdown Filtering =====
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

  // ===== Data Entry Functionality =====
  const addDataBtn = document.getElementById('addDataBtn');
  const dataEntryModal = document.getElementById('dataEntryModal');
  const dataEntryForm = document.getElementById('dataEntryForm');
  const currentDateTimeField = document.getElementById('currentDateTime');
  
  // Function to open data entry modal
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
  
  // Function to close data entry modal
  function closeDataModal() {
    dataEntryModal.classList.remove('active');
    setTimeout(() => {
      if (dataEntryForm) dataEntryForm.reset();
    }, 300);
  }

  // Add event listeners for data entry modal
  if (addDataBtn) {
    addDataBtn.addEventListener('click', openDataModal);
  }
  
  // Close button event listeners for all modals
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
  
  // Data entry form submission handler
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
        closeDataModal();
        showNotification('New measurement data added successfully!', 'success');
      }, 1500);
    });
  }
  
  // Function to update dashboard with new data
  function updateDashboardData(measurement) {
    // Remove empty state row if it exists
    const emptyStateRow = document.getElementById('emptyStateRow');
    if (emptyStateRow) {
      emptyStateRow.remove();
    }

    // Update temperature card
    const temperatureValue = document.querySelector('.card:nth-child(1) .card-value');
    if (temperatureValue) {
      temperatureValue.textContent = `${measurement.temperature}°C`;
    }
    
    // Update humidity card
    const humidityValue = document.querySelector('.humidity-value');
    if (humidityValue) {
      humidityValue.textContent = `${measurement.humidity}%`;
    }
    
    // Update CO2 card
    const co2Value = document.querySelector('.co2-value');
    if (co2Value) {
      co2Value.textContent = `${measurement.co2} ppm`;
    }
    
    // Update ammonia card
    const ammoniaValue = document.querySelector('.ammonia-value');
    if (ammoniaValue) {
      ammoniaValue.textContent = `${measurement.ammonia} ppm`;
    }
    
    // Add record to table
    updateActivityTable(measurement);
  }
  
  // Function to update activity table with new data
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
    
    // Add click event listeners to new view buttons
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

  // Function to show a modal with detailed information about a reading
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
  
  // ===== Profile Edit Functionality =====
  
  // Profile Edit Elements
  const profileEditModal = document.getElementById('profileEditModal');
  const profileEditForm = document.getElementById('profileEditForm');
  const profileImageInput = document.getElementById('profileImage');
  const profilePreview = document.getElementById('profilePreview');
  
  // Function to open profile edit modal
  function openProfileModal() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    // Populate form with current data
    document.getElementById('profileName').value = savedProfile ? savedProfile.name : 'Dja-ver Q. Hassan';
    document.getElementById('profileEmail').value = savedProfile ? savedProfile.email : 'etee@gmail.com';
    document.getElementById('profilePhone').value = savedProfile ? savedProfile.phone : '+1234567890';
    document.getElementById('profileAddress').value = savedProfile ? savedProfile.address : '123 Main Street, Anytown, USA';
    document.getElementById('dateRegistered').value = savedProfile ? savedProfile.dateRegistered : 'January 1, 2024';
    document.getElementById('userRole').value = savedProfile ? savedProfile.userRole : 'Admin';
    document.getElementById('userID').value = savedProfile ? savedProfile.userID : 'USR-001';
    
    // Set profile image preview
    profilePreview.src = savedProfile && savedProfile.profileImage ? savedProfile.profileImage : 'admin.png';
    
    // Show modal
    profileEditModal.classList.add('active');
  }
  
  // Handle profile image change
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
  
  // Handle profile form submission
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
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
      
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update sidebar profile using the sidebar component
      sidebar.setProfile({
        name: updatedProfile.name,
        role: updatedProfile.userRole,
        email: updatedProfile.email,
        image: updatedProfile.profileImage
      });
      
      // Show success animation
      const submitBtn = profileEditForm.querySelector('.submit-button');
      submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
      submitBtn.classList.add('success-animation');
      
      // Close modal after animation
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Changes';
        submitBtn.classList.remove('success-animation');
        profileEditModal.classList.remove('active');
        showNotification('Profile updated successfully!', 'success');
      }, 1500);
    });
  }
  
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

  // Chart update function (placeholder)
  function updateChartDisplay(dataType) {
    console.log(`Updating chart to display ${dataType} data`);
    // Implement chart update logic here
  }
  
  // Initialize dashboard with zero values
  setZeroValues();
});