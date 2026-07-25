/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — International Standards Compliance Panel
   ═══════════════════════════════════════════════════════════════ */

function buildCompliance() {
  const items = [
    { name: 'IS 6403:1981', desc: 'Net safe bearing capacity', rows: [['Site avg FOS', '1.24 (min 3.0)', 'fail'], ['Zone C FOS', '0.71', 'fail'], ['Zones A,D,E FOS', '1.3–1.9', 'partial']], status: 'fail' },
    { name: 'IS 1904:1986', desc: 'Foundation design', rows: [['Settlement (max)', '22.4mm / 25mm limit', 'partial'], ['Differential', '15.2mm / 18mm limit', 'partial'], ['Monitoring freq.', 'Continuous (4hr alert)', 'pass']], status: 'partial' },
    { name: 'Eurocode 7 EN 1997', desc: 'Geotechnical design', rows: [['GEO limit state', 'Zone C failing', 'fail'], ['DA1 check', 'BC < design action', 'fail'], ['Monitoring plan', 'IS 22476 compliant', 'pass']], status: 'fail' },
    { name: 'ISO 22476', desc: 'Geotechnical investigation', rows: [['Sensor calibration', 'S-03,S-04 overdue', 'partial'], ['Data logging', 'Continuous — OK', 'pass'], ['SPT correlation', 'Verified at 3 BH', 'pass']], status: 'partial' },
    { name: 'IEC 61511 SIL 2', desc: 'Functional safety', rows: [['PFD avg', '1.2×10⁻³ (SIL 2)', 'pass'], ['Proof test interval', '12 months', 'pass'], ['Redundancy', 'Dual sensor zones', 'pass']], status: 'pass' },
    { name: 'ISO 9001:2015', desc: 'Quality management', rows: [['Data quality index', '94% (target 95%)', 'partial'], ['Calibration records', '7/9 sensors current', 'partial'], ['Audit trail', 'Enabled — logged', 'pass']], status: 'partial' },
  ];

  document.getElementById('complianceGrid').innerHTML = items.map(item => `
    <div class="compliance-card">
      <div class="comp-header">
        <div>
          <div class="comp-name">${item.name}</div>
          <div style="font-size:10px;color:var(--txt2)">${item.desc}</div>
        </div>
        <span class="comp-status comp-${item.status}">${item.status === 'pass' ? 'Compliant' : item.status === 'partial' ? 'Partial' : 'Non-compliant'}</span>
      </div>
      ${item.rows.map(r => `<div class="comp-row"><span>${r[0]}</span><span class="comp-val" style="color:${r[2] === 'fail' ? 'var(--crit)' : r[2] === 'partial' ? 'var(--warn)' : 'var(--ok)'}">${r[1]}</span></div>`).join('')}
    </div>`).join('');

  document.getElementById('qaPanel').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:5px;font-size:11px">
      ${[['Data completeness', '94%', '#1D9E75'], ['Sensor uptime', '99.7%', '#1D9E75'], ['Calibration compliance', '78%', '#BA7517'], ['Alert response time', '< 2 min', '#1D9E75'], ['Audit log retention', '365 days', '#1D9E75'], ['Report generation', 'Auto / manual', '#378ADD']].map(([k, v, c]) => `
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--bdr)">
        <span style="color:var(--txt2)">${k}</span>
        <span style="color:${c};font-weight:500">${v}</span>
      </div>`).join('')}
    </div>`;
}
