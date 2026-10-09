'use strict';
var current = 'All'; // active analytics filter
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Data ---------- */
const ICONS = {
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  pin: '<path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  cycle: '<path d="M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const CARDS = {
  problem: [['eye','Poor Tracking','Organizations often lose visibility into where obsolete IT equipment goes.'],['trash','Improper Disposal','Unmanaged electronic waste can end up in unsafe disposal channels.'],['lock','Data Security Risks','Retired devices may contain sensitive organizational information.'],['leaf','Environmental Impact','Improper handling wastes recoverable materials and increases environmental impact.']],
  features: [['cpu','AI-Powered Classification','Sorts devices into reuse, recover or recycle automatically.'],['pin','Real-Time Asset Tracking','Follow every device from office to facility.'],['bell','Automated Notifications','Alerts for pickups, status changes and deadlines.'],['chart','E-Waste Analytics','Dashboards for volume, categories and trends.'],['lock','Data Security','Certified wiping before any device leaves.'],['cal','Collection Scheduling','Book secure pickups in a few clicks.'],['check','Recycling Verification','Proof that each device reached an approved facility.'],['doc','Impact Reporting','Export CO₂ and material recovery reports.']],
  rrr: [['cycle','Reuse','Refurbish functional devices and extend their useful life.'],['cpu','Recover','Recover valuable components and materials from retired equipment.'],['leaf','Recycle','Responsibly process equipment that can no longer be reused.']]
};
const RI = [['refurbished-devices','Extend life','Refurbished laptops lined up for reuse'],['it-equipment','Material recovery','Electronic components and equipment sorted for recovery'],['recycling','Responsible processing','Professional e-waste recycling facility']];
const STEPS = [['Register','Register obsolete IT equipment and assign a unique digital identity.'],['Track','Track devices across departments, storage locations, and collection points.'],['Collect','Schedule secure collection and transportation.'],['Sort & Recover','Identify reusable equipment and valuable components.'],['Recycle','Send non-reusable equipment through responsible recycling channels.'],['Report','Generate digital reports showing recycling and environmental impact.']];
const DEVICES = {
  Laptop: ['ET-1042','IT Department','Retired','Ready for Collection','12 Oct 2026','GreenCycle Recycling Center'],
  Monitor: ['ET-1025','HR Office','Reusable','Awaiting Refurbishment','15 Oct 2026','ReNew Refurbish Hub'],
  Server: ['ET-1026','Server Room B','Retired','Data Sanitization','18 Oct 2026','SecureCycle Facility'],
  Smartphone: ['ET-1027','Sales Floor','Reusable','Component Recovery','20 Oct 2026','GreenCycle Recycling Center'],
  Printer: ['ET-1031','Admin Store','Retired','In Storage','25 Oct 2026','EcoParts Recovery Plant']
};
const LIFE = [['Purchase','Equipment is procured and receives a digital asset identity.'],['Deployment','Devices are issued to teams and logged to a department.'],['Usage','Daily use is monitored for health and age.'],['Maintenance','Repairs and upgrades extend useful life.'],['Retirement','Devices that no longer meet needs are flagged for exit.'],['Collection','A secure pickup is scheduled and tracked.'],['Recycling','Non-reusable devices go to certified recyclers.'],['Material Recovery','Metals, plastics and components are recovered.'],['Reuse','Recovered materials and refurbished devices re-enter use.']];
const FAQ = [['What is IT e-waste?','Discarded electronics from organizations, such as laptops, servers, monitors, phones and networking gear.'],['Why is e-waste tracking important?','Tracking prevents lost assets, proves compliance, protects data and shows how much material is recovered.'],['How does EcoTrack AI track devices?','Each device gets a QR/barcode identity and is scanned at every handoff, with updates stored in the cloud.'],['How is sensitive data protected?','Devices are sanitized and verified before disposal, and a verification report is attached to each asset.'],['What happens after collection?','Devices are inspected, sanitized, then refurbished, stripped for components, or recycled.'],['How does recycling reduce environmental impact?','Recovered metals and components replace new mining, which cuts emissions, energy use and landfill.']];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BASE = [120,150,170,140,210,230,190,250,270,240,280,300];
const CATS = [['Laptops','#8B5CF6',.34],['Monitors','#38BDF8',.2],['Servers','#7C3AED',.26],['Mobile Devices','#14B8A6',.2]];
const FILTERS = {All:[1,2480,1842,638,6.8,12500,74,26],Laptops:[.34,843,640,203,2.4,4250,76,24],Monitors:[.2,496,350,146,1.4,2500,71,29],Servers:[.26,645,470,175,1.8,3250,73,27],'Mobile Devices':[.2,496,382,114,1.2,2500,77,23]};

