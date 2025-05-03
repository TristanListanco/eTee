document.addEventListener('DOMContentLoaded', function() {
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
      
      // Here you would normally authenticate the user
      // For demo purposes, we'll just redirect to the chicken coop page
      showSuccess();
      
      // Redirect after a short delay - CHANGED FROM Dashboard.html TO ChickenCoop.html
      setTimeout(() => {
        window.location.href = 'ChickenCoop.html';
      }, 1000);
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value.trim();
      const phone = document.getElementById('register-phone').value.trim();
      const address = document.getElementById('register-address').value.trim();
      const role = document.getElementById('register-role').value;
      const agreeTerms = document.getElementById('agree-terms').checked;
      
      // Basic validation
      if (name === '' || email === '' || password === '' || phone === '' || address === '' || role === '') {
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
      
      // Store user data (for demonstration - would normally send to server)
      const userData = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        role: role,
        dateRegistered: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('etee_user', JSON.stringify(userData));
      
      // Here you would normally register the user on the server
      showSuccess('Registration successful!');
      
      // Redirect after a short delay - CHANGED FROM Dashboard.html TO ChickenCoop.html
      setTimeout(() => {
        window.location.href = 'ChickenCoop.html';
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