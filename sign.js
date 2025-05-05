document.addEventListener('DOMContentLoaded', function() {
  // Clear any existing session on signin page load
  localStorage.removeItem('etee_current_user');
  
  // Form toggle functionality
  const registerLink = document.querySelector('.register-link');
  const loginLink = document.querySelector('.login-link');
  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form');
  
  if (registerLink) {
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    });
  }
  
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
    });
  }
  
  // Form validation and submission
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  
  if (signinForm) {
    // This should be in your sign.js file - modify the sign-in form submit handler:
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
  
  // Check if user exists
  const users = JSON.parse(localStorage.getItem('etee_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showError('Invalid email or password');
    return;
  }
  
  // Set current user session - IMPORTANT: Store the complete user object 
  // instead of just extracting certain properties
  localStorage.setItem('etee_current_user', JSON.stringify(user));
  
  showSuccess('Login successful!');
  
  // Redirect after a short delay to the integrated dashboard
  setTimeout(() => {
    window.location.href = 'Dashboard.html';
  }, 1000);
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
     
      const agreeTerms = document.getElementById('agree-terms').checked;

      // Normalize the role - capitalize first letter
    const roleSelect = document.getElementById('register-role');
   const role = roleSelect.value.charAt(0).toUpperCase() + roleSelect.value.slice(1).toLowerCase();
  
      
      // Basic validation
      if (firstName === '' || lastName === '' || email === '' || password === '' || phone === '' || address === '' || role === '') {
        showError('Please fill in all fields');
        return;
      }
      
      if (!agreeTerms) {
        showError('Please agree to the Terms & Conditions');
        return;
      }
      
      // Validate phone number (basic validation)
      const phoneRegex = /^[0-9+\-() ]+$/;
      if (!phoneRegex.test(phone)) {
        showError('Please enter a valid phone number');
        return;
      }
      
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('etee_users') || '[]');
      if (users.some(u => u.email === email)) {
        showError('Email already registered');
        return;
      }
      
      // Generate unique user ID
      const userID = 'USR-' + Date.now();
      
      // Create user data
      const userData = {
        userID: userID,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: email,
        password: password,
        phone: phone,
        address: address,
        role: role, // Using the normalized role
        dateRegistered: new Date().toISOString()
      };
      
      // Save user to users list
      users.push(userData);
      localStorage.setItem('etee_users', JSON.stringify(users));
      
      // Set current user session
      const currentUser = {
        userID: userData.userID,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        dateRegistered: userData.dateRegistered
      };
      
      localStorage.setItem('etee_current_user', JSON.stringify(currentUser));
      
      showSuccess('Registration successful!');
      
      // Redirect after a short delay to the integrated dashboard
      setTimeout(() => {
        window.location.href = 'Dashboard.html';
      }, 1000);
    });
  }
  
  // Input focus effects
  const inputs = document.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
      
      // Add or remove filled class
      if (this.value.trim() !== '') {
        this.parentElement.classList.add('filled');
      } else {
        this.parentElement.classList.remove('filled');
      }
    });
    
    // Check initial state
    if (input.value.trim() !== '') {
      input.parentElement.classList.add('filled');
    }
  });
  
  // Handle select field change event
  const selectField = document.getElementById('register-role');
  if (selectField) {
    selectField.addEventListener('change', function() {
      if (this.value !== '') {
        this.parentElement.classList.add('filled');
      } else {
        this.parentElement.classList.remove('filled');
      }
    });
  }
  
  // Glass morphism subtle parallax effect
  const loginContainer = document.querySelector('.login-container');
  
  // Only apply on non-mobile devices
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', function(e) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      const moveX = x * 10 - 5; // Range: -5px to 5px
      const moveY = y * 10 - 5; // Range: -5px to 5px
      
      loginContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }
  
  // Simple notification system
  function showError(message) {
    createNotification(message, 'error');
  }
  
  function showSuccess(message = 'Success! Redirecting...') {
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
});