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
        // For demo purposes, we'll just redirect to the dashboard
        showSuccess();
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = 'Dashboard.html';
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
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        // Basic validation
        if (name === '' || email === '' || password === '') {
          showError('Please fill in all fields');
          return;
        }
        
        if (!agreeTerms) {
          showError('Please agree to the Terms & Conditions');
          return;
        }
        
        // Here you would normally register the user
        // For demo purposes, we'll just redirect to the dashboard
        showSuccess();
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = 'Dashboard.html';
        }, 1000);
      });
    }
    
    // Input focus effects
    const inputs = document.querySelectorAll('input');
    
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
    
    function showSuccess() {
      createNotification('Success! Redirecting...', 'success');
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