/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Digital Twin
   2D canvas cross-section: soil layers, per-zone bearing capacity
   bars, and sensor nodes plotted at their true installation depth.
   ═══════════════════════════════════════════════════════════════ */

function drawDigitalTwin() {
  const c = document.getElementById('dtCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = 280;
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);

  const zones = [
    { name: 'A', bc: 261, x: .08 }, { name: 'B', bc: 210, x: .22 }, { name: 'C', bc: 142, x: .36 },
    { name: 'D', bc: 287, x: .50 }, { name: 'E', bc: 374, x: .64 }, { name: 'F', bc: 236, x: .78 }
  ];
  const layers = [
    { depth: 'Surface', y: .08, color: '#D3D1C7' },
    { depth: '0.5m', y: .18, color: '#B4B2A9' },
    { depth: '1.5m', y: .30, color: '#888780' },
    { depth: '3.0m', y: .46, color: '#5F5E5A' },
    { depth: '4.5m', y: .62, color: '#444441' },
    { depth: '6.0m', y: .78, color: '#2C2C2A' },
  ];

  layers.forEach((l, i) => {
    const y0 = H * l.y, y1 = i < layers.length - 1 ? H * layers[i + 1].y : H * .92;
    ctx.fillStyle = l.color + '44';
    ctx.fillRect(50, y0, W - 100, y1 - y0);
    ctx.fillStyle = '#888';
    ctx.font = '9px sans-serif';
    ctx.fillText(l.depth, 5, y0 + 10);
    ctx.strokeStyle = 'rgba(128,128,128,0.2)';
    ctx.beginPath(); ctx.moveTo(50, y0); ctx.lineTo(W - 50, y0); ctx.stroke();
  });

  zones.forEach(z => {
    const x = W * z.x;
    const maxH = H * .55;
    const barH = (z.bc / 400) * maxH;
    const col = z.bc > 250 ? '#1D9E75' : z.bc > 200 ? '#BA7517' : '#E24B4A';
    ctx.fillStyle = col + 'cc';
    ctx.fillRect(x - 18, H * .9 - barH, 36, barH);
    ctx.strokeStyle = col;
    ctx.strokeRect(x - 18, H * .9 - barH, 36, barH);
    ctx.fillStyle = '#444';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Z' + z.name, x, H * .94);
    ctx.fillStyle = col;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(z.bc, x, H * .9 - barH - 4);
  });

  SENSORS.forEach(s => {
    const zI = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(s.loc.charAt(5));
    if (zI < 0) return;
    const x = W * (zones[zI]?.x || .5);
    const depthPct = { '1.5m': .30, '2.0m': .36, '3.0m': .46, '4.5m': .62, '6.0m': .78 }[s.depth] || .3;
    const y = H * depthPct;
    const col = s.status === 'crit' ? '#E24B4A' : s.status === 'warn' ? '#BA7517' : '#1D9E75';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(s.id.split('-')[1], x, y + 2.5);
  });

  ctx.fillStyle = 'rgba(128,128,128,0.6)';
  ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Bearing capacity (kPa) — bar height = capacity', 50, H * .06);
  ctx.fillText('Coloured dots = sensor nodes at installation depth', 50, H * .15);

  document.getElementById('twinUpdate').textContent = new Date().toLocaleTimeString();

  document.getElementById('layerModel').innerHTML = [
    { d: '0–1.5m', t: 'Topsoil / fill', n: '8–12', col: '#B4B2A9' },
    { d: '1.5–3.0m', t: 'Medium clay', n: '12–18', col: '#888780' },
    { d: '3.0–4.5m', t: 'Silty sand', n: '8–14', col: '#5F5E5A' },
    { d: '4.5–6.0m', t: 'Soft silt (weak)', n: '4–8', col: '#E24B4A' },
    { d: '6.0m+', t: 'Dense gravel', n: '30+', col: '#1D9E75' },
  ].map(l => `<div style="display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:0.5px solid var(--bdr);font-size:11px">
    <div style="width:28px;height:12px;background:${l.col}55;border-left:3px solid ${l.col};border-radius:2px;flex-shrink:0"></div>
    <div><div style="color:var(--txt)">${l.d} — ${l.t}</div><div style="color:var(--txt3);font-size:9px">SPT N = ${l.n}</div></div>
  </div>`).join('');

  document.getElementById('fmaPanel').innerHTML = [
    'General shear failure (Zone C) — Probability: HIGH (FOS 0.71)',
    'Punching shear (Zone B) — Probability: MODERATE',
    'Progressive settlement (Zone B, C) — Rate: 0.8mm/week',
    'Liquefaction (Zone C, Seismic Zone III) — Risk: MODERATE',
    'Slope instability — No slopes within 15m, risk: LOW',
  ].map((t, i) => `<div style="padding:3px 0;border-bottom:0.5px solid var(--bdr);color:${i < 2 ? 'var(--crit)' : i === 2 ? 'var(--warn)' : 'var(--txt2)'};font-size:11px">${t}</div>`).join('');
}

window.addEventListener('resize', () => {
  const sec = document.getElementById('sec-twin');
  if (sec && sec.classList.contains('active')) drawDigitalTwin();
});
