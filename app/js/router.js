/* =====================================================================
   AvIntelOS — Hash-Based Router
   Routes: #dashboard, #ga4, #organic, #competitive, #ppc, #content, #health
   ===================================================================== */

const Router = (() => {
  const routes = {
    dashboard:   { label: 'Intelligence Dashboard', icon: '&#128202;', page: 'intelligence-dashboard', group: 'intelligence' },
    ga4:         { label: 'GA4 Analytics',          icon: '&#128200;', page: 'ga4-analytics',          group: 'analytics' },
    organic:     { label: 'Organic Intelligence',   icon: '&#128269;', page: 'organic-intelligence',   group: 'analytics' },
    competitive: { label: 'Competitive Intel',      icon: '&#128373;', page: 'competitive-intelligence', group: 'analytics' },
    ppc:         { label: 'PPC & Paid',             icon: '&#128176;', page: 'ppc-analytics',          group: 'analytics' },
    content:     { label: 'Content & Channel',      icon: '&#128196;', page: 'content-channel',        group: 'performance' },
    health:      { label: 'Data Health',            icon: '&#9889;',   page: 'data-health',            group: 'performance' }
  };

  let currentRoute = 'dashboard';

  function init() {
    window.addEventListener('hashchange', handleRoute);
    if (!window.location.hash || !routes[window.location.hash.slice(1)]) {
      history.replaceState(null, '', '#dashboard');
    }
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    if (!routes[hash]) {
      history.replaceState(null, '', '#dashboard');
      currentRoute = 'dashboard';
    } else {
      currentRoute = hash;
    }
    updateNav();
    renderPage(currentRoute);
    Events.log('intel_nav_click', { target_view: currentRoute });
  }

  function navigate(route) {
    window.location.hash = '#' + route;
  }

  function updateNav() {
    document.querySelectorAll('.nav-item[data-route]').forEach(item => {
      item.classList.toggle('active', item.dataset.route === currentRoute);
    });
  }

  function renderPage(route) {
    const content = document.getElementById('content-area');
    if (!content) return;
    content.innerHTML = '<div class="page-loading"><div class="skeleton-block"></div><div class="skeleton-block"></div><div class="skeleton-block"></div></div>';

    const pageRenderers = {
      dashboard:   () => typeof IntelDashboard !== 'undefined' && IntelDashboard.render(content),
      ga4:         () => typeof GA4Analytics !== 'undefined' && GA4Analytics.render(content),
      organic:     () => typeof OrganicIntel !== 'undefined' && OrganicIntel.render(content),
      competitive: () => typeof CompetitiveIntel !== 'undefined' && CompetitiveIntel.render(content),
      ppc:         () => typeof PPCAnalytics !== 'undefined' && PPCAnalytics.render(content),
      content:     () => typeof ContentChannel !== 'undefined' && ContentChannel.render(content),
      health:      () => typeof DataHealth !== 'undefined' && DataHealth.render(content)
    };

    setTimeout(() => {
      if (pageRenderers[route]) {
        pageRenderers[route]();
      } else {
        content.innerHTML = Components.emptyState('&#128679;', `Page "${route}" is not yet implemented.`, '', null);
      }
    }, 0);
  }

  function getCurrent() { return currentRoute; }
  function getRoutes() { return routes; }
  function rerender() { renderPage(currentRoute); }

  return { init, navigate, getCurrent, getRoutes, rerender };
})();
