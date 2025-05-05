document.addEventListener('DOMContentLoaded', function() {
  // Clear any existing session on signin page load
  localStorage.removeItem('etee_current_user');
  
  // Handle sign-in form submission
  const signinForm = document.getElementById('signin-form');
  
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
      
      // Call the signIn function
      signIn(email, password);
    });
  }
  
  // Handle sign-up form submission
  const signupForm = document.getElementById('signup-form');
  
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
        showError('Please fill in all required fields');
        return;
      }
      
      if (!agreeTerms) {
        showError('Please agree to the Terms & Conditions');
        return;
      }
      
      // Call the signUp function
      signUp(firstName, lastName, email, password, phone, address, role);
    });
  }
  
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
});

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

// Function to handle sign up
function signUp(firstName, lastName, email, password, phone, address, role) {
  console.log('Attempting to register:', email);
  
  // API call to register the user
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

// Add the notification functions
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