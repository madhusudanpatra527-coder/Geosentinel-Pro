/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Remedial Measures Panel
   Builds recommendations from REMEDIAL_DB based on each sensor's
   actual live failure mode.
   ═══════════════════════════════════════════════════════════════ */

function buildRemedial() {
  const crits = SENSORS.filter(s => s.status === 'crit');
  const warns = SENSORS.filter(s => s.status === 'warn');
  let html = '';

  crits.forEach(s => {
    const db = s.bc < 200 ? REMEDIAL_DB.low_bc : s.moist > 32 ? REMEDIAL_DB.moisture : REMEDIAL_DB.settlement;
    const reasons = [];
    if (s.bc < 200) reasons.push(`BC ${s.bc} kPa (${Math.round((1 - s.bc / 200) * 100)}% below threshold)`);
    if (s.moist > 30) reasons.push(`Moisture ${s.moist}%`);
    if (s.settle > 18) reasons.push(`Settlement ${s.settle} mm`);
    html += `<div class="remedial-item crit">
      <div style="font-weight:500;color:var(--crit);margin-bottom:3px">CRITICAL — ${s.id} [${s.loc}] · ${reasons.join(' · ')}</div>
      <div style="font-size:11px;font-weight:500;color:var(--txt);margin:4px 0 3px">${db.title}</div>
      <div class="rmeasures">${db.steps.join('<br>')}</div>
      <div class="rsource">Sources: ${db.src.join(' · ')}</div>
    </div>`;
  });

  warns.forEach(s => {
    const db = REMEDIAL_DB.warning;
    const reasons = [];
    if (s.bc < 230) reasons.push(`BC ${s.bc} kPa`);
    if (s.moist > 26) reasons.push(`Moisture ${s.moist}%`);
    if (s.settle > 14) reasons.push(`Settlement ${s.settle} mm`);
    html += `<div class="remedial-item warn">
      <div style="font-weight:500;color:var(--warn);margin-bottom:3px">WARNING — ${s.id} [${s.loc}] · ${reasons.join(' · ')}</div>
      <div style="font-size:11px;font-weight:500;color:var(--txt);margin:4px 0 3px">${db.title}</div>
      <div class="rmeasures">${db.steps.join('<br>')}</div>
      <div class="rsource">Sources: ${db.src.join(' · ')}</div>
    </div>`;
  });

  document.getElementById('remedialList').innerHTML = html || '<div style="color:var(--txt2);font-size:11px">No critical or warning conditions.</div>';
}
