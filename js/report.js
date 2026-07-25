/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Site Assessment Report & Data Export
   ═══════════════════════════════════════════════════════════════ */

function buildReport() {
  const avg = Math.round(SENSORS.reduce((a, s) => a + s.bc, 0) / SENSORS.length);
  const maxS = Math.max(...SENSORS.map(s => s.settle));
  const d = new Date().toLocaleString();

  document.getElementById('reportContent').innerHTML = `
    <div class="report-section">
      <h3>1. Executive summary</h3>
      <p style="font-size:11px;line-height:1.8;color:var(--txt2)">Site: Baripada Geotechnical Monitoring Station | Generated: ${d}<br>
      Status: <strong style="color:var(--crit)">HIGH RISK</strong> — 1 critical sensor, 2 warning sensors active.<br>
      Average bearing capacity: ${avg} kPa against IS 6403:1981 design threshold of 200 kPa.<br>
      Maximum settlement: ${maxS} mm against IS 1904:1986 limit of 25 mm.<br>
      Site-wide Factor of Safety: 1.24 — below IS 6403 requirement of 3.0.</p>
    </div>
    <div class="report-section">
      <h3>2. Critical findings</h3>
      <div style="font-size:11px;line-height:1.9;color:var(--txt2)">
        • S-05 [Zone C NW, 4.5m depth]: Bearing capacity 142 kPa — 43% below threshold. FOS = 0.71. Immediate ground improvement mandatory.<br>
        • S-04 [Zone B SE, 3.0m depth]: Moisture 34%, pore pressure 58 kPa — effective stress significantly reduced. Drainage required within 48 hours.<br>
        • S-03 [Zone B SW]: Settlement 16.2mm at 0.8mm/week acceleration. Will breach IS 1904 limit in approximately ${Math.round((25 - maxS) / (0.8 / 7))} days at current rate.
      </div>
    </div>
    <div class="report-section">
      <h3>3. Sensor data summary</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>BC (kPa)</th><th>Settlement</th><th>Moisture</th><th>FOS</th><th>Status</th></tr></thead>
        <tbody>${SENSORS.map(s => `<tr><td style="font-family:monospace">${s.id}</td><td style="color:${s.bc < 200 ? '#E24B4A' : s.bc < 230 ? '#BA7517' : '#1D9E75'}">${s.bc}</td><td>${s.settle}mm</td><td>${s.moist}%</td><td>${(s.bc / 200).toFixed(2)}</td><td><span class="badge badge-${s.status === 'ok' ? 'ok' : s.status === 'warn' ? 'warn' : 'crit'}">${s.status}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="report-section">
      <h3>4. Compliance status</h3>
      <div style="font-size:11px;line-height:1.9;color:var(--txt2)">
        IS 6403:1981: NON-COMPLIANT (FOS &lt; 3.0 site-wide) | IS 1904:1986: PARTIAL (settlement approaching limit) | Eurocode 7: NON-COMPLIANT (GEO limit state exceeded at Zone C) | ISO 22476: PARTIAL (calibration overdue S-03, S-04) | IEC 61511 SIL 2: COMPLIANT | ISO 9001:2015: PARTIAL (DQI 94%)
      </div>
    </div>
    <div class="report-section">
      <h3>5. Immediate actions required</h3>
      <div style="font-size:11px;line-height:1.9;color:var(--txt2)">
        1. URGENT: Physical load restriction + barricades at Zone C — today<br>
        2. Geotechnical engineer commission + plate load test (IS 1888) — within 24 hours<br>
        3. Drainage installation at Zone B — within 48 hours<br>
        4. Compaction grouting proposal for Zone C — within 5 working days<br>
        5. Sensor calibration — S-03, S-04 overdue (IS 22476)
      </div>
    </div>`;
  addAudit('Report generated — auto PDF-ready');
}

function exportJSON() {
  const data = { generated: new Date().toISOString(), site: 'GS-OD-2024-001', sensors: SENSORS, alerts: ALERTS };
  const a = document.createElement('a');
  a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(data, null, 2));
  a.download = 'geosentinel_export.json'; a.click();
  addAudit('JSON data export initiated by operator');
}

function exportCSV() {
  const header = 'ID,Location,Depth,BC_kPa,Settlement_mm,Moisture_pct,Temp_C,PorePressure_kPa,FOS,Status';
  const rows = SENSORS.map(s => `${s.id},${s.loc},${s.depth},${s.bc},${s.settle},${s.moist},${s.temp},${s.pore},${(s.bc / 200).toFixed(2)},${s.status}`);
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent([header, ...rows].join('\n'));
  a.download = 'geosentinel_sensors.csv'; a.click();
  addAudit('CSV data export initiated by operator');
}

function printReport() { window.print(); addAudit('Print/PDF initiated by operator'); }
