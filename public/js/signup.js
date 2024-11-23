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




// Password Requirements Validation
  document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const requirements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
    };

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;

        // Validate length
        if (password.length >= 6) {
            requirements.length.classList.remove('invalid');
            requirements.length.classList.add('valid');
        } else {
            requirements.length.classList.remove('valid');
            requirements.length.classList.add('invalid');
        }

        // Validate uppercase letter
        if (/[A-Z]/.test(password)) {
            requirements.uppercase.classList.remove('invalid');
            requirements.uppercase.classList.add('valid');
        } else {
            requirements.uppercase.classList.remove('valid');
            requirements.uppercase.classList.add('invalid');
        }

        // Validate lowercase letter
        if (/[a-z]/.test(password)) {
            requirements.lowercase.classList.remove('invalid');
            requirements.lowercase.classList.add('valid');
        } else {
            requirements.lowercase.classList.remove('valid');
            requirements.lowercase.classList.add('invalid');
        }

        // Validate number
        if (/\d/.test(password)) {
            requirements.number.classList.remove('invalid');
            requirements.number.classList.add('valid');
        } else {
            requirements.number.classList.remove('valid');
            requirements.number.classList.add('invalid');
        }
    });
});
