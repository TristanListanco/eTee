document.addEventListener("DOMContentLoaded", () => {
  // Original navigation functionality
  const navLinks = document.querySelectorAll(".nav a");
  const sections = document.querySelectorAll(".page-section");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Hide all sections
      sections.forEach(section => {
        section.classList.remove("active");
      });

      // Get the target section from href and show it
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
  
  // Close mobile sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        sidebar && 
        !sidebar.contains(e.target) && 
        sidebarToggle && 
        e.target !== sidebarToggle) {
      sidebar.classList.remove('active');
    }
  });

  // ===== Sensor Dropdown Filtering =====
  const sensorSelector = document.getElementById('sensorSelector');
  const tableRows = document.querySelectorAll('tbody tr');
  
  if (sensorSelector) {
    sensorSelector.addEventListener('change', () => {
      const selectedSensor = sensorSelector.value;
      
      tableRows.forEach(row => {
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
      // This would normally update the chart data
      // For now, we'll just show a notification
      showNotification(`Chart updated to show ${chartDataSelector.options[chartDataSelector.selectedIndex].text} data`, 'info');
      updateChartDisplay(chartDataSelector.value);
    });
  }

  // ===== Data Entry Functionality =====
  
  // Get elements
  const addDataBtn = document.getElementById('addDataBtn');
  const dataEntryModal = document.getElementById('dataEntryModal');
  const closeBtn = document.querySelector('.close-button');
  const cancelBtn = document.querySelector('.cancel-button');
  const dataEntryForm = document.getElementById('dataEntryForm');
  const currentDateTimeField = document.getElementById('currentDateTime');
  
  // Initialize measurements data storage if it doesn't exist
  if (!localStorage.getItem('etee_measurements')) {
    localStorage.setItem('etee_measurements', JSON.stringify([]));
  }
  
  // Function to open modal
  function openModal() {
    // Set current date and time
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
    
    // Display the modal
    dataEntryModal.classList.add('active');
    
    // Focus on the first input
    setTimeout(() => {
      const tempInput = document.getElementById('temperature');
      if (tempInput) tempInput.focus();
    }, 300);
  }
  
  // Function to close modal
  function closeModal() {
    dataEntryModal.classList.remove('active');
    setTimeout(() => {
      if (dataEntryForm) dataEntryForm.reset();
    }, 300);
  }
  
  // Add event listeners for data entry modal
  if (addDataBtn) {
    addDataBtn.addEventListener('click', openModal);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === dataEntryModal) {
      closeModal();
    }
  });
  
  // Form submission handler
  if (dataEntryForm) {
    dataEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const dateTime = currentDateTimeField.value;
      const temperature = parseFloat(document.getElementById('temperature').value);
      const humidity = parseFloat(document.getElementById('humidity').value);
      const co2 = parseInt(document.getElementById('co2').value);
      const ammonia = parseFloat(document.getElementById('ammonia').value);
      
      // Create new measurement object
      const newMeasurement = {
        id: Date.now(), // Unique identifier
        dateTime,
        timestamp: new Date().getTime(),
        temperature,
        humidity,
        co2,
        ammonia,
      };
      
      // Save to local storage
      saveMeasurement(newMeasurement);
      
      // Show success animation
      const submitBtn = document.querySelector('.submit-button');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
        submitBtn.classList.add('success-animation');
      }
      
      // Update dashboard with new data
      updateDashboardData(newMeasurement);
      
      // Reset and close after animation
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Data';
          submitBtn.classList.remove('success-animation');
        }
        closeModal();
        showNotification('New measurement data added successfully!', 'success');
      }, 1500);
    });
  }
  
  // Function to save measurement to local storage
  function saveMeasurement(measurement) {
    // Get existing data
    const measurements = JSON.parse(localStorage.getItem('etee_measurements')) || [];
    
    // Add new measurement
    measurements.push(measurement);
    
    // Save back to localStorage
    localStorage.setItem('etee_measurements', JSON.stringify(measurements));
  }
  
  // Function to update dashboard with new data
  function updateDashboardData(measurement) {
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
    
    // Format date and time for display
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
    
    // Define normal ranges for each parameter
    const normalRanges = {
      temperature: { min: 26.0, max: 29.0 },
      humidity: { min: 50, max: 70 },
      co2: { min: 350, max: 500 },
      ammonia: { min: 0, max: 0.25 }
    };
    
    // Check if each value is within normal range
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
    
    // Create a new row for each measurement type
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
    
    // Add the most recent reading to the top
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
      
      // Insert at the beginning of the table
      if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
      } else {
        tableBody.appendChild(newRow);
      }
      
      // Apply current filter
      const sensorSelector = document.getElementById('sensorSelector');
      if (sensorSelector && sensorSelector.value !== 'all' && newRow.dataset.sensor !== sensorSelector.value) {
        newRow.style.display = 'none';
      }
    });
    
    // Remove excess rows if needed (keep 5 per sensor type)
    const sensorTypes = ['temperature', 'humidity', 'co2', 'ammonia'];
    
    sensorTypes.forEach(type => {
      const rows = tableBody.querySelectorAll(`tr[data-sensor="${type}"]`);
      if (rows.length > 5) {
        for (let i = 5; i < rows.length; i++) {
          tableBody.removeChild(rows[i]);
        }
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
      { label: 'Reading', value: value },
      { label: 'Status', value: status, isStatus: true, type: status.toLowerCase().includes('normal') ? 'normal' : 'abnormal' },
      { label: 'Sensor ID', value: `SEN-${sensorType.substring(0, 3).toUpperCase()}-001` },
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
    
    // Add actions buttons
    const actionsSection = document.createElement('div');
    actionsSection.className = 'detail-actions';
    
    const exportButton = document.createElement('button');
    exportButton.className = 'action-button small';
    
    modalBody.appendChild(actionsSection);
    
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
    // Check if notification container exists, create if not
    let notifContainer = document.querySelector('.notification-container');
    if (!notifContainer) {
      notifContainer = document.createElement('div');
      notifContainer.className = 'notification-container';
      document.body.appendChild(notifContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Determine title based on type
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
    
    // Create icon based on type
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'bx bx-check-circle' : 
                     type === 'error' ? 'bx bx-error-circle' : 
                     type === 'warning' ? 'bx bx-error' : 'bx bx-info-circle';
    
    // Create notification content
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
    
    // Create close button
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
    
    // Assemble notification
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    // Add to container
    notifContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
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
  
  // Function to load and display recent measurements on page load
  function loadRecentMeasurements() {
    const measurements = JSON.parse(localStorage.getItem('etee_measurements')) || [];
    
    // Sort by timestamp descending (newest first)
    measurements.sort((a, b) => b.timestamp - a.timestamp);
    
    // If there are measurements, update dashboard with most recent
    if (measurements.length > 0) {
      updateDashboardData(measurements[0]);
    }
  }
  
  // Enable escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dataEntryModal && dataEntryModal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Initialize dashboard data
  loadRecentMeasurements();
  
  // Add event listeners to view buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const activity = row.cells[1].textContent;
    });
  });

  // ===== Profile Edit Functionality =====
  
  // Profile Edit Elements
  const adminProfile = document.getElementById('adminProfile');
  const profileEditModal = document.getElementById('profileEditModal');
  const profileEditForm = document.getElementById('profileEditForm');
  const profileImageInput = document.getElementById('profileImage');
  const profilePreview = document.getElementById('profilePreview');
  const adminImage = document.getElementById('adminImage');
  
  // Initialize user profile data
  const userProfileData = {
    name: "Dja-ver Q. Hassan",
    email: "etee@gmail.com",
    phone: "+1234567890",
    address: "123 Main Street, Anytown, USA",
    dateRegistered: "January 1, 2024",
    userRole: "Admin",
    userID: "USR-001",
    profileImage: "admin.png"
  };
  
  // Save to localStorage if not exists
  if (!localStorage.getItem('userProfile')) {
    localStorage.setItem('userProfile', JSON.stringify(userProfileData));
  }
  
  // Function to load profile data
  function loadProfileData() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      // Update sidebar display
      document.getElementById('adminName').textContent = savedProfile.name;
      document.getElementById('adminRole').textContent = savedProfile.userRole;
      document.getElementById('adminEmail').textContent = savedProfile.email;
      document.getElementById('adminEmail').href = `mailto:${savedProfile.email}`;
      
      // Update admin image if it exists
      if (savedProfile.profileImage) {
        adminImage.src = savedProfile.profileImage;
      }
    }
  }
  
  // Open profile edit modal
  function openProfileModal() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    // Populate form with current data
    document.getElementById('profileName').value = savedProfile.name;
    document.getElementById('profileEmail').value = savedProfile.email;
    document.getElementById('profilePhone').value = savedProfile.phone;
    document.getElementById('profileAddress').value = savedProfile.address;
    document.getElementById('dateRegistered').value = savedProfile.dateRegistered;
    document.getElementById('userRole').value = savedProfile.userRole;
    document.getElementById('userID').value = savedProfile.userID;
    
    // Set profile image preview
    profilePreview.src = savedProfile.profileImage || 'admin.png';
    
    // Show modal
    profileEditModal.classList.add('active');
  }
  
  // Close profile edit modal
  function closeProfileModal() {
    profileEditModal.classList.remove('active');
  }
  
  // Handle profile image change
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
  
  // Handle profile form submission
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
    
    // Update UI
    loadProfileData();
    
    // Show success animation
    const submitBtn = profileEditForm.querySelector('.submit-button');
    submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
    submitBtn.classList.add('success-animation');
    
    // Close modal after animation
    setTimeout(() => {
      submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Changes';
      submitBtn.classList.remove('success-animation');
      closeProfileModal();
      showNotification('Profile updated successfully!', 'success');
    }, 1500);
  });
  
  // Event Listeners
  const editOverlay = document.querySelector('.edit-overlay');
  editOverlay.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling to parent
    openProfileModal();
  });
  
  // Close button event listener
  const closeButton = profileEditModal.querySelector('.close-button');
  closeButton.addEventListener('click', closeProfileModal);
  
  // Cancel button event listener
  const cancelButton = profileEditModal.querySelector('.cancel-button');
  cancelButton.addEventListener('click', closeProfileModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === profileEditModal) {
      closeProfileModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileEditModal.classList.contains('active')) {
      closeProfileModal();
    }
  });
  
  // Load profile data on page load
  loadProfileData();
});

// Add detail modal styles
const detailStyles = `
.detail-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-label {
  font-weight: 500;
  width: 30%;
  color: var(--text-light);
}

.detail-value {
  width: 70%;
  color: var(--text-color);
}

.chart-placeholder.mini {
  height: 150px;
}

.action-button.small {
  padding: 8px 16px;
  font-size: 0.8rem;
}

.action-button.secondary {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.action-button.secondary:hover {
  background-color: var(--bg-light);
  border-color: var(--text-color);
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = detailStyles;
document.head.appendChild(styleSheet);

// Initialize table view events
document.addEventListener('DOMContentLoaded', () => {
  // Add click events to existing view buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    if (!btn.hasAttribute('data-listener')) {
      btn.setAttribute('data-listener', 'true');
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const date = row.cells[0].textContent;
        const activity = row.cells[1].textContent;
        const value = row.cells[2].textContent;
        const status = row.querySelector('.status').textContent;
        
        showDetailModal(date, activity, value, status, row.dataset.sensor);
      });
    }
  });
});