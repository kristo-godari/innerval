// Analytics wrapper for Google Analytics 4
// Privacy-first: tracks minimal metadata (quiz level selection only)
// Never tracks quiz answers, scores, specific values, or personal data
// Gracefully handles blocked analytics (ad blockers, privacy extensions)

/**
 * Track an analytics event
 * @param {string} eventName - The name of the event to track (e.g., 'quiz_started', 'pdf_downloaded')
 * @param {Object} properties - Optional event properties (privacy-safe metadata only)
 */
function trackEvent(eventName, properties) {
  // Validate event name
  if (!eventName || typeof eventName !== 'string') {
    console.warn('[Analytics] Invalid event name:', eventName);
    return;
  }

  // Check if gtag is available (may be blocked by ad blockers)
  if (typeof gtag === 'undefined') {
    console.log('[Analytics] GA4 not loaded (likely blocked), skipping event:', eventName);
    return;
  }

  // Send event to GA4 with optional properties
  try {
    if (properties && typeof properties === 'object') {
      gtag('event', eventName, properties);
      console.log('[Analytics] Tracked event:', eventName, properties);
    } else {
      gtag('event', eventName);
      console.log('[Analytics] Tracked event:', eventName);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', eventName, error);
  }
}