/* ---------- Render cards, timeline, flow, FAQ, tech ---------- */
$$('[data-cards]').forEach(el => {
  const k = el.dataset.cards;
  el.innerHTML = CARDS[k].map(([i,t,d],n) => k === 'rrr'
    ? `<article class="pcard rv sc"><img src="images/${RI[n][0]}.jpg" alt="${RI[n][2]}" loading="lazy" onerror="this.classList.add('broken')"><span class="ov"></span><div class="tx"><small>${RI[n][1]}</small><h3>${t}</h3><p>${d}</p><a class="cta-s" href="#demo">See how it works</a></div></article>`
    : `<article class="fc rv"><div class="ic">${icon(i)}</div><h3>${t}</h3><p>${d}</p></article>`).join('');
});
$('#timeline').innerHTML = STEPS.map(([t,d],i) => `<li><span class="n">0${i+1}</span><h3>${t}</h3><p>${d}</p></li>`).join('');
$('#faq').innerHTML = FAQ.map(([q,a]) => `<div class="faq"><button aria-expanded="false">${q}</button><div class="a"><p>${a}</p></div></div>`).join('');
$$('.faq button').forEach(b => b.addEventListener('click', () => {
  const box = b.parentElement, open = box.classList.toggle('open'), a = $('.a', box);
  b.setAttribute('aria-expanded', open); a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
}));

/* ---------- Nav, scroll helpers ---------- */
const nav = $('#nav'), toTop = $('#top'), links = $('#links'), burger = $('#burger');
addEventListener('scroll', () => { nav.classList.toggle('scrolled', scrollY > 10); toTop.classList.toggle('show', scrollY > 600); }, { passive: true });
toTop.onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
burger.onclick = () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
$$('.links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

/* ---------- Observers: reveal, counters, active link, timeline ---------- */
function countUp(el) {
  const to = +el.dataset.count, dec = +el.dataset.dec || 0, suf = el.dataset.suf || '', t0 = performance.now();
  const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
  const tick = t => { const p = Math.min((t - t0) / 1400, 1); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
  reduce ? el.textContent = fmt(to) : requestAnimationFrame(tick);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in');
  $$('[data-count]', el).forEach(countUp); if (el.dataset.count) countUp(el);
  if (el.id === 'analytics' || el.closest('#analytics')) drawCharts(current);
  io.unobserve(el);
}), { threshold: .15 });
$$('.rv, .timeline li, #analytics .charts').forEach((el, i) => { if (el.tagName === 'LI') el.style.transitionDelay = (i % 6) * 80 + 'ms'; io.observe(el); });
$$('[data-count]').forEach(el => io.observe(el));
const secs = $$('main section[id]');
new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' }).observe && secs.forEach(s => new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + s.id)); }), { rootMargin: '-45% 0px -50% 0px' }).observe(s));

