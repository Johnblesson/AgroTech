// Get the IP addresses of the visitors
function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('ipTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      let match = false;
      for (let j = 0; j < cells.length; j++) {
        if (cells[j].textContent.toLowerCase().includes(input)) {
          match = true;
          break;
        }
      }
      rows[i].style.display = match ? '' : 'none';
    }
  }



   // Delete function
   function deleteIPAddress(ip) {
    if (confirm('Are you sure you want to delete this IP address?')) {
        // Redirect to the delete route with the storage ID
        window.location.href = "/ip-addresses/" + ip + "?_method=DELETE";
    }
}