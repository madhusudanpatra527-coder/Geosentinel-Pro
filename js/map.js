/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Map & Geofencing Engine
   Built directly on Leaflet's native event API (no leaflet.draw
   plugin) to avoid async-load race conditions. Supports polygon,
   rectangle, and circle geofences with live sensor-inside checks.
   ═══════════════════════════════════════════════════════════════ */

let geoMap = null, mapInit = false;
let drawMode = null, polyPoints = [], tempLayers = [], fences = [];
let polyLine = null, rectLayer = null, isRect = false, rectStart = null, circLayer = null, circCenter = null;

function initMap() {
  if (mapInit) return;
  mapInit = true;

  geoMap = L.map('mapContainer', { center: [21.1997, 86.1201], zoom: 16 });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(geoMap);

  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri', maxZoom: 19 });
  L.control.layers(
    { 'Street': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM', maxZoom: 19 }), 'Satellite': sat },
    {}, { position: 'topright' }
  ).addTo(geoMap);

  L.polygon([[21.2018, 86.1168], [21.2018, 86.1234], [21.1955, 86.1234], [21.1955, 86.1168]], {
    color: '#5F5E5A', weight: 1.5, dashArray: '6 4', fillOpacity: .03
  }).addTo(geoMap).bindPopup('<b>Site perimeter</b><br>Baripada Geotechnical Site<br>GS-OD-2024-001');

  const markerMap = {};
  function makeIcon(st) {
    const c = st === 'crit' ? '#E24B4A' : st === 'warn' ? '#BA7517' : '#1D9E75';
    const sz = st === 'crit' ? 18 : 15;
    return L.divIcon({
      className: '',
      html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${c};border:2.5px solid #fff;box-shadow:0 0 0 2px ${c}55;${st === 'crit' ? 'animation:critpulse .8s infinite' : ''}"></div>`,
      iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2], popupAnchor: [0, -sz / 2]
    });
  }

  SENSORS.forEach(s => {
    const mk = L.marker([s.lat, s.lng], { icon: makeIcon(s.status) }).addTo(geoMap);
    mk.bindPopup(`<div style="min-width:165px"><div style="font-size:12px;font-weight:500;margin-bottom:5px;color:#1a1a1a">${s.id} — ${s.loc}</div>
      <div style="font-size:10px;line-height:1.9;color:#5f5e5a">
        Bearing: <span class="sp-${s.status}">${s.bc} kPa</span><br>Settlement: ${s.settle} mm<br>Moisture: ${s.moist}%<br>
        Pore pressure: ${s.pore} kPa<br>Temp: ${s.temp}°C<br>Depth: ${s.depth}<br>Protocol: ${s.protocol}<br>
        FOS: <span class="sp-${s.status}">${(s.bc / 200).toFixed(2)}</span><br>
        Status: <span class="sp-${s.status}">${s.status.toUpperCase()}</span>
      </div></div>`, { maxWidth: 200 });
    markerMap[s.id] = mk;
  });

  setInterval(() => { SENSORS.forEach(s => { if (markerMap[s.id]) markerMap[s.id].setIcon(makeIcon(s.status)); }); }, 5000);
  updateFenceStats();
}

function makeVertex(ll) { return L.circleMarker(ll, { radius: 4, color: '#185FA5', fillColor: '#185FA5', fillOpacity: 1, weight: 1.5 }); }
function clearTemp() { tempLayers.forEach(l => geoMap.removeLayer(l)); tempLayers = []; }

function cancelDraw() {
  clearTemp();
  polyPoints = []; rectStart = null; circCenter = null;
  if (polyLine) { geoMap.removeLayer(polyLine); polyLine = null; }
  if (rectLayer) { geoMap.removeLayer(rectLayer); rectLayer = null; }
  if (circLayer) { geoMap.removeLayer(circLayer); circLayer = null; }
  setDrawMode(null);
  geoMap.off('click', onPolyClick); geoMap.off('dblclick', onPolyDbl);
  geoMap.off('mousedown', onRectDown); geoMap.off('mousemove', onRectMove); geoMap.off('mouseup', onRectUp);
  geoMap.off('mousemove', onCircMove); geoMap.off('click', onCircClick);
}