/* ---------- Tracking demo ---------- */
const devTabs = $('#devTabs'), devOut = $('#devOut');
devTabs.innerHTML = Object.keys(DEVICES).map((d,i) => `<button role="tab" class="${i?'':'on'}">${d}</button>`).join('');
function showDevice(name) {
  const [id, loc, cond, status, date, dest] = DEVICES[name];
  devOut.innerHTML = [['Device Type',name],['Asset ID',id],['Condition',cond],['Current Location',loc],['Status',`<span class="pill p-blue">${status}</span>`],['Collection Date',date],['Destination',dest]].map(([k,v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}
devTabs.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; $$('button', devTabs).forEach(b => b.classList.toggle('on', b === e.target)); showDevice(e.target.textContent); devOut.classList.add('sk'); setTimeout(() => devOut.classList.remove('sk'), 450); });
showDevice('Laptop');

/* ---------- Analytics (filters + SVG/CSS charts) ---------- */
var drawn = false;
const fb = $('#filters'); fb.innerHTML = Object.keys(FILTERS).map((f,i) => `<button class="${i?'':'on'}">${f}</button>`).join('');
fb.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; $$('button', fb).forEach(b => b.classList.toggle('on', b === e.target)); current = e.target.textContent; drawCharts(current); });
function drawCharts(f) {
  const [share, total, recycled, recovered, co2, kwh, rr, rec] = FILTERS[f];
  $('#stats').innerHTML = [[total.toLocaleString()+' KG','Total E-Waste'],[recycled.toLocaleString(),'Devices Recycled'],[recovered.toLocaleString(),'Devices Recovered'],[co2+' T','CO₂ Avoided'],[kwh.toLocaleString()+' kWh','Energy Saved']].map(([v,l],n) => `<div class="stat rv in"><small>${l}</small><b>${v}</b><em class="up">↑ ${['18.4','12.7','8.3','21.5','9.6'][n]}%</em></div>`).join('');
  const max = 300;
  $('#bars').innerHTML = BASE.map((v,i) => `<div><i data-h="${Math.round(v*share/max*100)}"></i>${MONTHS[i]}</div>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => $$('#bars i').forEach(i => i.style.height = i.dataset.h + '%')));
  let off = 0; const C = 2 * Math.PI * 40;
  $('#donut').innerHTML = CATS.map(([n,c,p]) => { const s = `<circle cx="60" cy="60" r="40" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${p*C} ${C}" stroke-dashoffset="${-off*C}"/>`; off += p; return s; }).join('');
  $('#legend').innerHTML = CATS.map(([n,c,p]) => `<li><i style="background:${c}"></i>${n} ${Math.round(p*100)}%</li>`).join('');
  const meter = (l, v) => `<div class="meter">${l} <span style="float:right">${v}%</span><div><i data-w="${v}"></i></div></div>`;
  $('#rates').innerHTML = meter('Recycling Rate', rr) + meter('Recovery Rate', rec + 20 > 100 ? 99 : Math.round(recovered / total * 100 * 3.3));
  $('#impactBars').innerHTML = meter('CO₂ avoided', Math.min(100, Math.round(co2 / 6.8 * 100))) + meter('Energy saved', Math.min(100, Math.round(kwh / 12500 * 100))) + meter('Materials recovered', Math.min(100, Math.round(share * 100)));
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.meter i').forEach(i => i.style.width = i.dataset.w + '%')));
}
drawCharts('All');

/* ---------- Circular lifecycle ---------- */
const svg = $('#ringSvg'), R = 150, CX = 200, CY = 200;
const pos = i => { const a = (i / LIFE.length) * 2 * Math.PI - Math.PI / 2; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; };
svg.innerHTML = `<circle cx="200" cy="200" r="150" fill="none" stroke="#d6e2f7" stroke-width="3" stroke-dasharray="3 7"/><path class="arc" id="arc"/><text x="200" y="196" text-anchor="middle" font-weight="800" font-size="14" fill="#8B5CF6">Circular</text><text x="200" y="214" text-anchor="middle" font-weight="800" font-size="14" fill="#8B5CF6">Lifecycle</text>` +
  LIFE.map(([t],i) => { const [x,y] = pos(i); return `<g class="nd" tabindex="0" role="button" aria-label="${t}" data-i="${i}"><circle cx="${x}" cy="${y}" r="20"/><text x="${x}" y="${y+4}" fill="#3a4270">${i+1}</text><text x="${x}" y="${y + (y>200?38:-30)}">${t}</text></g>`; }).join('');
function selectStage(i) {
  $$('.nd', svg).forEach(n => { const on = +n.dataset.i === i; n.classList.toggle('on', on); n.querySelector('text').setAttribute('fill', on ? '#fff' : '#3a4270'); });
  const [x0,y0] = pos(i), [x1,y1] = pos((i + 1) % LIFE.length);
  $('#arc').setAttribute('d', `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`);
  $('#lifeInfo').innerHTML = `<span class="pill p-purple">Stage ${i+1} of ${LIFE.length}</span><h3>${LIFE[i][0]}</h3><p>${LIFE[i][1]}</p>`;
}
svg.addEventListener('click', e => { const n = e.target.closest('.nd'); if (n) selectStage(+n.dataset.i); });
svg.addEventListener('keydown', e => { const n = e.target.closest('.nd'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectStage(+n.dataset.i); } });
selectStage(0);

/* ---------- Modal + form validation ---------- */
const modal = $('#modal'), form = $('#form');
const openModal = () => { modal.hidden = false; $('#fn').focus(); }, closeModal = () => modal.hidden = true;
$$('[data-modal]').forEach(b => b.addEventListener('click', openModal));
$('#mx').onclick = closeModal; modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#fn').value.trim(), m = $('#fe').value.trim();
  $('#e1').textContent = n ? '' : 'Enter your name.';
  $('#e2').textContent = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) ? '' : 'Enter a valid work email, like name@company.com.';
  $('#fn').setAttribute('aria-invalid', !n); $('#fe').setAttribute('aria-invalid', !!$('#e2').textContent);
  if (n && !$('#e2').textContent) { const sb = $('button[type=submit]', form); sb.classList.add('loading'); sb.disabled = true; setTimeout(() => { sb.classList.remove('loading'); sb.disabled = false; $('#ok').hidden = false; form.reset(); }, 900); }
});

