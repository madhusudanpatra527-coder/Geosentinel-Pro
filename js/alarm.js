/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Alarm Banner & Audit Trail
   ═══════════════════════════════════════════════════════════════ */

let alarmLevel = 'none';
const auditEntries = [];

function addAudit(msg) {
  auditEntries.unshift({ t: new Date().toLocaleTimeString(), msg });
  renderAudit();
}

function renderAudit() {
  const el = document.getElementById('auditLog');
  if (!el) return;
  el.innerHTML = auditEntries.slice(0, 20).map(e => `
    <div style="padding:3px 0;border-bottom:0.5px solid var(--bdr);display:flex;gap:6px">
      <span style="color:var(--txt3);flex-shrink:0">${e.t}</span>
      <span style="color:var(--txt2)">${e.msg}</span>
    </div>`).join('');
}

function showAlarm(lv, title, sub) {
  const b = document.getElementById('alarmBanner');
  b.className = 'alarm-banner ' + lv;
  document.getElementById('alarmTitle').textContent = title;
  document.getElementById('alarmSub').textContent = sub;
  alarmLevel = lv;
  document.getElementById('sirenBtn').textContent = 'Silence';
  if (Siren.isMuted()) Siren.toggle();
  if (lv === 'crit') Siren.playCrit(); else Siren.playWarn();
  addAudit(`[${lv.toUpperCase()}] ${title.substring(0, 60)}`);
}

function dismissAlarm() {
  document.getElementById('alarmBanner').className = 'alarm-banner';
  Siren.stop();
  alarmLevel = 'none';
  addAudit('Alarm dismissed by operator');
}

function toggleSiren() {
  const m = Siren.toggle();
  if (!m) { if (alarmLevel === 'crit') Siren.playCrit(); else Siren.playWarn(); }
  document.getElementById('sirenBtn').textContent = m ? 'Resume' : 'Silence';
}

function testAlarm(lv) {
  showAlarm(lv,
    lv === 'crit' ? 'TEST CRITICAL — S-05 bearing 142 kPa' : 'TEST WARNING — S-04 moisture 34%',
    lv === 'crit' ? 'Critical siren active · Zone C NW' : 'Warning tone active · Zone B SE'
  );
}
