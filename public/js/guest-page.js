// Initialize the dropdown menu
document.addEventListener('DOMContentLoaded', function() {
  // Get the dropdown parent
  const dropdown = document.querySelector('.dropdown');
  
  // Get the link inside the dropdown that toggles the menu
  const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
  
  // Add a click event listener to toggle the dropdown
  dropdownToggle.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    
    // Toggle the 'active' class on the dropdown
    dropdown.classList.toggle('active');
  });
  
  // Optionally, close the dropdown if clicking outside of it
  document.addEventListener('click', function(event) {
    // Check if the click happened outside the dropdown menu
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('active');
    }
  });
});



// Get the modal element
  // Get modal element
  var modal = document.getElementById("signupModal");

  // Show the modal when the page loads
  window.onload = function() {
      modal.style.display = "block"; // Show the modal
  };

  // Get the close elements
  var closeModal = document.getElementById("closeModal");
  var closeButton = document.getElementById("closeButton");

  // Close the modal when the 'X' or 'No, Thanks' button is clicked
  closeModal.onclick = function() {
      modal.style.display = "none";
  };
  closeButton.onclick = function() {
      modal.style.display = "none";
  };

  // Redirect to the signup page when the 'Sign Up' button is clicked
  document.getElementById("signupButton").onclick = function() {
      window.location.href = "/signup";
  };

  // Close the modal if the user clicks anywhere outside of it
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  };