/* ---------- CTA particles ---------- */

/* ===== Upgrade: particles (hero + CTA) ===== */
const particles = (id, n) => { if (reduce) return; $(id).innerHTML = Array.from({ length: n }, () => `<i style="left:${Math.random()*100}%;bottom:-20px;width:${4+Math.random()*7}px;height:${4+Math.random()*7}px;animation-duration:${8+Math.random()*9}s;animation-delay:${-Math.random()*12}s"></i>`).join(''); };
particles('#particles', 16); particles('#heroP', 9);

/* ===== Upgrade: reveal variants + stagger ===== */
$$('.fl,.fr,.sc').forEach(() => {});
$$('.grid,.kpis,.stats').forEach(g => $$('.rv', g).forEach((c, i) => c.style.transitionDelay = i * 90 + 'ms'));
$$('.rv').forEach(el => io.observe(el));

/* ===== Upgrade: hero parallax (mouse + scroll, rAF-throttled) ===== */
const hero = $('.hero'), floats = $$('.visual .float'); let ticking = false;
if (!reduce) {
  hero.addEventListener('mousemove', e => { const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5); floats.forEach((f, i) => f.style.translate = `${x * (i + 1) * -14}px ${y * (i + 1) * -10}px`); });
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const p = $('[data-parallax]'); if (p) p.style.setProperty('--py', Math.min(scrollY, 600) * .06 + 'px'); ticking = false; }); }, { passive: true });
}

