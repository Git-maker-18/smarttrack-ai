// SmartTrack AI - Web Application JavaScript Core Engine

// State Management
let map = null;
let markersLayer = null;
let chartMarket = null;
let chartModes = null;
let operatorLog = [];

// Ports Dataset (Selected for pure oceanic straight-line routes that DO NOT cross the dateline)
const PORTS = {
  'New York': { lat: 40.7128, lon: -74.0060, country: 'USA' },
  'Miami': { lat: 25.7617, lon: -80.1918, country: 'USA' },
  'Lisbon': { lat: 38.7223, lon: -9.1393, country: 'Portugal' },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729, country: 'Brazil' },
  'Cape Town': { lat: -33.9249, lon: 18.4241, country: 'South Africa' },
  'Perth': { lat: -31.9505, lon: 115.8605, country: 'Australia' },
  'Mumbai': { lat: 18.9500, lon: 72.9500, country: 'India' },
  'Victoria': { lat: -4.6191, lon: 55.4513, country: 'Seychelles' },
  'Colombo': { lat: 6.9271, lon: 79.8612, country: 'Sri Lanka' },
  'Jakarta': { lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
  'Sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'Auckland': { lat: -36.8485, lon: 174.7633, country: 'New Zealand' }
};

// Vessels Fleet Dataset (100% Water Routes, Shortest Path Straight Lines)
const VESSELS = [
  { vessel_name: 'MSC RAFAELA', mmsi: '356789012', type: 'Container Ship', origin: 'New York', dest: 'Lisbon', cargo_val: 4200000, speed: 18.2, progress: 55.0, cog: 82, risk: 'Low', score: 0.18, weather: 'Clear Skies', temp: 24, wind: 12 },
  { vessel_name: 'MAERSK EMERALD', mmsi: '219018234', type: 'Container Ship', origin: 'Rio de Janeiro', dest: 'Cape Town', cargo_val: 3100000, speed: 12.4, progress: 68.0, cog: 95, risk: 'High', score: 0.82, weather: 'South Atlantic Storm', temp: 14, wind: 48 },
  { vessel_name: 'COSCO FORTUNE', mmsi: '477123456', type: 'Bulk Carrier', origin: 'Cape Town', dest: 'Perth', cargo_val: 2800000, speed: 16.0, progress: 42.0, cog: 110, risk: 'Low', score: 0.22, weather: 'Partly Cloudy', temp: 19, wind: 15 },
  { vessel_name: 'HAPAG BERLIN', mmsi: '211234567', type: 'Container Ship', origin: 'Mumbai', dest: 'Victoria', cargo_val: 1950000, speed: 14.1, progress: 51.0, cog: 210, risk: 'Medium', score: 0.54, weather: 'Light Rain', temp: 28, wind: 22 },
  { vessel_name: 'EVERGREEN STAR', mmsi: '416789012', type: 'Container Ship', origin: 'Colombo', dest: 'Jakarta', cargo_val: 3600000, speed: 17.5, progress: 32.0, cog: 105, risk: 'Low', score: 0.15, weather: 'Clear Skies', temp: 29, wind: 10 },
  { vessel_name: 'CMA CGM ATLAS', mmsi: '228345678', type: 'Container Ship', origin: 'Auckland', dest: 'Sydney', cargo_val: 5100000, speed: 11.2, progress: 79.0, cog: 285, risk: 'High', score: 0.88, weather: 'Tasman Sea Gale', temp: 16, wind: 52 },
  { vessel_name: 'ZIM PACIFIC', mmsi: '428901234', type: 'Ro-Ro Cargo', origin: 'Miami', dest: 'Lisbon', cargo_val: 2200000, speed: 15.8, progress: 55.0, cog: 75, risk: 'Medium', score: 0.58, weather: 'Heavy Rain', temp: 22, wind: 35 },
  { vessel_name: 'PIL KOTA', mmsi: '563456789', type: 'Tanker', origin: 'Perth', dest: 'Jakarta', cargo_val: 1800000, speed: 16.8, progress: 24.0, cog: 345, risk: 'Low', score: 0.12, weather: 'Clear Skies', temp: 27, wind: 8 }
];

