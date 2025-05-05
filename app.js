// app.js - Main application functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already authenticated
    const currentUser = localStorage.getItem('etee_current_user');
    if (currentUser && window.location.pathname.includes('signin.html')) {
      // Redirect to dashboard if already signed in
      window.location.href = 'Dashboard.html';
      return;
    }
  
    // Setup form submission handlers for authentication
    setupAuthForms();
    
    // If on dashboard or other authenticated pages, initialize those components
    if (window.location.pathname.includes('Dashboard.html')) {
      initializeDashboard();
    }
  });
  
  // Authentication form setup
  function setupAuthForms() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (signinForm) {
      signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        // Basic validation
        if (email === '' || password === '') {
          showError('Please fill in all fields');
          return;
        }
        
        // Call API to authenticate user
        signIn(email, password);
      });
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('register-first-name').value.trim();
        const lastName = document.getElementById('register-last-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const address = document.getElementById('register-address').value.trim();
        const roleSelect = document.getElementById('register-role');
        const role = roleSelect.value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        // Basic validation
        if (firstName === '' || lastName === '' || email === '' || password === '') {
          showError('Required fields are missing');
          return;
        }
        
        if (!agreeTerms) {
          showError('Please agree to the Terms & Conditions');
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showError('Please enter a valid email address');
          return;
        }
        
        // Validate phone number (basic validation)
        const phoneRegex = /^[0-9+\-() ]+$/;
        if (phone && !phoneRegex.test(phone)) {
          showError('Please enter a valid phone number');
          return;
        }
        
        // Call API to register user
        signUp(firstName, lastName, email, password, phone, address, role);
      });
    }
  }
  
  // Function to handle sign in
function signIn(email, password) {
  console.log('Attempting to sign in:', email);
  
  // API call to verify credentials
  fetch('/api/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.error || 'Invalid email or password');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('etee_current_user', JSON.stringify(data.user));
      showSuccess('Login successful!');
      
      setTimeout(() => {
        window.location.href = 'Dashboard.html';
      }, 1000);
    } else {
      showError(data.error || 'An error occurred');
    }
  })
  .catch(error => {
    showError(error.message || 'Failed to sign in');
  });
}
  
function signUp(firstName, lastName, email, password, phone, address, role) {
  // Make API call to server
  fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role
    }),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.error || 'Registration failed');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('etee_current_user', JSON.stringify(data.user));
      showSuccess('Registration successful!');
      
      setTimeout(() => {
        window.location.href = 'Dashboard.html';
      }, 1000);
    } else {
      showError(data.error || 'An error occurred');
    }
  })
  .catch(error => {
    showError(error.message || 'Failed to register');
  });
}
  // Local Storage based authentication (fallback without backend)
  function handleLocalSignIn(email, password) {
    const users = JSON.parse(localStorage.getItem('etee_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      showError('Invalid email or password');
      return;
    }
    
    // Create a copy without the password
    const userSession = {...user};
    delete userSession.password;
    
    localStorage.setItem('etee_current_user', JSON.stringify(userSession));
    
    showSuccess('Login successful!');
    
    setTimeout(() => {
      window.location.href = 'Dashboard.html';
    }, 1000);
  }
  
  function handleLocalSignUp(firstName, lastName, email, password, phone, address, role) {
    const users = JSON.parse(localStorage.getItem('etee_users') || '[]');
    
    if (users.some(u => u.email === email)) {
      showError('Email already registered');
      return;
    }
    
    // Generate unique user ID
    const userID = 'USR-' + Date.now();
    
    const userData = {
      userID,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      address,
      role,
      dateRegistered: new Date().toISOString()
    };
    
    // Add to users list
    users.push(userData);
    localStorage.setItem('etee_users', JSON.stringify(users));
    
    // Create session without password
    const userSession = {...userData};
    delete userSession.password;
    
    localStorage.setItem('etee_current_user', JSON.stringify(userSession));
    
    showSuccess('Registration successful!');
    
    setTimeout(() => {
      window.location.href = 'Dashboard.html';
    }, 1000);
  }
  
  // Dashboard Initialization
  function initializeDashboard() {
    // This function will be called when the dashboard page loads
    // It should check authentication and set up the dashboard components
    const currentUser = checkAuth();
    if (!currentUser) return; // Should already have redirected if no user
    
    // Update UI with user info if needed
    
    // Initialize data fetching for dashboard components
    fetchUserCoops(currentUser.userID);
  }
  
  // Helper Functions
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
  
  function fetchUserCoops(userId) {
    if (!apiAvailable()) {
      // Use local storage if API not available
      return;
    }
    
    fetch(`/api/coops?userId=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch coops');
        }
        return response.json();
      })
      .then(coops => {
        // Process coops data for the dashboard
        updateCoopsUI(coops);
      })
      .catch(error => {
        console.error('Error fetching coops:', error);
      });
  }
  
  function updateCoopsUI(coops) {
    // Update the UI with the coop data
    // This will interact with your existing dashboard.js
    const customEvent = new CustomEvent('coops-loaded', { detail: coops });
    document.dispatchEvent(customEvent);
  }
  
  function apiAvailable() {
    // Check if we're in a development environment without the backend
    // This is a simple check - you might need to adjust based on your setup
    return window.location.hostname !== 'localhost' || window.location.hostname !== '127.0.0.1';
  }
  
  // Notification functions
  function showError(message) {
    createNotification(message, 'error');
  }
  
  function showSuccess(message) {
    createNotification(message, 'success');
  }
  
  function createNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('visible');
      
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }