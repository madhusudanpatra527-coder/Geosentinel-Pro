/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Chart.js Visualisations
   ═══════════════════════════════════════════════════════════════ */

function co() {
  return {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 10 } } },
      y: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 10 } } }
    }
  };
}

function initCharts() {
  const hrs = Array.from({ length: 21 }, (_, i) => `${(new Date().getHours() - 20 + i + 24) % 24}h`).concat(['Now', '+2h', '+4h', '+6h']);
  const bc = [261,258,255,259,263,260,257,254,252,248,251,249,247,243,241,244,248,251,249,246,243,241,244,247];
  new Chart(document.getElementById('chartBearing'), { type: 'line', data: { labels: hrs, datasets: [
    { data: [...bc.slice(0, 21), ...Array(3).fill(null)], borderColor: '#378ADD', borderWidth: 2, pointRadius: 0, tension: .3, fill: false },
    { data: Array(hrs.length).fill(200), borderColor: '#E24B4A', borderWidth: 1, borderDash: [4, 4], pointRadius: 0, fill: false },
    { data: [...Array(20).fill(null), bc[20], 245, 243, 241], borderColor: '#5DCAA5', borderWidth: 1.5, borderDash: [2, 2], pointRadius: 0, tension: .3, fill: false },
  ] }, options: { ...co(), scales: { ...co().scales, y: { ...co().scales.y, min: 150, max: 330 } } } });

  new Chart(document.getElementById('chartSettle'), { type: 'line', data: {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{ data: [8.2, 9.8, 11.1, 12.4, 13.2, 14.3, 14.3], borderColor: '#BA7517', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#BA7517', tension: .3, fill: true, backgroundColor: 'rgba(186,117,23,0.08)' }]
  }, options: { ...co(), scales: { ...co().scales, y: { ...co().scales.y, min: 0, max: 30, ticks: { ...co().scales.y.ticks, callback: v => v + 'mm' } } } } });

  const tl = Array.from({ length: 13 }, (_, i) => i === 0 ? '00:00' : i === 12 ? 'Now' : `${i * 2}h`);
  new Chart(document.getElementById('chartMoist'), { type: 'line', data: { labels: tl, datasets: [
    { data: [22, 23, 23, 24, 25, 26, 25, 24, 23, 24, 24, 23, 24], borderColor: '#185FA5', borderWidth: 2, pointRadius: 0, tension: .3, fill: false, yAxisID: 'y' },
    { data: [28.2, 28.0, 27.8, 27.6, 27.5, 27.8, 28.1, 28.4, 28.6, 28.5, 28.4, 28.5, 28.4], borderColor: '#D85A30', borderWidth: 1.5, pointRadius: 0, tension: .3, fill: false, yAxisID: 'y2', borderDash: [3, 2] }
  ] }, options: { ...co(), scales: {
    x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 10 } } },
    y: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#378ADD', font: { size: 10 }, callback: v => v + '%' }, position: 'left' },
    y2: { ticks: { color: '#D85A30', font: { size: 10 }, callback: v => v + '°' }, position: 'right', grid: { display: false } }
  } } });

  const bz = [261, 210, 227, 287, 374, 236];
  new Chart(document.getElementById('chartZone'), { type: 'bar', data: {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'],
    datasets: [{ data: bz, backgroundColor: bz.map(v => v < 200 ? '#F09595' : v < 250 ? '#FAC775' : '#9FE1CB'), borderWidth: 0, borderRadius: 4 }]
  }, options: { ...co(), scales: { ...co().scales, y: { ...co().scales.y, min: 0, max: 450, ticks: { ...co().scales.y.ticks, callback: v => v + ' kPa' } } } } });

  new Chart(document.getElementById('chartRisk'), { type: 'line', data: {
    labels: Array.from({ length: 31 }, (_, i) => 'D' + (i + 1)),
    datasets: [
      { data: Array.from({ length: 31 }, (_, i) => Math.round(Math.min(85, 28 + i * 1.8))), borderColor: '#BA7517', borderWidth: 2, pointRadius: 0, tension: .4, fill: false },
      { data: Array.from({ length: 31 }, (_, i) => Math.round(Math.min(92, 42 + i * 1.5))), borderColor: '#E24B4A', borderWidth: 2, pointRadius: 0, tension: .4, fill: false },
      { data: Array.from({ length: 31 }, (_, i) => Math.round(Math.max(5, 18 - i * .3))), borderColor: '#1D9E75', borderWidth: 1.5, pointRadius: 0, tension: .4, fill: false },
    ]
  }, options: { ...co(), scales: { ...co().scales, y: { ...co().scales.y, min: 0, max: 100, ticks: { ...co().scales.y.ticks, callback: v => v + '%' } } } } });

  const caps = [310, 285, 260, 248, 231, 142, 388];
  new Chart(document.getElementById('chartDepth'), { type: 'bar', data: {
    labels: ['0.5m', '1.0m', '1.5m', '2.0m', '3.0m', '4.5m', '6.0m'],
    datasets: [{ data: caps, backgroundColor: caps.map(v => v < 180 ? '#F09595' : v < 250 ? '#FAC775' : '#9FE1CB'), borderWidth: 0, borderRadius: 3 }]
  }, options: { ...co(), indexAxis: 'y', scales: {
    x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 10 }, callback: v => v + ' kPa' }, min: 0, max: 450 },
    y: { grid: { display: false }, ticks: { color: '#888', font: { size: 10 } } }
  } } });
}