// Map Marker Icon Data Generators
function getPortSVG() {
  return `<span style="font-size:18px;">🏭</span>`;
}

function getVesselSVG(color) {
  return `<span style="font-size:18px;">🚢</span>`;
}

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  initAnimations();
  initTabNavigation();
  initLeafletMap();
  initCharts();
  initPlayground();
  initGenAIAgent();
  renderFleetSidebar();
  renderAlerts();
  startLiveTelemetryLoop();
});

// ----------------------------------------------------
// Premium Awwwards-style GSAP Animations & Interactions
// ----------------------------------------------------
function initAnimations() {
  // 3. Magnetic Buttons (Pull effect on hover)
  const magneticElements = document.querySelectorAll('.glass-btn, .select-custom, .vessel-item');
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
  });

  // 4. Parallax 3D Tilt for Glass Cards
  const cards = document.querySelectorAll('.glass-card, .glass-panel');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2; // Max 2 deg tilt
      const rotateY = ((x - centerX) / centerX) * 2;
      
      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1000,
        ease: 'power1.out',
        duration: 0.4
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power2.out' });
    });
  });

  // 5. Initial GSAP Stagger Reveal (Only for header and map cards, NOT analytics cards)
  gsap.from('.app-header, .map-card, .fleet-sidebar-card', {
    y: 30,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.2
  });
}

// Global Reusable Animation Trigger
function triggerKPIAnimations() {
  const kpiElements = document.querySelectorAll('.kpi-value');
  kpiElements.forEach(el => {
    // Save original value on first run so we don't accidentally parse an animating '0'
    if (!el.dataset.finalString) {
      el.dataset.finalString = el.innerText;
    }
    const finalString = el.dataset.finalString;
    
    const isCurrency = finalString.includes('$');
    const isMillion = finalString.includes('M');
    const isPercent = finalString.includes('%');
    const numericalVal = parseFloat(finalString.replace(/[^0-9.]/g, ''));
    
    if (!isNaN(numericalVal)) {
      // Instantly set the text to 0 so it doesn't flash the final value for a split second before the animation starts
      let initStr = '0';
      if (isCurrency) initStr = '$0';
      if (isMillion) initStr += 'M';
      if (isPercent) initStr += '%';
      el.innerText = initStr;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: numericalVal,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          let formatted = obj.val.toFixed(1);
          if (formatted.endsWith('.0') && !isPercent) formatted = Math.floor(obj.val); // remove .0 if not needed
          
          let result = formatted;
          if (isCurrency) result = '$' + result;
          if (isMillion) result = result + 'M';
          if (isPercent) result = obj.val.toFixed(1) + '%';
          
          el.innerText = result;
        }
      });
    }
  });
}

// Live AIS Telemetry Streaming Loop (Updates speed, progress %, course & ETA every 3 seconds)
function startLiveTelemetryLoop() {
  let tickCount = 0;
  setInterval(() => {
    tickCount++;
    VESSELS.forEach(v => {
      // 1. Advance voyage progress smoothly (+0.25% every 3s)
      v.progress = parseFloat((v.progress + 0.25).toFixed(1));
      if (v.progress > 98.0) v.progress = 5.0;

      // 2. Real-time speed fluctuations (+/- 0.4 knots)
      const speedDelta = (Math.random() - 0.5) * 0.6;
      v.speed = parseFloat(Math.max(10.0, Math.min(22.0, v.speed + speedDelta)).toFixed(1));

      // 3. Dynamic Course Over Ground heading (+/- 2 degrees)
      v.cog = (v.cog + Math.round((Math.random() - 0.5) * 4) + 360) % 360;
    });

    // Re-render markers and sidebar live
    if (map) renderMapMarkers();
    renderFleetSidebar();

    // Update Header Status Badge
    const badge = document.querySelector(".status-badge");
    if (badge) {
      badge.innerHTML = `<div class="pulse-dot"></div> AIS Live Telemetry • Active (${tickCount * 3}s runtime)`;
    }
  }, 3000);
}

