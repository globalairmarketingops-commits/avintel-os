/* =====================================================================
   AvIntelOS — Event System
   Structured console.log events for v1. Wire to GA4 in Sprint 3.
   Convention: intel_[domain]_[component]_[action]
   ===================================================================== */

const Events = (() => {
  function log(eventName, payload = {}) {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      ...payload
    };
    console.log(`[AvIntelOS] ${eventName}`, event);
    return event;
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('avintelosession');
    if (!sid) {
      sid = 'ses_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('avintelosession', sid);
    }
    return sid;
  }

  return { log };
})();
