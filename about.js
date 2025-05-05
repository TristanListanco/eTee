// about.js
class AboutModal {
    constructor() {
      this.modal = document.getElementById('aboutModal');
      this.initEventListeners();
    }
  
    initEventListeners() {
      // Close button
      const closeButton = this.modal?.querySelector('.close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.close());
      }
  
      // Close on outside click
      window.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
  
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
          this.close();
        }
      });
    }
  
    open() {
      if (this.modal) {
        this.modal.classList.add('active');
      }
    }
  
    close() {
      if (this.modal) {
        this.modal.classList.remove('active');
      }
    }
  }
  
  // Initialize the about modal
  window.aboutModal = new AboutModal();