function setDrawMode(m) {
  drawMode = m;
  ['btnPoly', 'btnRect', 'btnCirc'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.remove('ondraw'); });
  const bc = document.getElementById('btnCancel');
  if (bc) bc.style.display = m ? 'inline-flex' : 'none';
  const hints = { polygon: 'Click to add polygon vertices. Double-click to close and save the geofence.', rectangle: 'Click and drag on the map to draw a rectangular surveillance zone.', circle: 'Click once for the centre, again to set the radius.', null: 'Select Polygon, Rectangle, or Circle to draw a surveillance geofence.' };
  const mh = document.getElementById('mapHint'); if (mh) mh.textContent = hints[m] || hints[null];
  if (m) {
    const id = 'btn' + ({ polygon: 'Poly', rectangle: 'Rect', circle: 'Circ' }[m]);
    const b = document.getElementById(id); if (b) b.classList.add('ondraw');
    document.getElementById('mapContainer')?.classList.remove('default-cursor');
  } else {
    document.getElementById('mapContainer')?.classList.add('default-cursor');
  }
}

function startDraw(type) {
  if (!mapInit) { initMap(); setTimeout(() => startDraw(type), 300); return; }
  cancelDraw(); setDrawMode(type);
  if (type === 'polygon') { geoMap.on('click', onPolyClick); geoMap.on('dblclick', onPolyDbl); }
  else if (type === 'rectangle') { geoMap.on('mousedown', onRectDown); }
  else { geoMap.on('click', onCircClick); }
}

function onPolyClick(e) {
  if (e.originalEvent?.detail >= 2) return;
  polyPoints.push(e.latlng);
  const v = makeVertex(e.latlng).addTo(geoMap); tempLayers.push(v);
  if (polyPoints.length >= 2) {
    if (polyLine) geoMap.removeLayer(polyLine);
    polyLine = L.polyline(polyPoints, { color: document.getElementById('zcol').value, weight: 2, dashArray: '4 3' }).addTo(geoMap);
    tempLayers.push(polyLine);
  }
}
function onPolyDbl(e) {
  if (polyPoints.length < 3) { cancelDraw(); return; }
  polyPoints.pop();
  clearTemp(); polyLine = null;
  geoMap.off('click', onPolyClick); geoMap.off('dblclick', onPolyDbl);
  finaliseFence(L.polygon(polyPoints, fenceStyle()));
  setDrawMode(null);
}
function onRectDown(e) { isRect = true; rectStart = e.latlng; geoMap.dragging.disable(); geoMap.on('mousemove', onRectMove); geoMap.on('mouseup', onRectUp); }
function onRectMove(e) { if (!isRect || !rectStart) return; if (rectLayer) geoMap.removeLayer(rectLayer); rectLayer = L.rectangle([rectStart, e.latlng], fenceStyle()).addTo(geoMap); }
function onRectUp(e) {
  isRect = false; geoMap.dragging.enable();
  geoMap.off('mousemove', onRectMove); geoMap.off('mouseup', onRectUp); geoMap.off('mousedown', onRectDown);
  if (rectLayer && rectStart && rectStart.distanceTo(e.latlng) > 15) { const l = rectLayer; rectLayer = null; rectStart = null; finaliseFence(l); }
  else { if (rectLayer) { geoMap.removeLayer(rectLayer); rectLayer = null; } }
  setDrawMode(null);
}
function onCircClick(e) {
  if (!circCenter) { circCenter = e.latlng; const v = makeVertex(e.latlng).addTo(geoMap); tempLayers.push(v); geoMap.on('mousemove', onCircMove); }
  else {
    const r = circCenter.distanceTo(e.latlng);
    clearTemp(); if (circLayer) geoMap.removeLayer(circLayer);
    if (r > 10) finaliseFence(L.circle(circCenter, { radius: r, ...fenceStyle() }));
    circCenter = null; circLayer = null;
    geoMap.off('mousemove', onCircMove); geoMap.off('click', onCircClick);
    setDrawMode(null);
  }
}
function onCircMove(e) { if (!circCenter) return; if (circLayer) geoMap.removeLayer(circLayer); circLayer = L.circle(circCenter, { radius: circCenter.distanceTo(e.latlng), ...fenceStyle() }).addTo(geoMap); }

function fenceStyle() { const c = document.getElementById('zcol')?.value || '#185FA5'; return { color: c, weight: 2, fillColor: c, fillOpacity: .14 }; }

function sensorsIn(layer) {
  return SENSORS.filter(s => {
    const pt = L.latLng(s.lat, s.lng);
    if (layer instanceof L.Circle) return layer.getLatLng().distanceTo(pt) <= layer.getRadius();
    if (layer.getBounds) return layer.getBounds().contains(pt);
    return false;
  }).map(s => s.id);
}

