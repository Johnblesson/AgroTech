  // Toggle Password Visibility
  const togglePassword = document.querySelector('.toggle-password');
  const password = document.querySelector('#password');

  togglePassword.addEventListener('click', function () {
      const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
      password.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');

      // Adjust password input width dynamically
      password.style.width = type === 'password' ? 'calc(100% - 40px)' : '100%';
  });

  // File Input Handling
  const fileInput = document.getElementById('fileInput');
  const fileLabelText = document.getElementById('fileLabelText');

  fileInput.addEventListener('change', function () {
      // Update file label text based on file selection
      fileLabelText.textContent = this.files && this.files.length > 0 
          ? 'File uploaded' 
          : 'Upload profile photo';
  });