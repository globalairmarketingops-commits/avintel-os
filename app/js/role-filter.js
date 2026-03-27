/* =====================================================================
   AvIntelOS — Role-Based Rendering Filter
   Casey/Clay = full data (all confidence levels)
   Jeffrey = confirmed data only (PROBABLE/POSSIBLE hidden)
   ===================================================================== */

const RoleFilter = (() => {
  const ROLES = {
    casey:   { label: 'Casey', css: 'role-casey',   showAll: true,  description: 'Full data — all confidence levels' },
    clay:    { label: 'Clay',  css: 'role-clay',    showAll: true,  description: 'Full data — technical framing' },
    jeffrey: { label: 'Jeffrey', css: 'role-jeffrey', showAll: false, description: 'Confirmed data only — plain language' }
  };

  function getCurrentRole() {
    const settings = Store.get('intel_settings') || {};
    return settings.current_role || 'casey';
  }

  function setRole(role) {
    if (!ROLES[role]) return;
    const settings = Store.get('intel_settings') || {};
    settings.current_role = role;
    Store.set('intel_settings', settings);
    Events.log('intel_role_change', { role });
    // Re-render current page
    if (typeof Router !== 'undefined') {
      Router.navigate(Router.getCurrent());
    }
    // Update topbar role indicator
    const indicator = document.getElementById('topbar-role-indicator');
    if (indicator) indicator.innerHTML = roleIndicator();
  }

  /**
   * Should this confidence level be shown for the current role?
   */
  function shouldShow(confidenceLevel) {
    const role = getCurrentRole();
    const config = ROLES[role];
    if (!config) return true;
    if (config.showAll) return true;
    // Jeffrey only sees CONFIRMED
    return confidenceLevel === 'CONFIRMED';
  }

  /**
   * Filter table rows by confidence for current role.
   * Each row must have a `_confidence` property.
   */
  function filterRows(rows) {
    if (!rows || !Array.isArray(rows)) return rows;
    const role = getCurrentRole();
    const config = ROLES[role];
    if (config && config.showAll) return rows;
    return rows.filter(row => !row._confidence || row._confidence === 'CONFIRMED');
  }

  /**
   * Wrap HTML content with role-based visibility.
   * If current role shouldn't see this confidence level, returns empty string.
   */
  function wrapForRole(html, confidenceLevel) {
    if (!shouldShow(confidenceLevel)) return '';
    return html;
  }

  /**
   * Render the role switcher dropdown for the topbar.
   */
  function roleSwitcher() {
    const current = getCurrentRole();
    return `
      <select class="role-switcher" onchange="RoleFilter.setRole(this.value)" aria-label="View as role">
        ${Object.entries(ROLES).map(([key, val]) =>
          `<option value="${key}" ${key === current ? 'selected' : ''}>${val.label} — ${val.description}</option>`
        ).join('')}
      </select>`;
  }

  /**
   * Small badge showing current role in topbar.
   */
  function roleIndicator() {
    const current = getCurrentRole();
    const config = ROLES[current];
    return `<span class="role-badge ${config.css}">${config.label}</span>`;
  }

  function getRoleConfig(role) {
    return ROLES[role || getCurrentRole()];
  }

  return { getCurrentRole, setRole, shouldShow, filterRows, wrapForRole, roleSwitcher, roleIndicator, getRoleConfig, ROLES };
})();
