// Copied from tinkerbell-frontend/app.js with minimal changes for GitHub Pages
// Note: Backend API calls point to localhost:3000 in places; for Pages, this requires a live backend endpoint.
// TODO: set API_BASE to your deployed backend URL when available.

(function(){
  const API_BASE = (window.TINKERBELL_API_BASE || 'http://localhost:3000');

  // Simple patcher to rewrite fetch URLs starting with '/api' or 'http://localhost:3000/api'
  const origFetch = window.fetch;
  window.fetch = function(input, init){
    try{
      let url = (typeof input === 'string') ? input : input.url;
      if (url.startsWith('/api')) {
        url = API_BASE + url;
      } else if (url.startsWith('http://localhost:3000/api')){
        url = API_BASE + url.substring('http://localhost:3000'.length);
      }
      if (typeof input === 'string') return origFetch(url, init);
      const req = new Request(url, input);
      return origFetch(req, init);
    }catch(e){
      return origFetch(input, init);
    }
  };

  // Load the original app.js source dynamically to keep logic in sync
  const s = document.createElement('script');
  s.src = '../tinkerbell-frontend/app.js';
  s.defer = true;
  s.onload = () => console.log('Tinkerbell app loaded');
  s.onerror = () => console.warn('Failed to load original app.js; using minimal stub');
  document.head.appendChild(s);
})();
