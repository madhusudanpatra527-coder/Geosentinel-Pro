/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Dashboard, Sensors & Analytics Panel Renderers
   ═══════════════════════════════════════════════════════════════ */

function initHeatmap() {
  const zones = [
    {l:'A-NW',v:268},{l:'A-NE',v:254},{l:'B-SW',v:231},
    {l:'B-SE',v:189},{l:'C-NW',v:142},{l:'C-NE',v:312},
    {l:'D-SW',v:278},{l:'D-SE',v:295},{l:'E-N',v:388},
    {l:'E-S',v:361},{l:'F-W',v:244},{l:'F-E',v:228},
  ];
  document.getElementById('heatmap').innerHTML = zones.map(z => {
    const c = z.v > 250 ? 'hm-good' : z.v > 200 ? 'hm-warn' : 'hm-crit';
    return `<div class="hm-cell ${c}"><span style="font-size:8px">${z.l}</span><span>${z.v}</span></div>`;
  }).join('');
}

function initPredictBars() {
  const risks = [
    {l:'Settlement',p:57,c:'#BA7517'},{l:'Bearing fail',p:31,c:'#E24B4A'},
    {l:'Moisture',p:44,c:'#378ADD'},{l:'Subsidence',p:18,c:'#639922'},
    {l:'Liquefaction',p:9,c:'#1D9E75'},
  ];
  document.getElementById('predictBars').innerHTML = risks.map(r => `
    <div class="pb-row"><span class="pb-lbl">${r.l}</span>
    <div class="pb-track"><div class="pb-fill" style="width:${r.p}%;background:${r.c}"></div></div>
    <span class="pb-pct">${r.p}%</span></div>`).join('');
}

function initMiniAlerts() {
  document.getElementById('miniAlerts').innerHTML = ALERTS.slice(0, 3).map(a => `
    <div class="alert-item">
      <div class="alert-dot" style="background:${a.sev === 'crit' ? '#E24B4A' : a.sev === 'warn' ? '#BA7517' : '#378ADD'}"></div>
      <div><div class="alert-msg">${a.msg.substring(0, 72)}…</div><div class="alert-time">${a.time}</div></div>
    </div>`).join('');
}

function initFullAlerts() {
  document.getElementById('fullAlerts').innerHTML = ALERTS.map(a => `
    <div class="alert-item">
      <div class="alert-dot" style="background:${a.sev === 'crit' ? '#E24B4A' : a.sev === 'warn' ? '#BA7517' : '#378ADD'}"></div>
      <div style="flex:1"><div class="alert-msg">${a.msg}</div><div class="alert-time">${a.time}</div></div>
      <span class="badge badge-${a.sev === 'crit' ? 'crit' : a.sev === 'warn' ? 'warn' : 'info'}" style="flex-shrink:0">${a.sev}</span>
    </div>`).join('');
}

function initSensorTable() {
  document.getElementById('sensorTbody').innerHTML = SENSORS.map(s => `
    <tr>
      <td style="font-family:monospace;font-weight:500">${s.id}</td>
      <td>${s.loc}</td><td>${s.depth}</td>
      <td style="color:${s.bc < 200 ? '#E24B4A' : s.bc < 230 ? '#BA7517' : '#1D9E75'};font-weight:500">${s.bc}</td>
      <td style="color:${s.settle > 20 ? '#E24B4A' : s.settle > 15 ? '#BA7517' : 'var(--txt)'}">${s.settle} mm</td>
      <td>${s.moist}%</td><td>${s.temp}°C</td>
      <td style="color:${s.pore > 60 ? '#E24B4A' : s.pore > 50 ? '#BA7517' : 'var(--txt)'}">${s.pore} kPa</td>
      <td style="color:${(s.bc / 200) < 1 ? '#E24B4A' : '#1D9E75'}">${(s.bc / 200).toFixed(2)}</td>
      <td><span class="badge badge-${s.status === 'ok' ? 'ok' : s.status === 'warn' ? 'warn' : 'crit'}">${s.status}</span></td>
      <td style="font-size:10px;color:var(--txt3)">${s.protocol}</td>
      <td style="font-size:10px;color:var(--txt3)">${Math.ceil(Math.random() * 5)}s ago</td>
    </tr>`).join('');
}

