// Runtime smoke test: loads index.html + all JS modules into a real
// DOM (jsdom) and executes the boot sequence, catching any reference
// errors that pure static analysis (node --check) can't detect.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Safety valve: if anything hangs (e.g. a stray timer/network attempt),
// force-exit after 8s so the test harness itself never blocks the caller.
const guard = setTimeout(() => {
  console.log('TIMEOUT_GUARD_FIRED — something kept the event loop alive. Forcing exit.');
  process.exit(3);
}, 8000);
if (guard.unref) guard.unref();

// Stub out canvas so Chart.js / drawDigitalTwin don't crash on missing getContext
const canvasStub = `
HTMLCanvasElement.prototype.getContext = function() {
  return {
    clearRect(){}, fillRect(){}, strokeRect(){}, beginPath(){}, arc(){}, fill(){},
    stroke(){}, moveTo(){}, lineTo(){}, fillText(){}, closePath(){}, save(){}, restore(){},
    translate(){}, rotate(){}, scale(){}, measureText(){ return {width:0}; },
    createLinearGradient(){ return { addColorStop(){} }; }, drawImage(){}, setTransform(){},
    getImageData(){ return {data:[]}; }, putImageData(){}, canvas:{width:0,height:0}
  };
};
`;

const html = fs.readFileSync('../index.html', 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  resources: undefined,
  pretendToBeVisual: true
});

const { window } = dom;
window.eval(canvasStub);

// Stub Chart.js and Leaflet (loaded via CDN in real browser — not fetched here)
window.eval(`
  window.Chart = function(){ return { data:{labels:[],datasets:[]}, update(){} }; };
  window.L = {
    map: () => ({ setView(){return this;}, on(){return this;}, off(){}, dragging:{disable(){},enable(){}}, invalidateSize(){}, addLayer(){}, removeLayer(){} }),
    tileLayer: () => ({ addTo(){return this;} }),
    control: { layers: () => ({ addTo(){return this;} }) },
    polygon: () => ({ addTo(){return this;}, bindPopup(){return this;} }),
    marker: () => ({ addTo(){return this;}, bindPopup(){return this;}, setIcon(){} }),
    circleMarker: () => ({ addTo(){return this;}, bindPopup(){return this;}, openPopup(){} }),
    circle: () => ({ addTo(){return this;}, bindPopup(){return this;}, getLatLng(){return {distanceTo(){return 0;}};}, getRadius(){return 1;} }),
    rectangle: () => ({ addTo(){return this;}, bindPopup(){return this;}, getBounds(){return {contains(){return false;}, getNorthEast(){return {distanceTo(){return 0;}};}, getNorthWest(){return {};}, getSouthEast(){return {};}};} }),
    divIcon: () => ({}),
    latLng: (a,b) => ({ distanceTo(){ return 0; } }),
    Circle: function(){},
    polyline: () => ({ addTo(){return this;} })
  };
`);

// Load and execute each JS module in order (mirrors index.html <script> order)
const modules = [
  '../js/data.js', '../js/siren.js', '../js/alarm.js', '../js/dashboard.js', '../js/charts.js',
  '../js/twin.js', '../js/compliance.js', '../js/remedial.js', '../js/report.js',
  '../js/map.js', '../js/ai-engine.js', '../js/app.js'
];

// NOTE: concatenate all modules into a single eval() call. Real browsers
// share one Script Global Environment Record across sequential <script>
// tags (so `const` in module A is visible in module B) — but jsdom's
// window.eval() creates a fresh lexical scope per call, which would give
// false "X is not defined" errors if each module were eval'd separately.
let errors = [];
const combined = modules.map(m => fs.readFileSync(m, 'utf8')).join('\n;\n');
try {
  window.eval(combined + '\n;\nboot();');
} catch (e) {
  errors.push(`module load / boot(): ${e.message}`);
}

// Exercise tab switching for every nav tab (this triggers lazy-init functions).
// Chained in one eval string for the same scope-sharing reason as above.
const tabs = ['dashboard', 'sensors', 'analytics', 'map', 'twin', 'ai', 'compliance', 'remedial', 'alerts', 'report'];
const tabCalls = tabs.map(t => `
  try { switchTab('${t}', document.querySelector('[onclick*="switchTab(\\'${t}\\'"]')); }
  catch(e){ __errors.push("switchTab('${t}'): " + e.message); }
`).join('\n');

try {
  window.eval(`window.__errors = [];\n${tabCalls}`);
  errors.push(...window.__errors);
} catch (e) {
  errors.push(`tab switching block: ${e.message}`);
}

// Exercise AI chat + export functions in the same shared scope
try {
  window.eval(`
    window.__errors2 = [];
    try { document.getElementById('chatInput').value = 'analyze current readings'; sendChat(); }
    catch(e){ __errors2.push('sendChat(): ' + e.message); }
    try { exportJSON(); } catch(e){ __errors2.push('exportJSON(): ' + e.message); }
    try { exportCSV(); } catch(e){ __errors2.push('exportCSV(): ' + e.message); }
  `);
  errors.push(...window.__errors2);
} catch (e) {
  errors.push(`ai/export block: ${e.message}`);
}

if (errors.length) {
  console.log('FAIL — runtime errors found:');
  errors.forEach(e => console.log('  - ' + e));
  process.exit(1);
} else {
  console.log('PASS — all 12 modules loaded, boot() ran, all 10 tabs switched,');
  console.log('       AI chat + JSON/CSV export executed. Zero runtime errors.');
  console.log('');
  console.log('Note: jsdom has no Web Audio API or data:-URI navigation support,');
  console.log('so the siren and file-download calls log benign jsdom warnings');
  console.log('after this point — both work normally in a real browser.');
  process.exit(0);
}
