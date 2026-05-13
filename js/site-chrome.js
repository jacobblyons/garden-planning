/* Site chrome: injects sidebar + top tabs around page content.
 * Usage on each page:
 *   <body class="site" data-tab="overview|bed-4x10|bed-3x9|bed-3x3|pots|harvest|shopping"
 *         data-season="spring-2026">
 *     <main class="site-main"> ... page content ... </main>
 *     <script src="garden-data.js"><\/script>
 *     <script src="site-chrome.js"><\/script>
 */

(function(){
  const tabs = [
    { key:'overview',  href:'index.html',      num:'§ 00', label:'Overview' },
    { key:'bed-4x10',  href:'bed-4x10.html',   num:'§ 03', label:'4 × 10 bed' },
    { key:'bed-3x9',   href:'bed-3x9.html',    num:'§ 04', label:'3 × 9 bed' },
    { key:'bed-3x3',   href:'bed-3x3.html',    num:'§ 05', label:'3 × 3 herbs' },
    { key:'pots',      href:'pots.html',       num:'§ 06', label:'Tomato pots' },
    { key:'harvest',   href:'harvest.html',    num:'§ 07', label:'Harvest cues' },
    { key:'shopping',  href:'shopping.html',   num:'§ 08', label:'Shopping list' },
  ];

  const seasons = [
    { key:'spring-2026', label:'Spring / Summer', sub:'2026', active:true },
  ];

  const body = document.body;
  const activeTab = body.dataset.tab || 'overview';
  const activeSeason = body.dataset.season || 'spring-2026';

  // Pull any <main class="site-main"> the page already has and preserve it
  let mainEl = body.querySelector('main.site-main');
  if (!mainEl) {
    // Wrap whatever is in body into a main
    mainEl = document.createElement('main');
    mainEl.className = 'site-main';
    while (body.firstChild) mainEl.appendChild(body.firstChild);
  } else {
    mainEl.remove(); // we'll re-insert into shell
  }

  // Build shell
  const shell = document.createElement('div');
  shell.className = 'site-shell';
  // restore collapsed state from localStorage
  if (localStorage.getItem('garden.sideCollapsed') === '1') shell.classList.add('sidebar-collapsed');

  // Sidebar
  const side = document.createElement('aside');
  side.className = 'site-side';
  side.innerHTML = `
    <div class="side-top">
      <div class="side-logo" aria-hidden="true"></div>
      <div class="brand">Bothell<br><em>garden plan</em></div>
      <button class="side-toggle" type="button" aria-label="Collapse sidebar">‹</button>
    </div>
    <div class="side-section-title">Growing seasons</div>
    <div class="side-section">
      ${seasons.map(s => `
        <a class="side-link ${s.active && s.key===activeSeason ? 'active' : ''} ${s.disabled ? 'disabled' : ''}"
           href="${s.disabled ? 'javascript:void(0)' : 'index.html'}">
          <span class="dot"></span>
          <span class="side-link-text">
            ${s.label}
            <em>${s.sub}</em>
          </span>
        </a>
      `).join('')}
    </div>
    <div class="side-foot">
      Bothell, WA · 98012<br>
      Zone 8b · Revision 01
    </div>
  `;

  // Top bar
  const top = document.createElement('div');
  top.className = 'site-top';
  top.innerHTML = `
    <button class="mobile-menu-btn" type="button" aria-label="Open menu">☰</button>
    <nav class="site-tabs">
      ${tabs.map(t => `
        <a class="site-tab ${t.key===activeTab ? 'active' : ''}" href="${t.href}">
          <span class="tab-num">${t.num}</span>
          <span>${t.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="site-top-right">
      <span class="loc">Lat <b>47.8°N</b> · Zone <b>8b</b></span>
    </div>
  `;

  // Backdrop for mobile sidebar
  const backdrop = document.createElement('div');
  backdrop.className = 'site-backdrop';

  shell.appendChild(side);
  shell.appendChild(top);
  shell.appendChild(mainEl);
  shell.appendChild(backdrop);

  body.appendChild(shell);

  // Sidebar collapse
  const toggleBtn = side.querySelector('.side-toggle');
  toggleBtn.addEventListener('click', () => {
    shell.classList.toggle('sidebar-collapsed');
    const collapsed = shell.classList.contains('sidebar-collapsed');
    localStorage.setItem('garden.sideCollapsed', collapsed ? '1' : '0');
    toggleBtn.textContent = collapsed ? '›' : '‹';
  });
  toggleBtn.textContent = shell.classList.contains('sidebar-collapsed') ? '›' : '‹';

  // Mobile menu
  const menuBtn = top.querySelector('.mobile-menu-btn');
  menuBtn.addEventListener('click', () => shell.classList.add('mobile-open'));
  backdrop.addEventListener('click', () => shell.classList.remove('mobile-open'));

  // Scroll active tab into view on mobile
  const activeTabEl = top.querySelector('.site-tab.active');
  if (activeTabEl) activeTabEl.scrollIntoView({inline:'center', block:'nearest', behavior:'instant'});
})();