/* ===== Upgrade: tracking map simulation ===== */
(() => {
  const path = $('#route2'), mk = $('#mk'), pins = $('#pins'); if (!path) return;
  const L = path.getTotalLength(), FR = [0, .34, .67, 1], NAMES = ['IT Office', 'Collection Center', 'Sorting Facility', 'Recycling Center'], KM = ['12 km', '9 km', '18 km'], COL = ['#3B82F6', '#8B5CF6', '#7C3AED', '#6D28D9'];
  pins.innerHTML = FR.map((f, i) => { const p = path.getPointAtLength(f * L); return `<g class="pin"><circle class="ping" cx="${p.x}" cy="${p.y}" r="12"/><circle cx="${p.x}" cy="${p.y}" r="11" fill="${COL[i]}" stroke="#fff" stroke-width="3"/><text x="${p.x}" y="${p.y + (p.y > 200 ? 34 : -20)}" text-anchor="middle">${NAMES[i]}</text></g>`; }).join('') +
    KM.map((k, i) => { const p = path.getPointAtLength((FR[i] + FR[i + 1]) / 2 * L); return `<text class="km" x="${p.x}" y="${p.y - 12}" text-anchor="middle">${k}</text>`; }).join('');
  const loc = $('#tLoc'), pct = $('#tPct'), bar = $('#tProg'); let t0, last = -1;
  const place = p => { const pt = path.getPointAtLength(p * L); mk.setAttribute('transform', `translate(${pt.x} ${pt.y})`); const idx = FR.filter(f => p >= f).length - 1; if (idx !== last) { last = idx; loc.textContent = NAMES[Math.min(idx, 3)]; } pct.textContent = Math.round(p * 100) + '%'; bar.style.width = p * 100 + '%'; };
  if (reduce) return place(.5);
  const frame = ts => { t0 = t0 ?? ts; place(((ts - t0) / 24000) % 1); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
})();

/* ===== Upgrade: technology ecosystem ===== */
(() => {
  const ECO = [['AI','Classifies devices and recommends reuse, recover or recycle.'],['IoT','Smart tags and sensors report location and condition.'],['Cloud','One shared record for every asset, accessible anywhere.'],['QR Tracking','Scan at each handoff to log custody.'],['Analytics','Turns tracking data into clear trends.'],['Automation','Schedules pickups and sends alerts automatically.'],['Data Security','Verified wiping before any device leaves.'],['Impact Reporting','CO₂ and material recovery reports on demand.']];
  const svg = $('#ecoSvg'), info = $('#ecoInfo'), pos = i => { const a = i / 8 * 2 * Math.PI - Math.PI / 2; return [350 + 260 * Math.cos(a), 230 + 170 * Math.sin(a)]; };
  svg.innerHTML = ECO.map((_, i) => { const [x, y] = pos(i); return `<line class="el" id="el${i}" x1="350" y1="230" x2="${x}" y2="${y}"/>`; }).join('') +
    `<circle cx="350" cy="230" r="62" fill="url(#cg)" class="core"/><defs><linearGradient id="cg"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs><text x="350" y="226" class="ct">ECOTRACK</text><text x="350" y="246" class="ct">AI</text>` +
    ECO.map(([n], i) => { const [x, y] = pos(i); return `<g class="en" tabindex="0" data-i="${i}"><rect x="${x-62}" y="${y-20}" width="124" height="40" rx="20"/><text x="${x}" y="${y+5}">${n}</text></g>`; }).join('');
  const set = (i, on) => { $(`#el${i}`).classList.toggle('hl', on); $(`.en[data-i="${i}"]`, svg).classList.toggle('hl', on); if (on) info.textContent = `${ECO[i][0]}: ${ECO[i][1]}`; };
  $$('.en', svg).forEach(n => { const i = +n.dataset.i; ['mouseenter', 'focus'].forEach(ev => n.addEventListener(ev, () => set(i, true))); ['mouseleave', 'blur'].forEach(ev => n.addEventListener(ev, () => set(i, false))); });
})();

/* ===== Upgrade: circular economy flow ===== */
(() => {
  const CF = [['Old IT Equipment','trash'],['Collection','pin'],['Data Sanitization','lock'],['Inspection','eye'],['Refurbishment','check'],['Component Recovery','cpu'],['Recycling','cycle'],['New Resources','leaf']];
  const svg = $('#cfSvg'), cx = 390, cy = 270, R = 190, P = i => { const a = i / 8 * 2 * Math.PI - Math.PI / 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a), Math.cos(a)]; };
  const arcs = CF.map((_, i) => { const [x0, y0] = P(i), [x1, y1] = P((i + 1) % 8); return `<path class="cf-arc" pathLength="1" style="transition-delay:${i * .25 + .2}s" d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}"/>`; }).join('');
  const nodes = CF.map(([n, ic], i) => { const [x, y, c] = P(i), lx = x + (c > .3 ? 46 : c < -.3 ? -46 : 0), ly = y + (Math.abs(c) <= .3 ? (y < cy ? -46 : 52) : 5), an = c > .3 ? 'start' : c < -.3 ? 'end' : 'middle'; return `<g class="cf-n" style="transition-delay:${i * .25}s"><circle cx="${x}" cy="${y}" r="32"/><svg x="${x-14}" y="${y-14}" width="28" height="28" viewBox="0 0 24 24" class="cfi">${ICONS[ic]}</svg><text x="${lx}" y="${ly}" text-anchor="${an}">${n}</text></g>`; }).join('');
  svg.innerHTML = arcs + nodes + `<text x="${cx}" y="${cy-4}" text-anchor="middle" class="cf-c">Circular</text><text x="${cx}" y="${cy+18}" text-anchor="middle" class="cf-c">Economy</text>`;
})();
