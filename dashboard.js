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
      const ph = parseFloat(document.getElementById('ph').value);
      
      // Create new measurement object
      const newMeasurement = {
        id: Date.now(), // Unique identifier
        dateTime,
        timestamp: new Date().getTime(),
        temperature,
        humidity,
        co2,
        ammonia,
        ph
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
    
    // Update pH card
    const phValue = document.querySelector('.card:nth-child(2) .card-value');
    if (phValue) {
      phValue.textContent = measurement.ph.toFixed(2);
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
    
    // Update chart if present
    updateChartDisplay(chartDataSelector ? chartDataSelector.value : 'temperature');
  }
  
  // Function to add a new row to the activity table
  function updateActivityTable(measurement) {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;
    
    // Format date for display
    const date = new Date(measurement.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    // Create a new row for each measurement type
    const sensors = [
      { type: 'temperature', label: 'Temperature reading', value: `${measurement.temperature}°C` },
      { type: 'ph', label: 'pH level reading', value: measurement.ph.toFixed(2) },
      { type: 'humidity', label: 'Humidity reading', value: `${measurement.humidity}%` },
      { type: 'co2', label: 'CO₂ level reading', value: `${measurement.co2} ppm` },
      { type: 'ammonia', label: 'Ammonia level reading', value: `${measurement.ammonia} ppm` }
    ];
    
    // Add the most recent reading to the top
    const firstSensor = sensors[0];
    const newRow = document.createElement('tr');
    newRow.dataset.sensor = firstSensor.type;
    
    newRow.innerHTML = `
      <td>${formattedDate}</td>
      <td>${firstSensor.label}: ${firstSensor.value}</td>
      <td><span class="status completed">Completed</span></td>
      <td><button class="view-btn"><i class='bx bx-show'></i> View</button></td>
    `;
    
    // Insert at the beginning of the table
    if (tableBody.firstChild) {
      tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
      tableBody.appendChild(newRow);
    }
    
    // Remove excess rows if needed
    const maxRows = 5;
    while (tableBody.children.length > maxRows) {
      tableBody.removeChild(tableBody.lastChild);
    }
    
    // Apply current filter
    if (sensorSelector && sensorSelector.value !== 'all' && newRow.dataset.sensor !== sensorSelector.value) {
      newRow.style.display = 'none';
    }
  }
  
  // Function to update the chart display
  function updateChartDisplay(dataType) {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    if (!chartPlaceholder) return;
    
    let title, unit;
    switch(dataType) {
      case 'temperature':
        title = 'Temperature';
        unit = '°C';
        break;
      case 'ph':
        title = 'pH Level';
        unit = '';
        break;
      case 'humidity':
        title = 'Humidity';
        unit = '%';
        break;
      case 'co2':
        title = 'CO₂ Level';
        unit = 'ppm';
        break;
      case 'ammonia':
        title = 'Ammonia Level';
        unit = 'ppm';
        break;
      default:
        title = 'Temperature';
        unit = '°C';
    }
    
    // Update the chart placeholder text
    chartPlaceholder.innerHTML = `
      <i class='bx bx-line-chart'></i>
      <p>${title} data will be displayed here (${unit})</p>
    `;
    
    // In a real implementation, you would render the chart here
    // using a library like Chart.js or similar
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
      showNotification(`Viewing details for: ${activity}`, 'info');
    });
  });
});