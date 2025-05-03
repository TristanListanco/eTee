class Sidebar {
  constructor(options = {}) {
    // Default options
    this.options = {
      containerId: 'sidebar',
      navItems: [],
      profile: {
        name: "Admin User",
        role: "Admin",
        email: "admin@example.com",
        image: "admin.png"
      },
      companyName: "ETee",
      onProfileEdit: null,
      onNavItemClick: null,
      ...options
    };

    this.container = document.getElementById(this.options.containerId);
    if (!this.container) {
      console.error(`Sidebar container with id "${this.options.containerId}" not found`);
      return;
    }

    this.init();
  }

  init() {
    // Initialize navigation
    this.initNavigation();
    
    // Initialize profile
    this.initProfile();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load saved profile data if exists
    this.loadProfileData();
  }

  initNavigation() {
    const navContainer = this.container.querySelector('#sidebarNav');
    if (!navContainer) return;

    // Clear existing navigation items
    navContainer.innerHTML = '';

    // Add navigation items
    this.options.navItems.forEach(item => {
      const navLink = document.createElement('a');
      navLink.href = item.href || '#';
      navLink.className = item.active ? 'active' : '';
      
      // Create icon element
      const icon = document.createElement('i');
      icon.className = item.icon;
      
      // Create text node
      const text = document.createTextNode(item.text);
      
      // Append icon and text to link
      navLink.appendChild(icon);
      navLink.appendChild(text);

      if (item.class) {
        navLink.classList.add(item.class);
      }

      // Add click event
      navLink.addEventListener('click', (e) => {
        if (this.options.onNavItemClick) {
          this.options.onNavItemClick(e, item);
        }
        
        // Update active state
        if (!item.href || item.href === '#') {
          e.preventDefault();
          this.setActiveNavItem(navLink);
        }
      });

      navContainer.appendChild(navLink);
    });
  }

  initProfile() {
    const companyNameEl = this.container.querySelector('.company-name');
    if (companyNameEl) {
      companyNameEl.textContent = this.options.companyName;
    }

    this.updateProfile(this.options.profile);
  }

  updateProfile(profile) {
    const nameEl = this.container.querySelector('#adminName');
    const roleEl = this.container.querySelector('#adminRole');
    const emailEl = this.container.querySelector('#adminEmail');
    const imageEl = this.container.querySelector('#adminImage');

    if (nameEl) nameEl.textContent = profile.name;
    if (roleEl) roleEl.textContent = profile.role;
    if (emailEl) {
      emailEl.textContent = profile.email;
      emailEl.href = `mailto:${profile.email}`;
    }
    if (imageEl) imageEl.src = profile.image;
  }

  setupEventListeners() {
    // Edit profile overlay click
    const editOverlay = this.container.querySelector('.edit-overlay');
    if (editOverlay) {
      editOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.options.onProfileEdit) {
          this.options.onProfileEdit();
        }
      });
    }

    // Mobile responsiveness
    this.setupMobileResponsiveness();
  }

  setupMobileResponsiveness() {
    // Check if mobile toggle button exists
    let toggleButton = document.querySelector('.mobile-toggle');
    
    if (!toggleButton) {
      // Create mobile toggle button if it doesn't exist
      toggleButton = document.createElement('button');
      toggleButton.className = 'mobile-toggle';
      toggleButton.id = 'sidebarToggle';
      toggleButton.innerHTML = '<i class="bx bx-menu"></i>';
      document.body.appendChild(toggleButton);
    }

    // Toggle sidebar on mobile
    toggleButton.addEventListener('click', () => {
      this.container.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !this.container.contains(e.target) && 
          e.target !== toggleButton && 
          !toggleButton.contains(e.target)) {
        this.container.classList.remove('active');
      }
    });
  }

  setActiveNavItem(activeLink) {
    const navLinks = this.container.querySelectorAll('.nav a');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  loadProfileData() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        this.updateProfile(profile);
      } catch (e) {
        console.error('Error parsing saved profile data:', e);
      }
    }
  }

  // Public method to update profile
  setProfile(profile) {
    this.updateProfile(profile);
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  // Public method to update navigation items
  setNavItems(navItems) {
    this.options.navItems = navItems;
    this.initNavigation();
  }

  // Public method to set active nav item by href
  setActiveNavByHref(href) {
    const navLinks = this.container.querySelectorAll('.nav a');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sidebar;
}