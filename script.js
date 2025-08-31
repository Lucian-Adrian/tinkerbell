// Public root build of frontend logic: delegate to tinkerbell-frontend/script.js
// For GitHub Pages, we keep the app logic identical to source.
// Note: backend API calls point to localhost in source; update if needed for production.

// Re-export by including the source file dynamically
(function loadAppScript(){
  var s=document.createElement('script');
  s.src='tinkerbell-frontend/script.js';
  s.defer=true;
  document.head.appendChild(s);
})();
