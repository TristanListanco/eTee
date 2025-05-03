document.addEventListener("DOMContentLoaded", () => {
    // Initialize sidebar component
    const sidebar = new Sidebar({
      containerId: 'sidebar',
      companyName: 'ETee',
      navItems: [
        {
          text: 'Chicken Coops',
          icon: 'bx bxs-building-house',
          href: '#coops',
          active: true
        },
        {
          text: 'Dashboard',
          icon: 'bx bxs-dashboard',
          href: '#dashboard',
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
        name: "Dja-ver Q. Hassan",
        role: "Admin",
        email: "etee@gmail.com",
        image: "admin.png"
      },
      onProfileEdit: function() {
        openProfileModal();
      },
      onNavItemClick: function(e, item) {
        e.preventDefault(); // Prevent default for all nav items
        
        if (item.href === '#sign-out') {
          if (confirm('Are you sure you want to sign out?')) {
            window.location.href = 'signin.html';
          }
        } else if (item.href === '#coops') {
          showSection('coopSetup');
          updateSidebarNavigation('coopSetup');
        } else if (item.href === '#dashboard') {
          const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
          if (coops.length === 0) {
            showNotification('Please add a chicken coop first to access the dashboard.', 'warning');
            return;
          }
          showSection('dashboard');
          updateSidebarNavigation('dashboard');
        }
      }
    });
  
    // Initialize coop data storage
    if (!localStorage.getItem('etee_coops')) {
      localStorage.setItem('etee_coops', JSON.stringify([]));
    }
  
    // Get DOM elements
    const addCoopBtn = document.getElementById('addCoopBtn');
    const addCoopModal = document.getElementById('addCoopModal');
    const addCoopForm = document.getElementById('addCoopForm');
    const emptyState = document.getElementById('emptyState');
    const coopsGrid = document.getElementById('coopsGrid');
    const emptyStateBtn = document.querySelector('.empty-state-btn');
  
    // Show section
    function showSection(sectionId) {
      const sections = document.querySelectorAll('.page-section');
      sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
      });
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        if (sectionId === 'dashboard') {
          // When dashboard is shown, load recent measurements
          loadDashboardData();
        }
      }
    }
    
    // Update sidebar navigation active state
    function updateSidebarNavigation(sectionId) {
      const navItems = document.querySelectorAll('.nav li');
      navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('a');
        if (link) {
          if ((sectionId === 'coopSetup' && link.getAttribute('href') === '#coops') ||
              (sectionId === 'dashboard' && link.getAttribute('href') === '#dashboard')) {
            item.classList.add('active');
          }
        }
      });
    }
  
    // Load and display coops
    function loadCoops() {
      const coops = JSON.parse(localStorage.getItem('etee_coops') || '[]');
      
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
          <i class='bx bxs-dashboard'></i> View Dashboard
        </button>
      `;
      
      // Add event listeners
      const viewDashboardBtn = card.querySelector('.view-dashboard-btn');
      viewDashboardBtn.addEventListener('click', () => {
        showSection('dashboard');
        updateSidebarNavigation('dashboard');
      });
      
      const deleteBtn = card.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this chicken coop?')) {
          deleteCoop(coop.id);
        }
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
    }
  
    // Open add coop modal
    function openAddCoopModal() {
      addCoopModal.classList.add('active');
    }
  
    // Close modal
    function closeModal(modal) {
      modal.classList.remove('active');
      if (modal.querySelector('form')) {
        modal.querySelector('form').reset();
      }
    }
  
    // Event listeners
    addCoopBtn.addEventListener('click', openAddCoopModal);
    emptyStateBtn.addEventListener('click', openAddCoopModal);
  
    // Form submission
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
      
      closeModal(addCoopModal);
      loadCoops();
      showNotification('Chicken coop added successfully!', 'success');
    });
  
    // Close buttons
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });
  
    // Cancel buttons
    document.querySelectorAll('.cancel-button').forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });
  
    // Close modal on outside click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        closeModal(e.target);
      }
    });
  
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal.active');
        activeModals.forEach(modal => {
          closeModal(modal);
        });
      }
    });
  
    // Notification system
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
  
    // Dashboard functionality
    const dataEntryForm = document.getElementById('dataEntryForm');
    const addDataBtn = document.getElementById('addDataBtn');
    const currentDateTimeField = document.getElementById('currentDateTime');
    const dataEntryModal = document.getElementById('dataEntryModal');
    
    // Initialize measurements data storage
    if (!localStorage.getItem('etee_measurements')) {
      localStorage.setItem('etee_measurements', JSON.stringify([]));
    }
  
    // Add data button click handler
    if (addDataBtn) {
      addDataBtn.addEventListener('click', () => {
        openDataModal();
      });
    }
  
    // Open data entry modal
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
  
    // Data entry form submission
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
        
        saveMeasurement(newMeasurement);
        
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
  
    // Save measurement to localStorage
    function saveMeasurement(measurement) {
      const measurements = JSON.parse(localStorage.getItem('etee_measurements')) || [];
      measurements.push(measurement);
      localStorage.setItem('etee_measurements', JSON.stringify(measurements));
    }
  
    // Update dashboard with new data
    function updateDashboardData(measurement) {
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
  
    // Update activity table with new data
    function updateActivityTable(measurement) {
      const tableBody = document.getElementById('sensorReadingsBody');
      if (!tableBody) return;
      
      // Remove empty state row if it exists
      const emptyStateRow = document.getElementById('emptyStateRow');
      if (emptyStateRow) {
        emptyStateRow.remove();
      }
      
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
    }
  
    // Sensor selector filter
    const sensorSelector = document.getElementById('sensorSelector');
    
    if (sensorSelector) {
      sensorSelector.addEventListener('change', () => {
        const selectedSensor = sensorSelector.value;
        const allRows = document.querySelectorAll('#sensorReadingsBody tr:not(#emptyStateRow)');
        
        allRows.forEach(row => {
          if (selectedSensor === 'all' || row.dataset.sensor === selectedSensor) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }
  
    // Load dashboard data
    function loadDashboardData() {
      const measurements = JSON.parse(localStorage.getItem('etee_measurements') || '[]');
      
      if (measurements.length === 0) {
        // Reset card values to zero
        const temperatureValue = document.querySelector('.temperature-value');
        if (temperatureValue) temperatureValue.textContent = '0°C';
        
        const humidityValue = document.querySelector('.humidity-value');
        if (humidityValue) humidityValue.textContent = '0%';
        
        const co2Value = document.querySelector('.co2-value');
        if (co2Value) co2Value.textContent = '0 ppm';
        
        const ammoniaValue = document.querySelector('.ammonia-value');
        if (ammoniaValue) ammoniaValue.textContent = '0 ppm';
        
        // Show empty state in table
        const tableBody = document.getElementById('sensorReadingsBody');
        if (tableBody && !document.getElementById('emptyStateRow')) {
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
        measurements.sort((a, b) => b.timestamp - a.timestamp);
        
        // Update dashboard with most recent measurement
        updateDashboardData(measurements[0]);
        
        // Clear existing table rows
        const tableBody = document.getElementById('sensorReadingsBody');
        if (tableBody) {
          tableBody.innerHTML = '';
        }
        
        // Load all measurements into the table
        measurements.forEach(measurement => {
          updateActivityTable(measurement);
        });
      }
    }
  
    // Profile Edit Functionality
    const profileEditModal = document.getElementById('profileEditModal');
    const profileEditForm = document.getElementById('profileEditForm');
    const profileImageInput = document.getElementById('profileImage');
    const profilePreview = document.getElementById('profilePreview');
    
    // Function to open profile edit modal
    function openProfileModal() {
      const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
      
      // Populate form with current data
      if (savedProfile) {
        document.getElementById('profileName').value = savedProfile.name || 'Dja-ver Q. Hassan';
        document.getElementById('profileEmail').value = savedProfile.email || 'etee@gmail.com';
        document.getElementById('profilePhone').value = savedProfile.phone || '+1234567890';
        document.getElementById('profileAddress').value = savedProfile.address || '123 Main Street, Anytown, USA';
        document.getElementById('dateRegistered').value = savedProfile.dateRegistered || 'January 1, 2024';
        document.getElementById('userRole').value = savedProfile.role || 'Admin';
        document.getElementById('userID').value = savedProfile.userID || 'USR-001';
        
        if (savedProfile.profileImage) {
          profilePreview.src = savedProfile.profileImage;
        }
      }
      
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
          role: document.getElementById('userRole').value,
          userID: document.getElementById('userID').value,
          profileImage: profilePreview.src
        };
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // Update sidebar profile
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          const adminName = sidebar.querySelector('#adminName');
          const adminRole = sidebar.querySelector('#adminRole');
          const adminEmail = sidebar.querySelector('#adminEmail');
          const adminImage = sidebar.querySelector('#adminImage');
          
          if (adminName) adminName.textContent = updatedProfile.name;
          if (adminRole) adminRole.textContent = updatedProfile.role;
          if (adminEmail) adminEmail.textContent = updatedProfile.email;
          if (adminImage) adminImage.src = updatedProfile.profileImage;
        }
        
        // Show success animation
        const submitBtn = profileEditForm.querySelector('.submit-button');
        submitBtn.innerHTML = '<i class="bx bx-check"></i> Saved';
        submitBtn.classList.add('success-animation');
        
        // Close modal after animation
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="bx bx-save"></i> Save Changes';
          submitBtn.classList.remove('success-animation');
          closeModal(profileEditModal);
          showNotification('Profile updated successfully!', 'success');
        }, 1500);
      });
    }
  
    // Initialize the page
    loadCoops();
  });