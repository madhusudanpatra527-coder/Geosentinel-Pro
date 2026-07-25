/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Application Bootstrap
   Tab routing, panel lazy-init, boot sequence, service worker.
   ═══════════════════════════════════════════════════════════════ */

function switchTab(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  else document.querySelector(`[onclick*="switchTab('${id}'"]`)?.classList.add('active');

  if (id === 'map') setTimeout(() => { if (geoMap) geoMap.invalidateSize(); initMap(); }, 60);
  if (id === 'twin') drawDigitalTwin();
  if (id === 'compliance') buildCompliance();
  if (id === 'remedial') buildRemedial();
  if (id === 'report') buildReport();
  addAudit(`Operator navigated to: ${id}`);
}

function boot() {
  initHeatmap(); initPredictBars(); initMiniAlerts(); initFullAlerts();
  initSensorTable(); initSensorHealth(); initCalibTable();
  initAnalyticsSummary(); initMaintTable(); initCharts();
  buildRemedial(); renderAudit();

  addAudit('GeoSentinel Pro v3.0 started');
  addAudit('18 sensors online — MQTT/Modbus/OPC-UA active');
  addAudit('IEC 61511 SIL 2 watchdog active');
  addAudit('ISO 22476 calibration check completed');

  setTimeout(() => {
    showAlarm('crit',
      'CRITICAL — S-05 Zone C NW: Bearing capacity 142 kPa (43% below IS 6403 threshold of 200 kPa)',
      'Siren active · FOS = 0.71 · Immediate load restriction required · Click "Remedial" for IS-code solutions'
    );
  }, 2000);

  setInterval(liveTick, 3000);
  setInterval(initSensorTable, 8000);

  // Fade out splash screen
  const splash = document.getElementById('splash');
  if (splash) setTimeout(() => { splash.classList.add('hide'); setTimeout(() => splash.remove(), 600); }, 900);

  // Register service worker for offline / installable PWA support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }
}

document.addEventListener('DOMContentLoaded', boot);