function areaOf(layer) {
  if (layer instanceof L.Circle) return Math.PI * Math.pow(layer.getRadius(), 2);
  if (layer.getBounds) { const b = layer.getBounds(); return b.getNorthEast().distanceTo(b.getNorthWest()) * b.getNorthEast().distanceTo(b.getSouthEast()); }
  return 0;
}

function finaliseFence(layer) {
  layer.addTo(geoMap);
  const name = document.getElementById('zname')?.value.trim() || ('Zone ' + (fences.length + 1));
  const col = document.getElementById('zcol')?.value || '#185FA5';
  const ins = sensorsIn(layer);
  const area = areaOf(layer);
  fences.push({ name, col, layer, ins, area });
  if (document.getElementById('zname')) document.getElementById('zname').value = '';
  const crits = ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'crit').length;
  const warns = ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'warn').length;
  layer.bindPopup(`<b>${name}</b><br>${ins.length} sensors · ${crits} critical · ${warns} warning<br>Area: ${Math.round(area).toLocaleString()} m²`);
  renderFences(); updateFenceStats();
  addAudit(`Geofence "${name}" drawn — ${ins.length} sensors enclosed (${crits} crit, ${warns} warn)`);
  if (crits) { showAlarm('crit', `GEOFENCE ALERT — "${name}": critical sensor(s) ${ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'crit').join(', ')} enclosed`, `${ins.length} sensors in zone · IS 6403 threshold breached · Bearing capacity failure risk`); }
  else if (warns) { showAlarm('warn', `GEOFENCE WARNING — "${name}": ${ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'warn').join(', ')} enclosed`, `${ins.length} sensors in zone · ${warns} warning-level sensors`); }
}

function renderFences() {
  const el = document.getElementById('fenceList');
  if (!el) return;
  if (!fences.length) { el.innerHTML = '<div style="font-size:11px;color:var(--txt3);padding:5px 0">No zones drawn yet.</div>'; return; }
  el.innerHTML = fences.map((f, i) => {
    const cr = f.ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'crit').length;
    const wa = f.ins.filter(id => SENSORS.find(s => s.id === id)?.status === 'warn').length;
    const sc = cr ? '#E24B4A' : wa ? '#BA7517' : '#1D9E75';
    const st = cr ? `${cr} critical` : wa ? `${wa} warn` : 'clear';
    return `<div class="fence-row"><div class="fence-dot" style="background:${f.col}"></div>
      <div style="flex:1;min-width:0"><div style="font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</div>
      <div style="font-size:10px;color:var(--txt2)">${f.ins.length} sensors · <span style="color:${sc};font-weight:500">${st}</span></div></div>
      <button class="fence-del" onclick="deleteFence(${i})">✕</button></div>`;
  }).join('');
}

function deleteFence(i) { geoMap.removeLayer(fences[i].layer); fences.splice(i, 1); renderFences(); updateFenceStats(); addAudit('Geofence removed by operator'); }
function clearAllFences() { fences.forEach(f => geoMap.removeLayer(f.layer)); fences = []; cancelDraw(); renderFences(); updateFenceStats(); addAudit('All geofences cleared'); }

function updateFenceStats() {
  const all = [...new Set(fences.flatMap(f => f.ins))];
  const area = fences.reduce((a, f) => a + f.area, 0);
  const cr = SENSORS.filter(s => s.status === 'crit').length;
  document.getElementById('ms-zones').textContent = fences.length;
  document.getElementById('ms-fenced').textContent = all.length;
  document.getElementById('ms-alarms').textContent = cr;
  document.getElementById('ms-area').textContent = area > 0 ? Math.round(area).toLocaleString() + ' m²' : '—';
}

function locateMe() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    p => { geoMap.setView([p.coords.latitude, p.coords.longitude], 16); L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 7, color: '#185FA5', fillColor: '#185FA5', fillOpacity: .7 }).addTo(geoMap).bindPopup('Your location').openPopup(); },
    () => geoMap.setView([21.1997, 86.1201], 16)
  );
}
function gotoCoords() {
  const la = parseFloat(document.getElementById('inLat').value);
  const ln = parseFloat(document.getElementById('inLng').value);
  if (!isNaN(la) && !isNaN(ln)) geoMap.setView([la, ln], 16);
}
