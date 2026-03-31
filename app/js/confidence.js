/* =====================================================================
   AvIntelOS — Confidence Model
   CONFIRMED / PROBABLE / POSSIBLE classification with 30-day decay.
   Every data point in AvIntelOS carries a confidence level.
   ===================================================================== */

const Confidence = (() => {
  const LEVELS = {
    CONFIRMED: { label: 'CONFIRMED', css: 'confirmed', color: 'green', priority: 1 },
    PROBABLE:  { label: 'PROBABLE',  css: 'probable',  color: 'amber', priority: 2 },
    POSSIBLE:  { label: 'POSSIBLE',  css: 'possible',  color: 'muted', priority: 3 }
  };

  // Decay thresholds in days
  const DECAY_CONFIRMED_TO_PROBABLE = 30;
  const DECAY_PROBABLE_TO_POSSIBLE = 60;

  /**
   * Classify confidence based on source type and age in days.
   * Sources: windsor_live, csv_upload, manual, calculated, seed, unknown
   */
  function classify(source, ageInDays) {
    if (ageInDays == null) ageInDays = 999;

    const sourceBase = {
      windsor_live: 'CONFIRMED',
      csv_upload: 'CONFIRMED',
      manual: 'CONFIRMED',
      calculated: 'PROBABLE',
      seed: 'POSSIBLE',
      unknown: 'POSSIBLE'
    };

    let level = sourceBase[source] || 'POSSIBLE';

    // Apply decay
    if (level === 'CONFIRMED' && ageInDays > DECAY_CONFIRMED_TO_PROBABLE) {
      level = 'PROBABLE';
    }
    if (level === 'PROBABLE' && ageInDays > DECAY_PROBABLE_TO_POSSIBLE) {
      level = 'POSSIBLE';
    }

    return level;
  }

  /**
   * Returns HTML badge for a confidence level.
   */
  function badge(level) {
    const info = LEVELS[level] || LEVELS.POSSIBLE;
    return `<span class="confidence-tag confidence-${info.css}" title="Data confidence: ${info.label}">${info.label}</span>`;
  }

  /**
   * Returns the confidence level info object.
   */
  function getLevel(level) {
    return LEVELS[level] || LEVELS.POSSIBLE;
  }

  /**
   * Show audit trail modal for a data point.
   * Reads version history from Store.
   */
  function showAuditTrail(key, label) {
    const data = Store.getVersioned(key);
    if (!data || !data._version_history || data._version_history.length === 0) {
      Components.showModal(Components.modal('Audit Trail — ' + label,
        '<p style="color:var(--ga-muted);font-size:13px;">No version history available for this data point.</p>'));
      return;
    }
    const history = data._version_history.slice(-10).reverse();
    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
    history.forEach(entry => {
      html += `
        <div style="padding:8px 12px;background:var(--ga-off-white);border-radius:var(--ga-radius);font-size:12px;">
          <div style="font-weight:600;color:var(--ga-navy);">${Components.formatDate(entry.date)}</div>
          <div style="color:var(--ga-muted);">Updated by: ${entry.updater}</div>
        </div>`;
    });
    html += '</div>';
    Components.showModal(Components.modal('Audit Trail — ' + label, html, { wide: true }));
  }

  /**
   * Returns the minimum confidence level from an array.
   */
  function min(levels) {
    let worst = 'CONFIRMED';
    for (const l of levels) {
      const p = (LEVELS[l] || LEVELS.POSSIBLE).priority;
      if (p > (LEVELS[worst] || LEVELS.POSSIBLE).priority) worst = l;
    }
    return worst;
  }

  return { classify, badge, getLevel, showAuditTrail, min, LEVELS };
})();
