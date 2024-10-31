'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /**
   * Element toggle function
   */
  const elemToggleFunc = function (elem) { 
    elem.classList.toggle("active"); 
  }

  /**
   * Navbar toggle
   */
  const navbar = document.querySelector("[data-navbar]");
  const overlay = document.querySelector("[data-overlay]");
  const navCloseBtn = document.querySelector("[data-nav-close-btn]");
  const navOpenBtn = document.querySelector("[data-nav-open-btn]");
  const navbarLinks = document.querySelectorAll("[data-nav-link]");

  const navElemArr = [overlay, navCloseBtn, navOpenBtn];

  // Close navbar when click on any navbar link
  for (let i = 0; i < navbarLinks.length; i++) { 
    navElemArr.push(navbarLinks[i]); 
  }

  // Add event on all elements for toggling navbar
  for (let i = 0; i < navElemArr.length; i++) {
    navElemArr[i].addEventListener("click", function () {
      elemToggleFunc(navbar);
      elemToggleFunc(overlay);
    });
  }

  /**
   * Header active state
   */
  const header = document.querySelector("[data-header]");

  window.addEventListener("scroll", function () {
    window.scrollY >= 400 ? header.classList.add("active")
      : header.classList.remove("active");
  });

  /**
   * Password toggle visibility
   */
  const passwordInput = document.getElementById('password');
  const showPasswordToggle = document.getElementById('showPasswordToggle');

  if (passwordInput && showPasswordToggle) {
    showPasswordToggle.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordToggle.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
      } else {
        passwordInput.type = 'password';
        showPasswordToggle.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
      }
    });
  }
});
