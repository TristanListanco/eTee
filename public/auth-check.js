// auth-check.js - This should be included in all protected pages

// Function to check if user is authenticated
function checkAuth() {
    const currentUser = localStorage.getItem('etee_current_user');
    
    if (!currentUser) {
      // No user logged in, redirect to signin page
      window.location.href = 'signin.html';
      return null;
    }
    
    try {
      const user = JSON.parse(currentUser);
      if (!user.email || !user.userID) {
        // Invalid user data
        localStorage.removeItem('etee_current_user');
        window.location.href = 'signin.html';
        return null;
      }
      return user;
    } catch (e) {
      // Invalid JSON
      localStorage.removeItem('etee_current_user');
      window.location.href = 'signin.html';
      return null;
    }
  }
  
  // Function to get user-specific storage key
  function getUserStorageKey(baseKey, userID) {
    return `${baseKey}_${userID}`;
  }
  
  // Function to get user-specific data
  function getUserData(baseKey, userID) {
    const storageKey = getUserStorageKey(baseKey, userID);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  // Function to set user-specific data
  function setUserData(baseKey, userID, data) {
    const storageKey = getUserStorageKey(baseKey, userID);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
  
  // Execute on page load for protected pages
  document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a protected page (dashboard or any non-signin page)
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage !== 'signin.html' && currentPage !== 'index.html' && currentPage !== '') {
      const user = checkAuth();
      if (!user) {
        // User is not authenticated, checkAuth will redirect
        return;
      }
      
      // User is authenticated, continue loading the page
      // You can access user info through the returned user object
      window.currentUser = user;
    }
  });