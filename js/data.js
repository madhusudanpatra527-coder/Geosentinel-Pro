/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Data Module
   Sensor telemetry, alerts, maintenance schedule, calibration log,
   and the cloud geotechnical remedial-measures database.
   ═══════════════════════════════════════════════════════════════ */

// Site: Baripada, Odisha, India — 21.1997°N, 86.1201°E
const SENSORS = [
  {id:'S-01',loc:'Zone A — NW',depth:'1.5m',bc:268,settle:12.1,moist:22,temp:28.4,pore:38,status:'ok',  protocol:'MQTT',   lat:21.2010,lng:86.1185},
  {id:'S-02',loc:'Zone A — NE',depth:'1.5m',bc:254,settle:13.8,moist:24,temp:28.1,pore:41,status:'ok',  protocol:'MQTT',   lat:21.2010,lng:86.1216},
  {id:'S-03',loc:'Zone B — SW',depth:'3.0m',bc:231,settle:16.2,moist:28,temp:27.2,pore:48,status:'warn', protocol:'Modbus', lat:21.1998,lng:86.1179},
  {id:'S-04',loc:'Zone B — SE',depth:'3.0m',bc:189,settle:19.7,moist:34,temp:27.0,pore:58,status:'warn', protocol:'Modbus', lat:21.1998,lng:86.1222},
  {id:'S-05',loc:'Zone C — NW',depth:'4.5m',bc:142,settle:22.4,moist:38,temp:26.5,pore:67,status:'crit', protocol:'Modbus', lat:21.1986,lng:86.1188},
  {id:'S-06',loc:'Zone C — NE',depth:'4.5m',bc:312,settle:9.8, moist:19,temp:29.2,pore:32,status:'ok',  protocol:'OPC-UA', lat:21.1986,lng:86.1213},
  {id:'S-07',loc:'Zone D — SW',depth:'2.0m',bc:278,settle:11.3,moist:21,temp:28.8,pore:36,status:'ok',  protocol:'MQTT',   lat:21.1975,lng:86.1192},
  {id:'S-08',loc:'Zone D — SE',depth:'2.0m',bc:295,settle:10.5,moist:20,temp:29.0,pore:34,status:'ok',  protocol:'MQTT',   lat:21.1975,lng:86.1209},
  {id:'S-09',loc:'Zone E — N', depth:'6.0m',bc:388,settle:7.2, moist:17,temp:25.8,pore:28,status:'ok',  protocol:'OPC-UA', lat:21.1963,lng:86.1201},
];

const ALERTS = [
  {sev:'crit',msg:'S-05 Zone C NW: Bearing capacity 142 kPa — 43% below IS 6403 design threshold. Immediate inspection required.',time:'2 min ago'},
  {sev:'warn',msg:'S-04 Zone B SE: Moisture 34% — pore pressure 58 kPa. Soil saturation risk. Drainage check required.',time:'18 min ago'},
  {sev:'warn',msg:'S-03 Zone B SW: Settlement 16.2mm cumulative and accelerating — approaching IS 1904 limit of 25mm.',time:'1 hr ago'},
  {sev:'info',msg:'Data integrity check complete — 9/9 sensors reporting. DQI: 94%. MQTT uptime: 99.7%.',time:'2 hr ago'},
  {sev:'info',msg:'Calibration due in 12 days for S-03, S-04 (Modbus cluster). Technician notified.',time:'5 hr ago'},
];

const MAINT = [
  {task:'Emergency bearing capacity inspection + plate load test (IS 1888)',zone:'Zone C',pr:'crit',due:'Today',cost:'₹45,000',std:'IS 6403:1981',status:'Overdue'},
  {task:'Sub-drain installation — PVC perforated pipe (IS 4558)',zone:'Zone B',pr:'warn',due:'Apr 9',cost:'₹18,500',std:'IS 4558:1995',status:'Scheduled'},
  {task:'Settlement re-survey — optical levelling benchmarks',zone:'Zone B',pr:'warn',due:'Apr 12',cost:'₹8,200',std:'IS 1904:1986',status:'Planned'},
  {task:'Full sensor calibration cycle — Modbus cluster',zone:'All zones',pr:'ok',due:'Apr 19',cost:'₹12,000',std:'ISO 22476',status:'On track'},
  {task:'Compaction grouting feasibility + borehole investigation',zone:'Zone C',pr:'crit',due:'Apr 22',cost:'₹1,20,000',std:'IS 15284:2003',status:'Pending'},
];