// Tab Navigation
function initTabNavigation() {
  const tabs = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add("active");

      // Handle specific tab activation logic
      if (tab.dataset.target === 'view-map' && map) {
        setTimeout(() => map.invalidateSize(), 50);
      } else if (tab.dataset.target === 'view-analytics') {
        // Re-trigger animations so they don't happen invisibly
        triggerKPIAnimations();
        
        // Re-animate charts
        if (chartMarket) { chartMarket.reset(); chartMarket.update(); }
        if (chartModes) { chartModes.reset(); chartModes.update(); }
      }
    });
  });
}

// 2D Leaflet Map Setup
let mapLayers = [];

function initLeafletMap() {
  const worldBounds = [
    [-90, -180],
    [90, 180]
  ];

  map = L.map('leaflet-map', {
    minZoom: 2,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    noWrap: true,
    bounds: worldBounds
  }).addTo(map);

  setTimeout(() => { if (map) map.invalidateSize(); }, 200);

  renderMapMarkers();
}

let currentFocusedVessel = null;

function renderMapMarkers(focusVesselName = undefined) {
  if (!map) return;
  
  // Update global focus state if a new value was explicitly passed
  if (focusVesselName !== undefined) {
    currentFocusedVessel = focusVesselName;
  }
  
  // Clear old layers
  mapLayers.forEach(layer => map.removeLayer(layer));
  mapLayers = [];

  // Determine relevant ports if a specific vessel is focused
  let relevantPorts = null;
  if (currentFocusedVessel) {
    const focusedVessel = VESSELS.find(v => v.vessel_name === currentFocusedVessel);
    if (focusedVessel) {
      relevantPorts = [focusedVessel.origin, focusedVessel.dest];
    }
  }

  // Render Ports
  Object.entries(PORTS).forEach(([name, info]) => {
    // If a vessel is focused, hide ports that are not part of its route
    if (relevantPorts && !relevantPorts.includes(name)) return;

    const icon = L.divIcon({
      className: 'port-marker',
      html: `
        <div style="background:#1e1b4b; border:2px solid #38bdf8; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(56,189,248,0.8);">
          <span style="font-size:14px;">🏭</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const marker = L.marker([info.lat, info.lon], { icon }).bindPopup(`<b>Port: ${name}</b>`);
    marker.addTo(map);
    mapLayers.push(marker);
  });

  // Render Ships & Routes
  VESSELS.forEach(v => {
    // If a vessel is focused, hide all other ships and their routes!
    if (currentFocusedVessel && v.vessel_name !== currentFocusedVessel) return;

    const orig = PORTS[v.origin];
    const dest = PORTS[v.dest];
    let color = '#00f0ff'; // Unified Cyber-Cyan theme for all vessels

    // Calc Current Position (Straight Line)
    const lat = orig.lat + (v.progress / 100) * (dest.lat - orig.lat);
    let dlon = dest.lon - orig.lon;
    if (dlon > 180) dlon -= 360;
    if (dlon < -180) dlon += 360;
    const lon = orig.lon + (v.progress / 100) * dlon;

    // 1. Draw Travelled Route (Thick Solid Line)
    const travelledLine = L.polyline([[orig.lat, orig.lon], [lat, lon]], {
      color: color,
      weight: 4,
      opacity: 0.9
    }).addTo(map);
    mapLayers.push(travelledLine);

    // 2. Draw Remaining Route (Thick Dotted Line)
    const remainingLine = L.polyline([[lat, lon], [dest.lat, dest.lon]], {
      color: '#ffffff',
      weight: 3,
      opacity: 0.7,
      dashArray: '6, 8'
    }).addTo(map);
    mapLayers.push(remainingLine);

    // 3. Draw Ship Marker with New Icon
    const shipIcon = L.divIcon({
      className: 'ship-marker',
      html: `
        <div style="background:${color}44; border:2px solid ${color}; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px ${color}; transform: rotate(${v.cog}deg); overflow:hidden;">
          <img src="ship-icon2.png" width="36" height="36" style="object-fit:cover;" />
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const popupHtml = `
      <div style="font-family:Inter,sans-serif;width:260px;">
        <h4 style="margin:0;color:#0f172a;font-weight:700;">🚢 ${v.vessel_name}</h4>
        <p style="margin:2px 0 8px;color:#475569;font-size:0.8rem;">${v.type} | MMSI: ${v.mmsi}</p>
        <hr style="margin:6px 0;border-color:#cbd5e1;">
        <div style="color:#1e293b;font-size:0.85rem;line-height:1.5;">
          <b>Route:</b> ${v.origin} → ${v.dest}<br>
          <b>Progress:</b> ${v.progress}%<br>
          <b>Speed:</b> ${v.speed} knots<br>
          <b>ETA:</b> ${( (100 - v.progress) * 4.2 ).toFixed(1)} hours<br>
          <b>Weather:</b> ${v.weather} (${v.temp}°C)<br>
          <b>Risk:</b> <span style="color:${color};font-weight:700;-webkit-text-stroke: 0.5px black;">${v.risk}</span>
        </div>
      </div>
    `;

    const marker = L.marker([lat, lon], { icon: shipIcon }).bindPopup(popupHtml);
    marker.addTo(map);
    mapLayers.push(marker);

    // Focus Camera if clicked from sidebar (only if explicitly passed this frame)
    if (focusVesselName !== undefined && focusVesselName !== null && v.vessel_name === focusVesselName) {
      map.setView([lat, lon], 4, { animate: true });
    }
  });
}

// Global Search State
let fleetSearchQuery = "";

// Render Fleet List Sidebar
function renderFleetSidebar() {
  const container = document.getElementById("fleet-list");
  if (!container) return;

  const q = fleetSearchQuery.toLowerCase();
  
  container.innerHTML = VESSELS.filter(v => {
    return v.vessel_name.toLowerCase().includes(q) || 
           v.origin.toLowerCase().includes(q) || 
           v.dest.toLowerCase().includes(q);
  }).map(v => `
    <div class="vessel-list-item" onclick="focusVesselOnMap('${v.vessel_name}')">
      <div class="vessel-item-header">
        <span class="vessel-name">${v.vessel_name}</span>
        <span class="badge-risk ${v.risk.toLowerCase()}">${v.risk}</span>
      </div>
      <div class="vessel-item-body">
        <span>${v.origin} → ${v.dest}</span>
        <span style="font-weight:600;color:#e2e8f0;">${v.speed} kn | ${v.progress}%</span>
      </div>
    </div>
  `).join("");
}

function focusVesselOnMap(vname) {
  const navBtn = document.querySelector('.nav-btn[data-target="view-map"]');
  if (navBtn) navBtn.click();
  renderMapMarkers(vname);
}

// Charts Initialization (Chart.js)
function initCharts() {
  const ctxMarket = document.getElementById("chart-market");
  if (ctxMarket) {
    chartMarket = new Chart(ctxMarket, {
      type: 'doughnut',
      data: {
        labels: ['LATAM', 'Europe', 'Pacific Asia', 'USCA', 'Africa'],
        datasets: [{
          data: [51594, 50252, 41260, 25799, 11614],
          backgroundColor: ['#6366f1', '#818cf8', '#a5b4fc', '#34d399', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } },
        cutout: '65%'
      }
    });
  }

  const ctxModes = document.getElementById("chart-modes");
  if (ctxModes) {
    chartModes = new Chart(ctxModes, {
      type: 'bar',
      data: {
        labels: ['Standard Class', 'Second Class', 'First Class', 'Same Day'],
        datasets: [{
          label: 'Orders',
          data: [107752, 35216, 27814, 9737],
          backgroundColor: '#6366f1',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
}

// ML Playground Simulator
function initPlayground() {
  const qtyInput = document.getElementById("p-qty");
  const priceInput = document.getElementById("p-price");
  const discountInput = document.getElementById("p-discount");
  const modeInput = document.getElementById("p-mode");

  if (!qtyInput) return;

  const updateSim = () => {
    const qty = parseInt(qtyInput.value);
    const price = parseFloat(priceInput.value);
    const discount = parseFloat(discountInput.value);
    const mode = modeInput.value;

    document.getElementById("v-qty").textContent = qty;
    document.getElementById("v-price").textContent = `$${price}`;
    document.getElementById("v-discount").textContent = `${(discount * 100).toFixed(0)}%`;

    const sales = qty * price;
    const total = sales * (1 - discount);
    document.getElementById("calc-sales").textContent = `$${sales.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById("calc-total").textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // ML Risk Calculation Model (v5 Trained Logic Simulation)
    let baseRisk = mode === 'First Class' ? 0.95 : (mode === 'Second Class' ? 0.76 : 0.38);
    if (discount > 0.15) baseRisk += 0.08;
    if (qty > 3) baseRisk += 0.05;
    const riskProb = Math.min(0.98, Math.max(0.05, baseRisk));

    document.getElementById("risk-score-text").textContent = `${(riskProb * 100).toFixed(0)}%`;
    const riskColor = riskProb > 0.7 ? '#ef4444' : (riskProb > 0.4 ? '#f59e0b' : '#10b981');
    document.getElementById("risk-score-text").style.color = riskColor;

    // SLA Days
    const slaMap = { 'Standard Class': 4, 'Second Class': 3, 'First Class': 2, 'Same Day': 0 };
    const schedSLA = slaMap[mode];
    const estETA = (schedSLA + (riskProb > 0.7 ? 1.8 : 0.2)).toFixed(1);
    document.getElementById("calc-eta").textContent = `${estETA} Days (SLA: ${schedSLA} Days)`;
  };

  [qtyInput, priceInput, discountInput, modeInput].forEach(el => el.addEventListener("input", updateSim));
  updateSim();
}

// GenAI LLM Agent & Human-in-the-Loop Operator Decision Engine
function initGenAIAgent() {
  const selector = document.getElementById("copilot-vessel-select");
  if (!selector) return;

  selector.innerHTML = VESSELS.map(v => `<option value="${v.vessel_name}">${v.vessel_name} (${v.origin} → ${v.dest})</option>`).join("");

  selector.addEventListener("change", () => renderGenAIBrief(selector.value));
  renderGenAIBrief(VESSELS[0].vessel_name);
}

const GROQ_KEY = "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";

async function renderGenAIBrief(vname) {
  const v = VESSELS.find(item => item.vessel_name === vname);
  if (!v) return;

  const penalty = Math.round((v.score > 0.5 ? 2.5 : 0.5) * 250);
  const savings = Math.round(penalty * 0.7);
  const copilotBox = document.getElementById("copilot-box");

  // Show Loading Spinner State
  copilotBox.innerHTML = `
    <div class="copilot-card">
      <div class="copilot-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <h3 style="color:#7dd3fc;">Querying Groq Meta LLaMA 3.3 70B...</h3>
      </div>
      <p style="font-size:0.9rem;color:#cbd5e1;">Generating real-time executive disruption briefing via Groq AI Engine...</p>
    </div>
  `;

  window.currentVesselContext = { vessel: v.vessel_name, savings: savings };

  try {
    const prompt = `
System Role: You are SmartTrack AI, an Autonomous Senior Supply Chain Risk Director.
Vessel: ${v.vessel_name} | Route: ${v.origin} -> ${v.dest} | Speed: ${v.speed} kn | Weather: ${v.weather} | Delay Risk: ${(v.score * 100).toFixed(0)}% | Cargo Value: $${v.cargo_val.toLocaleString()} | Penalty Exposure: $${penalty.toLocaleString()}
Return a JSON object with keys:
- "executive_brief": (1-2 sentence summary)
- "root_cause_1": (Primary weather cause)
- "root_cause_2": (Secondary port congestion cause)
- "recommended_action": (1 action sentence)
Return strictly valid JSON only.
`;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    copilotBox.innerHTML = `
      <div class="copilot-card">
        <div class="copilot-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="color:#7dd3fc;margin:0;">Groq LLaMA 3.3 70B Executive Brief: ${v.vessel_name}</h3>
          <span class="badge-risk low" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#7dd3fc;">0.2s Inference</span>
        </div>
        <p style="font-size:0.98rem;color:#f8fafc;line-height:1.6;margin-top:10px;">
          ${parsed.executive_brief || `DISRUPTION BRIEFING: Vessel ${v.vessel_name} traveling on the ${v.origin} → ${v.dest} lane is experiencing a ${v.weather} delay (Speed: ${v.speed} kn).`}
        </p>
        <hr style="margin:14px 0;border-color:rgba(56,189,248,0.25);">
        <strong style="color:#7dd3fc;">Root Cause Diagnosis:</strong>
        <ul style="color:#cbd5e1;padding-left:20px;margin-top:6px;">
          <li>Primary: ${parsed.root_cause_1 || `Adverse maritime weather (${v.weather}) causing cruising speed penalty.`}</li>
          <li>Secondary: ${parsed.root_cause_2 || `Port congestion index at ${v.dest} terminal.`}</li>
        </ul>
        <hr style="margin:14px 0;border-color:rgba(56,189,248,0.25);">
        <strong style="color:#a3e635;">Prescriptive Mitigation Strategy:</strong>
        <div style="color:#e2e8f0;margin-top:4px;">${parsed.recommended_action || `Request priority unloader berth at ${v.dest} & expedite feeder clearance.`}</div>
        <div style="margin-top:8px;font-weight:800;color:#a3e635;">Projected Demurrage Savings: $${savings.toLocaleString()}</div>
      </div>
    `;
  } catch (err) {
    // Fallback if network blocked
    copilotBox.innerHTML = `
      <div class="copilot-card">
        <div class="copilot-header">
          <h3>GenAI Briefing: ${v.vessel_name}</h3>
        </div>
        <p style="font-size:1rem;color:#e2e8f0;line-height:1.6;">
          DISRUPTION BRIEFING: Vessel ${v.vessel_name} traveling on the ${v.origin} → ${v.dest} lane is experiencing 
          a ${v.weather} delay (Speed: ${v.speed} kn). SLA risk probability is <strong>${(v.score * 100).toFixed(0)}%</strong>. 
          Estimated demurrage penalty exposure is <strong>$${penalty.toLocaleString()}</strong> on $${v.cargo_val.toLocaleString()} cargo.
        </p>
        <hr style="margin:14px 0;border-color:rgba(129,140,248,0.2);">
        <strong style="color:#7dd3fc;">Root Cause Analysis:</strong>
        <ul style="color:#cbd5e1;padding-left:20px;margin-top:6px;">
          <li>Primary: Adverse maritime weather (${v.weather}) reducing cruising SOG.</li>
          <li>Secondary: Port congestion index at ${v.dest} terminal.</li>
        </ul>
        <hr style="margin:14px 0;border-color:rgba(129,140,248,0.2);">
        <strong style="color:#a3e635;">Recommended Action:</strong>
        <div style="color:#e2e8f0;margin-top:4px;">Request priority unloader berth at ${v.dest} & expedite feeder clearance.</div>
        <div style="margin-top:8px;font-weight:800;color:#a3e635;">Projected Demurrage Savings: $${savings.toLocaleString()}</div>
      </div>
    `;
  }
}

function handleOperatorAction(decision) {
  if (!window.currentVesselContext) return;
  const notes = document.getElementById("op-notes").value || "No notes provided";
  const vessel = window.currentVesselContext.vessel;
  const savings = decision === 'REJECTED' ? 0 : window.currentVesselContext.savings;
  
  operatorLog.unshift({
    time: new Date().toLocaleTimeString(),
    vessel: vessel,
    decision: decision,
    savings: savings,
    notes: notes
  });

  // Clear notes input after submission
  document.getElementById("op-notes").value = "";

  // Show Toast Alert Popup
  showToastAlert(decision, vessel, savings, notes);
}

function showToastAlert(decision, vessel, savings, notes) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const color = decision === 'APPROVED' ? '#a3e635' : (decision === 'OVERRIDDEN' ? '#facc15' : '#f43f5e');
  const title = decision === 'APPROVED' ? 'Action Approved' : (decision === 'OVERRIDDEN' ? 'Route Overridden' : 'Disruption Alert Rejected');

  toast.style.cssText = `
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid ${color};
    border-left: 5px solid ${color};
    backdrop-filter: blur(16px);
    padding: 14px 18px;
    border-radius: 12px;
    color: #f8fafc;
    width: 360px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 16px ${color}44;
    transition: all 0.3s ease;
  `;

  toast.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <strong style="font-size:0.95rem;color:${color};">${title}</strong>
      <span style="font-size:0.75rem;color:#94a3b8;">${new Date().toLocaleTimeString()}</span>
    </div>
    <div style="font-size:0.85rem;color:#e2e8f0;line-height:1.4;">
      Logged action for <b>${vessel}</b>.<br>
      ${savings > 0 ? `<span style="color:#a3e635;font-weight:700;">Saved $${savings.toLocaleString()} in demurrage fees.</span>` : '<span style="color:#cbd5e1;">Alert dismissed by operator.</span>'}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

function downloadExecutiveCSV() {
  if (operatorLog.length === 0) {
    alert("No operator decisions recorded yet.");
    return;
  }
  let csv = "Time,Vessel,Decision,Savings_USD,Notes\n";
  operatorLog.forEach(l => {
    csv += `"${l.time}","${l.vessel}","${l.decision}",${l.savings},"${l.notes}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smarttrack_executive_approval_report.csv';
  a.click();
}

function renderAlerts() {
  const container = document.getElementById("alerts-feed");
  if (!container) return;

  const highRisk = VESSELS.filter(v => v.risk === 'High' || v.risk === 'Medium');
  container.innerHTML = highRisk.map(v => `
    <div class="glass-card" style="margin-bottom:16px;border-color:${v.risk==='High'?'rgba(239,68,68,0.4)':'rgba(245,158,11,0.4)'};">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong style="font-size:1.1rem;color:#ffffff;">${v.vessel_name}</strong>
          <span class="badge-risk ${v.risk.toLowerCase()}" style="margin-left:12px;">${v.risk} Risk (${(v.score*100).toFixed(0)}%)</span>
        </div>
        <div style="color:${v.risk==='High'?'#ef4444':'#f59e0b'};font-weight:700;">ETA: ${((100-v.progress)*4.2).toFixed(0)}h</div>
      </div>
      <div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">
        Route: ${v.origin} → ${v.dest} | Speed: ${v.speed} kn | Weather: ${v.weather} (${v.temp}°C, Wind: ${v.wind} km/h) | Cargo: $${v.cargo_val.toLocaleString()}
      </div>
    </div>
  `).join("");
}