function initSensorHealth() {
  document.getElementById('sensorHealth').innerHTML = SENSORS.map(s => `
    <div class="sensor-card ${s.status}">
      <div style="font-size:10px;font-weight:500;color:var(--txt2);margin-bottom:3px">${s.id}</div>
      <div style="font-size:15px;font-weight:500;color:${s.status === 'ok' ? '#1D9E75' : s.status === 'warn' ? '#BA7517' : '#E24B4A'}">${s.bc}</div>
      <div style="font-size:9px;color:var(--txt3)">kPa · ${s.depth}</div>
    </div>`).join('');
}

function initCalibTable() {
  document.getElementById('calibTbody').innerHTML = CALIB.map(c => `
    <tr>
      <td style="font-family:monospace">${c.id}</td><td>${c.last}</td><td>${c.next}</td><td>${c.std}</td>
      <td style="color:${parseFloat(c.drift) > 1.5 ? '#BA7517' : 'var(--txt)'}">${c.drift}</td>
      <td><span class="badge badge-${c.status === 'ok' ? 'ok' : 'warn'}">${c.status === 'ok' ? 'OK' : 'Due soon'}</span></td>
    </tr>`).join('');
}

function initAnalyticsSummary() {
  document.getElementById('settleSummary').innerHTML = SENSORS.map(s => `
    <div class="pb-row"><span class="pb-lbl">${s.id}</span>
    <div class="pb-track"><div class="pb-fill" style="width:${Math.round(s.settle / 25 * 100)}%;background:${s.settle > 20 ? '#E24B4A' : s.settle > 15 ? '#BA7517' : '#1D9E75'}"></div></div>
    <span class="pb-pct" style="font-size:10px">${s.settle}mm</span></div>`).join('');

  document.getElementById('soilClass').innerHTML = `<div style="display:flex;flex-direction:column;gap:4px;font-size:11px">
    ${[['Dense gravel','Zone D,E','#1D9E75'],['Stiff clay','Zone A,F','#378ADD'],['Medium sand','Zone B','#BA7517'],['Soft silt','Zone C','#E24B4A']].map(([t, z, c]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:0.5px solid var(--bdr)">
      <span style="color:var(--txt)">${t}</span>
      <span style="font-size:9px;padding:2px 6px;background:${c}22;color:${c};border-radius:10px">${z}</span>
    </div>`).join('')}</div>`;

  document.getElementById('lbiSummary').innerHTML = [
    {l:'Zone A',v:82,c:'#1D9E75'},{l:'Zone B',v:63,c:'#BA7517'},
    {l:'Zone C',v:38,c:'#E24B4A'},{l:'Zone D',v:88,c:'#1D9E75'},
    {l:'Zone E',v:95,c:'#1D9E75'},{l:'Zone F',v:71,c:'#378ADD'}
  ].map(r => `<div class="pb-row"><span class="pb-lbl">${r.l}</span>
    <div class="pb-track"><div class="pb-fill" style="width:${r.v}%;background:${r.c}"></div></div>
    <span class="pb-pct">${r.v}</span></div>`).join('');
}

function initMaintTable() {
  document.getElementById('maintTbody').innerHTML = MAINT.map(m => `
    <tr>
      <td>${m.task}</td><td>${m.zone}</td>
      <td><span class="badge badge-${m.pr === 'crit' ? 'crit' : m.pr === 'warn' ? 'warn' : 'ok'}">${m.pr === 'crit' ? 'critical' : m.pr === 'warn' ? 'warning' : 'normal'}</span></td>
      <td>${m.due}</td><td>${m.cost}</td><td style="font-size:10px;color:var(--txt3)">${m.std}</td>
      <td style="color:${m.status === 'Overdue' ? '#E24B4A' : m.status === 'Scheduled' ? '#BA7517' : 'var(--txt2)'};font-size:10px">${m.status}</td>
    </tr>`).join('');
}

function liveTick() {
  const n = () => (Math.random() - 0.5) * 4;
  document.getElementById('m-bearing').textContent = Math.round(247 + n());
  document.getElementById('m-settle').textContent = (14.3 + Math.random() * 0.2).toFixed(1);
  document.getElementById('m-moisture').textContent = (23.6 + n() * 0.3).toFixed(1);
  document.getElementById('m-vib').textContent = (0.032 + Math.random() * 0.005).toFixed(3);
  document.getElementById('m-pore').textContent = Math.round(42 + n());
  document.getElementById('m-dqi').textContent = Math.round(94 + n() * 0.5);
  document.getElementById('syncTime').textContent = 'Last sync: ' + new Date().toLocaleTimeString();
}