const CALIB = [
  {id:'S-01',last:'Mar 1, 2025',next:'Jun 1, 2025',std:'IS 1888:1982',drift:'+0.3%',status:'ok'},
  {id:'S-02',last:'Mar 1, 2025',next:'Jun 1, 2025',std:'IS 1888:1982',drift:'+0.1%',status:'ok'},
  {id:'S-03',last:'Jan 15, 2025',next:'Apr 15, 2025',std:'IS 1888:1982',drift:'+1.4%',status:'warn'},
  {id:'S-04',last:'Jan 15, 2025',next:'Apr 15, 2025',std:'IS 1888:1982',drift:'+2.1%',status:'warn'},
  {id:'S-05',last:'Feb 10, 2025',next:'May 10, 2025',std:'ISO 22476',drift:'+0.8%',status:'ok'},
  {id:'S-06',last:'Feb 10, 2025',next:'May 10, 2025',std:'ISO 22476',drift:'-0.2%',status:'ok'},
  {id:'S-07',last:'Mar 5, 2025',next:'Jun 5, 2025',std:'ASTM D1586',drift:'+0.4%',status:'ok'},
  {id:'S-08',last:'Mar 5, 2025',next:'Jun 5, 2025',std:'ASTM D1586',drift:'+0.3%',status:'ok'},
  {id:'S-09',last:'Mar 1, 2025',next:'Jun 1, 2025',std:'IS 1888:1982',drift:'0.0%',status:'ok'},
];

// Cloud geotechnical remedial-measures database, keyed by failure mode.
// Every recommendation cites an applicable Indian Standard, Eurocode, or ASCE reference.
const REMEDIAL_DB = {
  low_bc:{
    title:'Critical bearing capacity failure — ground improvement required',
    src:['IS 6403:1981 Cl.7','Terzaghi 1943','Meyerhof 1963','ASCE 7-22 Ch.18','EN 1997-1 §6.5','BIS SP:36-1987'],
    steps:[
      '1. IMMEDIATE: Restrict all structural/equipment loads on Zone C. Erect physical barricades per IS 13827.',
      '2. Commission plate load test per IS 1888:1982 at S-05 to verify in-situ bearing capacity before any remedial work.',
      '3. Compaction grouting (IS 9090 / ASCE 51R-09): Inject low-slump cement grout at 2m spacing, 4–6m depth. Expected capacity gain: +80–130 kPa. Cost: ₹1.2–1.8L.',
      '4. Vibro-replacement stone columns (IS 15284 Part 1): Install 400mm dia. crushed stone columns at 2m triangular grid. Simultaneous improvement of drainage + bearing capacity by 60–90%.',
      '5. Micro-pile underpinning (IS 2911 Part 4): If existing structures are within 3m, install 200mm dia. micro-piles to firm stratum at 6–8m depth.',
      '6. Borehole investigation (IS 1892:1979): Minimum 3 boreholes at Zone C — determine SPT N-values, water table, and weak layer depth.',
    ]
  },
  moisture:{
    title:'Soil saturation & elevated pore pressure — drainage intervention required',
    src:['IS 1904:1986 Cl.5.3','IS 4558:1995','Terzaghi effective stress theory','NCHRP Report 611'],
    steps:[
      '1. Install perforated PVC sub-drains (IS 4558) at 1.5m depth, 2.5m spacing around Zone B–C perimeter.',
      '2. Construct French drain or rubble trench along critical flow path. Minimum hydraulic gradient 1:200.',
      '3. Apply polymer-modified bitumen or crystalline waterproofing membrane to all exposed footing faces.',
      '4. Install 2 standpipe piezometers at S-04 and S-05. If pore pressure exceeds 60% of overburden — immediate evacuation.',
      '5. Cement-bentonite curtain grouting along upstream water-flow path to reduce permeability.',
      '6. Inspect and upgrade site surface drainage. Ensure 300mm freeboard above peak monsoon runoff.',
    ]
  },
  settlement:{
    title:'Progressive settlement — immediate monitoring & stabilisation',
    src:['IS 1904:1986 Cl.6.1','Terzaghi & Peck 1967','IS 8009 Part 1','Eurocode 7 Annex A'],
    steps:[
      '1. Install precise settlement markers at 4-hour intervals until daily rate is confirmed and stabilises.',
      '2. Differential check: IS 1904 limits to 18mm for RCC framed structures. Current 15.2mm spread approaching limit.',
      '3. Controlled preload surcharge fill to accelerate consolidation ahead of construction loads.',
      '4. Install soil nails or ground anchors along any slope within 5m of Zone B boundary.',
      '5. If settlement rate exceeds 2mm/week → escalate to structural engineer for foundation redesign per IS 2974.',
      '6. Void grouting beneath existing footings if gap detected by borehole or GPR survey.',
    ]
  },
  warning:{
    title:'Warning-level conditions — enhanced monitoring protocol',
    src:['IS 1904:1986','IS 6403:1981','BIS SP:36-1987','ISO 22476'],
    steps:[
      '1. Double monitoring frequency to every 2 hours. Set automated SMS/email alerts at threshold ±5% of current value.',
      '2. Clear perimeter drainage channels within 48 hours.',
      '3. Re-survey settlement benchmarks against IS 1904 baseline readings.',
      '4. If BC drops 10% further, reclassify zone as critical and invoke emergency protocol.',
      '5. Prepare contractor brief for mobilisation-ready grouting within 5 working days.',
      '6. Cross-reference with rainfall and monsoon data — Zone B is particularly susceptible during Jun–Sep.',
    ]
  }
};
