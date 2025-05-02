const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');
const logregBox = document.querySelector('.logreg-box');
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

registerLink.addEventListener('click', () => {
    logregBox.classList.add('active');
});

loginLink.addEventListener('click', () => {
    logregBox.classList.remove('active');
});

// Redirect after successful login
loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent actual form submission (for now)
    
    // Simulate authentication (Replace this with real authentication logic)
    setTimeout(() => {
        window.location.href = "Dashboard.html"; // Redirect to home page
    }, 500); // Add a small delay for smooth effect
});

// Redirect after successful registration
registerForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent actual form submission (for now)
    
    // Simulate account creation (Replace this with real backend logic)
    setTimeout(() => {
        window.location.href = "Dashboard.html"; // Redirect to home page
    }, 500);
});
