
function sitePlanAside() {
  return `
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--green);margin-bottom:6px">Siting decisions</div>
    <p style="margin:0 0 10px"><b>3×9 against the fence</b> → attach a cattle panel or bamboo trellis directly to the fence for cucumbers + indeterminate tomatoes. The fence stores heat and extends the pepper season.</p>
    <p style="margin:0 0 10px"><b>4×10 freestanding</b> → access from all sides means you can rotate broccoli → beans, carrots + onions, and lettuce on the shaded east end without reaching over anything.</p>
    <p style="margin:0 0 10px"><b>3×3 standing bed</b> → move to the kitchen path, whichever side of the house you cook on. Herbs get snipped 3×/week; you want them 10 steps from the stove.</p>
    <p style="margin:0"><b>Pots</b> → 2–3 large (15+ gal) for extra tomatoes; place near the 3×9 so one drip line waters bed + pots. Determinate varieties do well in pots; indeterminates go in the fence bed.</p>
  `;
}


/* Garden plan renderer — draws each bed as a to-scale SVG with plant icons,
 * labels, and succession callouts. 1 ft = 30 px in SVG units. */

const FT = 30; // px per foot

const COLORS = {
  fruit: 'oklch(0.62 0.14 28)',       // tomato red
  root:  'oklch(0.74 0.12 80)',       // ochre
  leafy: '#6d8554',
  herb:  '#8ea872',
  vine:  '#c9b37e',
  brassica: '#556b44',
  berry: 'oklch(0.55 0.14 10)',       // strawberry red, warmer than tomato
  paper: '#ece6d1',
  ink: '#1f2a20',
};

// ---------- SVG helpers ----------
function svgEl(wFt, hFt, title, compass='N') {
  const w = wFt * FT, h = hFt * FT;
  const padL = 22, padT = 22, padR = 14, padB = 22;
  const W = w + padL + padR, H = h + padT + padB;
  const s = [];
  s.push(`<svg class="bed-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`);
  // grid
  for (let x = 0; x <= wFt; x++) {
    s.push(`<line class="cell-line" x1="${padL + x*FT}" y1="${padT}" x2="${padL + x*FT}" y2="${padT + h}"/>`);
  }
  for (let y = 0; y <= hFt; y++) {
    s.push(`<line class="cell-line" x1="${padL}" y1="${padT + y*FT}" x2="${padL + w}" y2="${padT + y*FT}"/>`);
  }
  // ruler marks (feet)
  for (let x = 0; x <= wFt; x++) {
    s.push(`<text class="ruler" x="${padL + x*FT}" y="${padT - 6}" text-anchor="middle">${x}</text>`);
  }
  for (let y = 0; y <= hFt; y++) {
    s.push(`<text class="ruler" x="${padL - 6}" y="${padT + y*FT + 2}" text-anchor="end">${y}</text>`);
  }
  // border
  s.push(`<rect class="plot-border" x="${padL}" y="${padT}" width="${w}" height="${h}"/>`);
  // compass mark (top-right)
  s.push(`<g transform="translate(${W - 16}, ${padT + 10})">
    <circle r="8" fill="${COLORS.paper}" stroke="${COLORS.ink}" stroke-width="0.6"/>
    <line x1="0" y1="-6" x2="0" y2="6" stroke="${COLORS.ink}" stroke-width="0.6"/>
    <text class="compass" y="-9">${compass}</text>
  </g>`);
  return { open: s.join(''), W, H, padL, padT, w, h };
}
function closeSvg() { return '</svg>'; }

// Draw a labeled rectangular zone
function zone(x, y, w, h, color, label, padL, padT) {
  return `
    <rect class="zone-fill" x="${padL + x*FT}" y="${padT + y*FT}" width="${w*FT}" height="${h*FT}" fill="${color}" stroke="${color}"/>
    <text class="plant-label" x="${padL + (x + w/2)*FT}" y="${padT + (y + h/2)*FT + 2}">${label}</text>
  `;
}

// Draw plant dots at ft-coords
function plants(coords, color, r, padL, padT) {
  return coords.map(([x,y]) =>
    `<circle class="plant-dot" cx="${padL + x*FT}" cy="${padT + y*FT}" r="${r}" fill="${color}"/>`
  ).join('');
}

// Add a label centered at ft-coord
function txt(x, y, str, padL, padT, cls='plant-label') {
  return `<text class="${cls}" x="${padL + x*FT}" y="${padT + y*FT + 2}">${str}</text>`;
}

// Grid of plants across a zone
function gridPlants(x0, y0, w, h, cols, rows, color, r, padL, padT) {
  const out = [];
  const dx = w / cols, dy = h / rows;
  for (let c = 0; c < cols; c++) {
    for (let rr = 0; rr < rows; rr++) {
      const px = x0 + dx*(c + 0.5);
      const py = y0 + dy*(rr + 0.5);
      out.push(`<circle class="plant-dot" cx="${padL + px*FT}" cy="${padT + py*FT}" r="${r}" fill="${color}"/>`);
    }
  }
  return out.join('');
}

// Trellis marker (dashed line along one edge)
function trellisLine(x1, y1, x2, y2, padL, padT) {
  return `<line class="trellis" x1="${padL + x1*FT}" y1="${padT + y1*FT}" x2="${padL + x2*FT}" y2="${padT + y2*FT}"/>`;
}

// ---------- LAYOUT A: Classic companion ----------
function bed4x10_A() {
  // Drawn VERTICAL: 4 ft wide × 10 ft tall. North = top (matches site plan).
  const e = svgEl(4, 10, '4×10 — Main bed', 'N');
  let body = '';

  // ---- Band 1 (NORTH end, y 0..2.5): PEPPERS + BASIL
  //      Peppers moved to the tall end so they catch full sun without shading
  //      the rest of the bed. Basil interplanted — deters aphids, shares water.
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT}" width="${4*FT}" height="${2.5*FT}" fill="${COLORS.fruit}" stroke="${COLORS.fruit}"/>`;
  // 3 bell peppers in front row + 2 jalapeños in back row (within 4×2.5)
  const bellCoords = [[0.8, 1.6],[2, 1.6],[3.2, 1.6]];
  for (const [x,y] of bellCoords) {
    body += `<circle class="plant-dot" cx="${e.padL + x*FT}" cy="${e.padT + y*FT}" r="7.5" fill="${COLORS.fruit}"/>`;
  }
  const jalapCoords = [[1.3, 0.9],[2.7, 0.9]];
  for (const [x,y] of jalapCoords) {
    body += `<circle class="plant-dot" cx="${e.padL + x*FT}" cy="${e.padT + y*FT}" r="6" fill="${COLORS.fruit}"/>`;
  }
  // basil between peppers (4 plants)
  const basilCoords = [[2, 0.45],[0.6, 2.2],[2, 2.2],[3.4, 2.2]];
  for (const [x,y] of basilCoords) {
    body += `<circle class="plant-dot" cx="${e.padL + x*FT}" cy="${e.padT + y*FT}" r="3.5" fill="${COLORS.herb}"/>`;
  }
  body += txt(2, 0.22, 'BELL ×3 · JALAPEÑO ×2 · BASIL', e.padL, e.padT);

  // ---- Band 2 (y 2.5..4.0): FILET BEANS (Maxibel — tender haricots verts, fix N)
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 2.5*FT}" width="${4*FT}" height="${1.5*FT}" fill="${COLORS.leafy}" stroke="${COLORS.leafy}"/>`;
  body += txt(2, 2.72, 'FILET BEANS ×12 · Maxibel · 2 rows', e.padL, e.padT);
  // 2 rows of 6
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 6; i++) {
      body += `<circle class="plant-dot" cx="${e.padL + (0.4 + i*0.65)*FT}" cy="${e.padT + (3.1 + r*0.55)*FT}" r="3" fill="${COLORS.leafy}"/>`;
    }
  }

  // ---- Band 3 (y 4.0..5.5): ZUCCHINI
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 4*FT}" width="${4*FT}" height="${1.5*FT}" fill="${COLORS.leafy}" stroke="${COLORS.leafy}"/>`;
  body += txt(2, 4.22, 'ZUCCHINI ×1 · MARIGOLDS ×4', e.padL, e.padT);
  body += `<circle class="plant-dot" cx="${e.padL + 2*FT}" cy="${e.padT + 4.9*FT}" r="14" fill="${COLORS.leafy}"/>`;
  // marigolds in corners
  for (const [x,y] of [[0.5,4.7],[3.5,4.7],[0.5,5.3],[3.5,5.3]]) {
    body += `<circle class="plant-dot" cx="${e.padL + x*FT}" cy="${e.padT + y*FT}" r="3" fill="${COLORS.root}"/>`;
  }

  // ---- Band 4 (y 5.5..7.5): CARROTS (west 2ft) + ONIONS (east 2ft)
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 5.5*FT}" width="${2*FT}" height="${2*FT}" fill="${COLORS.root}" stroke="${COLORS.root}"/>`;
  body += txt(1, 5.73, 'CARROTS', e.padL, e.padT);
  body += gridPlants(0.1, 5.95, 1.9, 1.5, 3, 7, COLORS.root, 1.4, e.padL, e.padT);

  body += `<rect class="zone-fill" x="${e.padL + 2*FT}" y="${e.padT + 5.5*FT}" width="${2*FT}" height="${2*FT}" fill="${COLORS.root}" stroke="${COLORS.root}"/>`;
  body += txt(3, 5.73, 'ONIONS ×24', e.padL, e.padT);
  body += gridPlants(2.1, 5.95, 1.9, 1.5, 4, 6, COLORS.root, 1.9, e.padL, e.padT);

  // ---- Band 5 (y 7.5..9.5): LETTUCE grid
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 7.5*FT}" width="${4*FT}" height="${2*FT}" fill="${COLORS.leafy}" stroke="${COLORS.leafy}"/>`;
  body += txt(2, 7.72, 'LETTUCE · cut-and-come', e.padL, e.padT);
  body += gridPlants(0.1, 7.95, 3.9, 1.5, 7, 4, COLORS.leafy, 2.4, e.padL, e.padT);

  // ---- Band 6 (y 9.5..10): MARIGOLD south border
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 9.5*FT}" width="${4*FT}" height="${0.5*FT}" fill="${COLORS.root}" stroke="${COLORS.root}" opacity="0.55"/>`;
  for (let i = 0; i < 8; i++) {
    body += `<circle class="plant-dot" cx="${e.padL + (0.25 + i*0.5)*FT}" cy="${e.padT + 9.75*FT}" r="2" fill="${COLORS.root}"/>`;
  }
  body += txt(2, 9.77, 'MARIGOLD BORDER', e.padL, e.padT);

  // ---- Annotations
  // North label at top (outside bed)
  body += `<text x="${e.padL + 2*FT}" y="${e.padT - 10}" font-family="JetBrains Mono,monospace" font-size="7" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="3" opacity="0.6">↑ NORTH · TALL END</text>`;
  // South label at bottom
  body += `<text x="${e.padL + 2*FT}" y="${e.padT + 10*FT + 15}" font-family="JetBrains Mono,monospace" font-size="7" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="3" opacity="0.6">SOUTH · LOW END ↓</text>`;
  // E/W labels on sides (rotated)
  body += `<text transform="translate(${e.padL - 14}, ${e.padT + 5*FT}) rotate(-90)" font-family="JetBrains Mono,monospace" font-size="6.5" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="2" opacity="0.45">WEST</text>`;
  body += `<text transform="translate(${e.padL + 4*FT + 8}, ${e.padT + 5*FT}) rotate(90)" font-family="JetBrains Mono,monospace" font-size="6.5" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="2" opacity="0.45">EAST</text>`;

  return e.open + body + closeSvg();
}

function bed3x9_A() {
  const e = svgEl(9, 3, '3×9 — Trellis bed against fence', 'N');
  let body = '';
  // Row 0..0.5 (NORTH / fence side): trellis with pole beans + cucumbers
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT}" width="${9*FT}" height="${0.5*FT}" fill="${COLORS.vine}" stroke="${COLORS.vine}"/>`;
  body += trellisLine(0, 0.04, 9, 0.04, e.padL, e.padT);
  // 0..4 pole beans
  for (let i = 0; i < 4; i++) {
    body += `<circle class="plant-dot" cx="${e.padL + (0.5 + i)*FT}" cy="${e.padT + 0.25*FT}" r="3" fill="${COLORS.leafy}"/>`;
  }
  body += txt(2, 0.78, 'POLE BEANS ×4 · trellised', e.padL, e.padT);
  // 4..9 cucumbers
  for (let i = 0; i < 5; i++) {
    body += `<circle class="plant-dot" cx="${e.padL + (4.5 + i)*FT}" cy="${e.padT + 0.25*FT}" r="3.5" fill="${COLORS.vine}"/>`;
  }
  body += txt(6.5, 0.78, 'CUCUMBER ×5 · trellised', e.padL, e.padT);

  // Row 1..2 (middle-left, 0..4 ft): BROCCOLI block — inspectable florets
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 1*FT}" width="${4*FT}" height="${2*FT}" fill="${COLORS.brassica}" stroke="${COLORS.brassica}"/>`;
  body += gridPlants(0, 1, 4, 2, 2, 2, COLORS.brassica, 7, e.padL, e.padT);
  body += txt(2, 1.15, 'BROCCOLI ×4', e.padL, e.padT);
  body += txt(2, 2.82, 'spring + beets + fall — see timeline', e.padL, e.padT);

  // Row 1..2 (middle-right, 4..9 ft): YELLOW SQUASH (2 plants, sprawls under trellis)
  body += `<rect class="zone-fill" x="${e.padL + 4*FT}" y="${e.padT + 1*FT}" width="${5*FT}" height="${2*FT}" fill="${COLORS.vine}" stroke="${COLORS.vine}"/>`;
  // 2 large squash plants
  body += `<circle class="plant-dot" cx="${e.padL + 5.3*FT}" cy="${e.padT + 2*FT}" r="14" fill="${COLORS.vine}"/>`;
  body += `<circle class="plant-dot" cx="${e.padL + 7.7*FT}" cy="${e.padT + 2*FT}" r="14" fill="${COLORS.vine}"/>`;
  body += txt(6.5, 1.15, 'YELLOW SQUASH ×2', e.padL, e.padT);

  // Row 2..3 (south-left, 0..4 ft): STRAWBERRIES — perennial patch
  body += `<rect class="zone-fill" x="${e.padL}" y="${e.padT + 2*FT}" width="${4*FT}" height="${1*FT}" fill="${COLORS.berry}" stroke="${COLORS.berry}"/>`;
  // 10 strawberry plants in 2 offset rows
  for (let r = 0; r < 2; r++) {
    const off = r % 2 === 0 ? 0.35 : 0.7;
    for (let i = 0; i < 5; i++) {
      body += `<circle class="plant-dot" cx="${e.padL + (off + i*0.75)*FT}" cy="${e.padT + (2.3 + r*0.4)*FT}" r="3.5" fill="${COLORS.berry}"/>`;
    }
  }
  body += txt(2, 2.15, 'STRAWBERRIES ×10 · perennial', e.padL, e.padT);

  // Row 2..3 (south-right, 4..9 ft): BEETS + LETTUCE succession
  body += `<rect class="zone-fill" x="${e.padL + 4*FT}" y="${e.padT + 2*FT}" width="${5*FT}" height="${1*FT}" fill="${COLORS.root}" stroke="${COLORS.root}"/>`;
  body += gridPlants(4, 2, 5, 1, 8, 2, COLORS.root, 2.2, e.padL, e.padT);
  body += txt(6.5, 2.15, 'BEETS · then LETTUCE', e.padL, e.padT);

  body += `<text x="${e.padL + 4.5*FT}" y="${e.padT - 9}" font-family="JetBrains Mono,monospace" font-size="7" fill="${COLORS.ink}" text-anchor="middle" letter-spacing="3" opacity="0.55">↑ FENCE · TRELLIS ATTACHES HERE</text>`;

  return e.open + body + closeSvg();
}

function bed3x3_A() {
  const e = svgEl(3, 3, '3×3 standing — Kitchen herbs', 'N');
  let body = '';
  // 9 squares: core 5 herbs in strategic positions + mint (contained) + 3 extras
  // N row: oregano, basil (tallest, center), thyme
  // Mid row: parsley, chives, sage
  // S row: cilantro, dill, mint-in-pot
  const herbs = [
    ['OREGANO', COLORS.herb],
    ['BASIL',   COLORS.herb],
    ['THYME',   COLORS.herb],
    ['PARSLEY', COLORS.leafy],
    ['CHIVES',  COLORS.leafy],
    ['SAGE',    COLORS.herb],
    ['CILANTRO',COLORS.leafy],
    ['DILL',    COLORS.leafy],
    ['MINT',    COLORS.herb],
  ];
  for (let i = 0; i < 9; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const [name, color] = herbs[i];
    const cx = e.padL + (col+0.5)*FT;
    const cy = e.padT + row*FT;
    // cell fill
    body += `<rect class="zone-fill" x="${e.padL + col*FT}" y="${e.padT + row*FT}" width="${FT}" height="${FT}" fill="${color}" stroke="${color}"/>`;
    // dot near top of cell
    body += `<circle class="plant-dot" cx="${cx}" cy="${cy + FT*0.28}" r="5" fill="${color}"/>`;
    // name centered lower in cell (font 6.5 w/ halo)
    body += `<text class="plant-label" style="font-size:6.5px;font-weight:600" x="${cx}" y="${cy + FT*0.72}">${name}</text>`;
    // contained pot indicator for mint — small dashed ring
    if (name === 'MINT') {
      body += `<circle cx="${cx}" cy="${cy + FT*0.28}" r="8.5" fill="none" stroke="${COLORS.ink}" stroke-width="0.6" stroke-dasharray="1.5 1.5" opacity="0.7"/>`;
    }
  }
  // subtle grid lines between cells for the "9-square" feel
  for (let k = 1; k < 3; k++) {
    body += `<line x1="${e.padL + k*FT}" y1="${e.padT}" x2="${e.padL + k*FT}" y2="${e.padT + 3*FT}" stroke="${COLORS.ink}" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.5"/>`;
    body += `<line x1="${e.padL}" y1="${e.padT + k*FT}" x2="${e.padL + 3*FT}" y2="${e.padT + k*FT}" stroke="${COLORS.ink}" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.5"/>`;
  }
  return e.open + body + closeSvg();
}

// ---------- Bed card wrapper ----------
function bedCard(title, dim, svg) {
  return `
    <div class="bed">
      <div class="label"><b>${title}</b><span class="dim">${dim}</span></div>
      ${svg}
    </div>`;
}

// ---------- Notes per layout ----------
function notesA() {
  return `
    <div class="sub">Classic companion strategy</div>
    <h4>Three beds, one rotation, zero wasted square footage.</h4>
    <ul>
      <li><b>4×10</b>Nightshade block. Tomatoes on the <em>north edge</em> so they don't shade anything behind them. Basil between tomatoes deters hornworms and sharpens fruit flavor. Carrots + onions confuse each other's flies. Lettuce on the <em>south edge</em> gets summer shade from the tomatoes — perfect.</li>
      <li><b>3×9</b>Trellis bed. Pole beans + cucumbers climb the fence; brassicas take the middle row; leafy greens in front. Beans fix nitrogen for next year's brassicas.</li>
      <li><b>3×3</b>Five culinary herbs you reach for constantly + backup greens. Mint in a sunk pot — never free in the bed.</li>
      <li><b>Pots</b>3 indeterminate tomatoes flanking the 4×10 — one cherry, one paste, one slicer. Different ripening curves = tomatoes every day Jul–Oct.</li>
    </ul>
    <div class="sub">Zone 8b windows</div>
    <ul>
      <li><b>Last frost</b>Apr 15 · <em>Set out warm crops Apr 25–May 5</em></li>
      <li><b>First frost</b>Nov 5 · <em>Pull tomatoes late Oct</em></li>
      <li><b>Cool waves</b>Feb, Aug — lettuce, brassicas, roots</li>
    </ul>
    <div class="sub">Yield target</div>
    <ul>
      <li><b>Tomato</b>~80 lb (5 bed + 3 pot)</li>
      <li><b>Cucumber</b>40+ fruits</li>
      <li><b>Beans</b>~15 lb fresh pole + bush</li>
      <li><b>Brassica</b>4 heads + side-shoots · kale & chard all summer</li>
    </ul>`;
}






// ---------- Per-bed page renderers ----------

// Slot-based succession timeline renderer.
// A "slot" is a physical patch of bed. Multiple crops can occupy the same slot
// sequentially across the season — this renders each as a bar positioned by
// month, with a ▶ handoff arrow between consecutive crops in the same slot.
//
// `slots` is an array of { slot: string, tag: string, crops: [{ name, start, end, color, marks? }] }
//   start/end are month indices 0..8 where 0 = Mar, 8 = Nov. end is exclusive.
//   color is one of c-tom c-och c-g1 c-g2 c-g3 c-g4
//   marks (optional) is an array of { at, label } for inline callouts (at = month idx).
function succession(slots) {
  const MONTHS = ['MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV'];
  let legend = `<div class="succ-legend">
    <span><b>Slot</b> a patch of bed</span>
    <span><span class="lg-arrow">▶</span> one crop pulled, another planted</span>
    <span><span class="lg-dash"></span> gap — nothing planted here</span>
    <span><span class="lg-stack"></span> two crops overlap in time</span>
    <span><span style="display:inline-block;width:14px;height:10px;background:#f2c94c;border:1px solid #1f2a20;vertical-align:-1px;margin-right:4px"></span><b>PICK</b> peak harvest — walk the row every 2–3 days</span>
  </div>`;
  let head = '<div class="succ-head"><span class="sh first">SLOT</span>';
  for (const m of MONTHS) head += `<span class="sh">${m}</span>`;
  head += '<span></span></div>';

  let rows = '';
  for (const s of slots) {
    // Assign each crop to a sublane so overlapping bars don't collide.
    const lanes = []; // array of end-positions per lane
    const assigned = s.crops.map(c => {
      for (let li = 0; li < lanes.length; li++) {
        if (c.start >= lanes[li]) { lanes[li] = c.end; return li; }
      }
      lanes.push(c.end); return lanes.length - 1;
    });
    const twoLane = lanes.length > 1;
    rows += `<div class="succ-row"><div class="succ-slot">${s.slot}<span class="tag">${s.tag}</span></div>`;
    rows += `<div class="succ-track${twoLane ? ' two-lane' : ''}">`;
    rows += '<div class="grid">' + '<span></span>'.repeat(9) + '</div>';
    for (let i = 0; i < s.crops.length; i++) {
      const c = s.crops[i];
      const lane = assigned[i];
      const leftPct = (c.start / 9) * 100;
      const widthPct = ((c.end - c.start) / 9) * 100;
      const span = c.end - c.start;
      const top = twoLane ? (lane === 0 ? 4 : 22) : 8;
      const hasPeak = Array.isArray(c.peak) && c.peak.length === 2;
      let label = c.name;
      if (c.endLabel && span >= 3) label += `<span class="lend">${c.endLabel}</span>`;
      rows += `<div class="succ-bar ${c.color}${hasPeak ? ' has-peak' : ''}" style="left:${leftPct}%;width:calc(${widthPct}% - 2px);top:${top}px">${label}</div>`;
      if (hasPeak) {
        const pStart = Math.max(c.peak[0], c.start);
        const pEnd = Math.min(c.peak[1], c.end);
        if (pEnd > pStart) {
          const pLeft = (pStart / 9) * 100;
          const pWidth = ((pEnd - pStart) / 9) * 100;
          const pSpan = pEnd - pStart;
          const showText = pSpan >= 1.8;
          const pLabel = showText ? 'PICK' : '◆';
          const peakClass = showText ? 'succ-peak with-dot' : 'succ-peak';
          rows += `<div class="${peakClass}" style="left:${pLeft}%;width:calc(${pWidth}% - 2px);top:${top}px">${pLabel}</div>`;
        }
      }
    }
    // arrows only between consecutive non-overlapping crops in the same lane
    for (let li = 0; li < lanes.length; li++) {
      const inLane = s.crops.map((c, i) => ({c, i})).filter(x => assigned[x.i] === li);
      for (let k = 1; k < inLane.length; k++) {
        const prev = inLane[k-1].c, next = inLane[k].c;
        if (next.start >= prev.end) {
          const gap = next.start - prev.end;
          const top = twoLane ? (li === 0 ? 4 : 22) : 8;
          if (gap >= 2) {
            // draw a dashed bridge across the gap with a label if provided
            const leftPct = (prev.end / 9) * 100;
            const widthPct = (gap / 9) * 100;
            const gapLabel = next.gapLabel || '';
            rows += `<div class="succ-gap" style="left:${leftPct}%;width:${widthPct}%;top:${top}px">${gapLabel}</div>`;
          } else {
            const atPct = (prev.end / 9) * 100;
            rows += `<div class="succ-arrow" style="left:${atPct}%;top:${top + 1}px">▶</div>`;
          }
        }
      }
    }
    rows += '</div></div>';
  }

  // ----- Mobile card version ------------------------------------------------
  // One card per slot. Each card: title + tag + a 9-cell month strip +
  // a full-width track with crop bars positioned by month, plus a text
  // summary line per crop so narrow bars don't have to carry all the info.
  const MONTHS_ABBR = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];
  let mobileCards = '';
  for (const s of slots) {
    const lanes = [];
    const assigned = s.crops.map(c => {
      for (let li = 0; li < lanes.length; li++) {
        if (c.start >= lanes[li]) { lanes[li] = c.end; return li; }
      }
      lanes.push(c.end); return lanes.length - 1;
    });
    const twoLane = lanes.length > 1;

    let bars = '<div class="grid">' + '<span></span>'.repeat(9) + '</div>';
    for (let i = 0; i < s.crops.length; i++) {
      const c = s.crops[i];
      const lane = assigned[i];
      const leftPct = (c.start / 9) * 100;
      const widthPct = ((c.end - c.start) / 9) * 100;
      const top = twoLane ? (lane === 0 ? 3 : 21) : 7;
      const hasPeak = Array.isArray(c.peak) && c.peak.length === 2;
      bars += `<div class="succ-bar ${c.color}${hasPeak ? ' has-peak' : ''}" style="left:${leftPct}%;width:calc(${widthPct}% - 2px);top:${top}px">${c.name}</div>`;
      if (hasPeak) {
        const pStart = Math.max(c.peak[0], c.start);
        const pEnd = Math.min(c.peak[1], c.end);
        if (pEnd > pStart) {
          const pLeft = (pStart / 9) * 100;
          const pWidth = ((pEnd - pStart) / 9) * 100;
          const showText = (pEnd - pStart) >= 1.8;
          const pLabel = showText ? 'PICK' : '◆';
          const peakClass = showText ? 'succ-peak with-dot' : 'succ-peak';
          bars += `<div class="${peakClass}" style="left:${pLeft}%;width:calc(${pWidth}% - 2px);top:${top}px">${pLabel}</div>`;
        }
      }
    }
    for (let li = 0; li < lanes.length; li++) {
      const inLane = s.crops.map((c, i) => ({c, i})).filter(x => assigned[x.i] === li);
      for (let k = 1; k < inLane.length; k++) {
        const prev = inLane[k-1].c, next = inLane[k].c;
        if (next.start >= prev.end) {
          const gap = next.start - prev.end;
          const top = twoLane ? (li === 0 ? 3 : 21) : 7;
          if (gap >= 2) {
            const leftPct = (prev.end / 9) * 100;
            const widthPct = (gap / 9) * 100;
            bars += `<div class="succ-gap" style="left:${leftPct}%;width:${widthPct}%;top:${top}px">${next.gapLabel || ''}</div>`;
          } else {
            const atPct = (prev.end / 9) * 100;
            bars += `<div class="succ-arrow" style="left:${atPct}%;top:${top + 1}px">▶</div>`;
          }
        }
      }
    }

    // Text summary: `Pepper + basil · May → Oct · peak Jul`
    const cropLines = s.crops.map(c => {
      const from = MONTHS_ABBR[c.start] || '';
      const endIdx = Math.max(0, Math.min(c.end - 1, MONTHS_ABBR.length - 1));
      const to = MONTHS_ABBR[endIdx] || '';
      const range = from === to ? from : `${from} → ${to}`;
      const parts = [range];
      if (Array.isArray(c.peak) && c.peak.length === 2) {
        const pA = MONTHS_ABBR[Math.floor(c.peak[0])] || '';
        const pB = MONTHS_ABBR[Math.min(MONTHS_ABBR.length - 1, Math.max(0, Math.floor(c.peak[1]) - 1))] || '';
        parts.push(pA === pB ? `peak ${pA}` : `peak ${pA}–${pB}`);
      }
      if (c.endLabel) parts.push(c.endLabel);
      if (c.gapLabel) parts.push(`<em>${c.gapLabel}</em>`);
      return `<div><b>${c.name}</b> ${parts.join(' · ')}</div>`;
    }).join('');

    const monthRow = MONTHS_ABBR.map(m => `<span>${m.toUpperCase()}</span>`).join('');
    mobileCards += `
      <div class="succ-card">
        <div class="succ-card-title">${s.slot}</div>
        <div class="succ-card-tag">${s.tag}</div>
        <div class="succ-card-months">${monthRow}</div>
        <div class="succ-card-track${twoLane ? ' two-lane' : ''}">${bars}</div>
        <div class="succ-card-notes">${cropLines}</div>
      </div>`;
  }

  const mobileLegend = `<div class="succ-mobile-legend">
    <span><b>Slot</b> a patch of bed</span>
    <span><span class="lg-arrow">▶</span> crop swap</span>
    <span><span class="lg-dash"></span> gap</span>
    <span><span class="lg-chip"></span>peak pick window</span>
  </div>`;

  const desktop = `<div class="succ">${legend}${head}${rows}</div>`;
  const mobile  = `<div class="succ-mobile"><div class="succ-mobile-wrap">${mobileLegend}${mobileCards}</div></div>`;
  return desktop + mobile;
}

function bedPage_410() {
  return `
    <div class="bp-diagram">${bed4x10_A()}</div>
    <aside class="bp-aside">
      <div class="sub">Role</div>
      <h4>The nightshade workhorse.</h4>
      <p>Freestanding in open grass with 4-sided access. Long axis runs <b>north–south</b>, so plant in bands across the short axis: tallest on the north end, shortest on the south so nothing casts shade on its neighbors.</p>

      <div class="sub">Sun · Soil · Water</div>
      <ul>
        <li><b>Sun</b>8+ hrs direct</li>
        <li><b>Soil</b>Amend with 2 in compost each April; pH 6.2–6.8</li>
        <li><b>Water</b>Drip at soil level, 1–1.5 in/week; more in August</li>
        <li><b>Amend</b>Bone meal at transplant (peppers)</li>
      </ul>

      <div class="sub">Spacing at a glance</div>
      <ul>
        <li><b>Bell pepper</b>18 in, single stake</li>
        <li><b>Jalapeño</b>18 in, unstaked</li>
        <li><b>Filet bean</b>4 in, 2 rows @ 18 in apart · pick at pencil thickness</li>
        <li><b>Zucchini</b>36 in, center</li>
        <li><b>Carrot</b>2 in, thin at 3 weeks</li>
        <li><b>Onion</b>4 in, mulch heavily</li>
        <li><b>Lettuce</b>8 in, cut-and-come-again</li>
      </ul>
    </aside>

    <div class="bp-wide">
      <h3><span class="hnum">A</span>Succession · crops that share a slot</h3>
      ${succession([
        { slot: 'Pepper row', tag: 'N edge · 3 bell + 2 jalapeño', crops: [
          { name: 'Pepper + basil', start: 2, end: 8, color: 'c-tom', endLabel: 'pull', peak: [5, 8] }
        ]},
        { slot: 'Filet bean row', tag: '4 × 1.5 ft · Maxibel · fixes N', crops: [
          { name: 'Filet bean · wave 1', start: 2, end: 5, color: 'c-g2', endLabel: 'pull', peak: [3.2, 4.5] },
          { name: 'Filet bean · wave 2', start: 5, end: 8, color: 'c-g2', endLabel: 'pull', peak: [6, 7.5] }
        ]},
        { slot: 'Squash corner', tag: 'mid bed · 1 plant', crops: [
          { name: 'Zucchini', start: 2, end: 7, color: 'c-g3', endLabel: 'spent', peak: [3.5, 6] }
        ]},
        { slot: 'Root strip', tag: '2 × 4 ft · intensive', crops: [
          { name: 'Carrot · wave 1', start: 1, end: 5, color: 'c-och', endLabel: 'pull', peak: [3.5, 4.8] },
          { name: 'Carrot · wave 2', start: 4, end: 8, color: 'c-och', endLabel: 'pull', peak: [6.5, 7.8] }
        ]},
        { slot: 'Onion strip', tag: '4 × 1 ft · 24 sets', crops: [
          { name: 'Onion sets', start: 0, end: 6, color: 'c-och', endLabel: 'cure', peak: [4.5, 5.8] }
        ]},
        { slot: 'Leafy slot', tag: '2 × 2 ft · cool-season', crops: [
          { name: 'Lettuce · wave 1', start: 0, end: 4, color: 'c-g2', endLabel: 'bolt', peak: [1.5, 3.5] },
          { name: 'Lettuce · wave 2', start: 5, end: 8, color: 'c-g2', endLabel: 'cut', gapLabel: 'summer rest · too hot', peak: [6, 7.5] }
        ]}
      ])}
    </div>

    <div class="bp-wide">
      <h3><span class="hnum">B</span>Companions · antagonists</h3>
      <div class="comp-tbl-wrap"><table class="comp-tbl">
        <thead><tr><th>Crop</th><th>Plant with</th><th>Keep away from</th><th>Spacing</th></tr></thead>
        <tbody>
          <tr><td class="crop">Pepper</td><td class="good">Basil, onion, carrot, marigold</td><td class="bad">Beans next to them, brassicas, fennel</td><td class="sp">18 in</td></tr>
          <tr><td class="crop">Filet bean</td><td class="good">Carrot, cucumber, radish, marigold</td><td class="bad">Onion, garlic, pepper · keep rows apart</td><td class="sp">4 in</td></tr>
          <tr><td class="crop">Zucchini</td><td class="good">Nasturtium, marigold, corn</td><td class="bad">Potato</td><td class="sp">36 in</td></tr>
          <tr><td class="crop">Carrot</td><td class="good">Onion, leek, chive, rosemary, lettuce</td><td class="bad">Dill (matures), parsnip</td><td class="sp">2 in</td></tr>
          <tr><td class="crop">Onion</td><td class="good">Carrot, beet, lettuce</td><td class="bad">Beans, peas</td><td class="sp">4 in</td></tr>
          <tr><td class="crop">Lettuce</td><td class="good">Carrot, onion, radish, strawberry</td><td class="bad">—</td><td class="sp">8 in</td></tr>
        </tbody>
      </table></div>
    </div>
  `;
}

function bedPage_39() {
  return `
    <div class="bp-diagram">${bed3x9_A()}</div>
    <aside class="bp-aside">
      <div class="sub">Role</div>
      <h4>Trellis bed · beans + cukes up the fence.</h4>
      <p>Sits along the north fence with 3-sided access. Attach a <b>6-ft cattle panel or bamboo trellis</b> to the fence so pole beans and cucumbers climb up and out of the way — freeing the middle of the bed for brassicas and greens.</p>

      <div class="sub">Sun · Soil · Water</div>
      <ul>
        <li><b>Sun</b>7+ hrs (fence casts a short morning shadow)</li>
        <li><b>Soil</b>Brassicas love compost — top-dress 2 in in April and again after July pull</li>
        <li><b>Water</b>Drip, steady; cukes bitter if drought-stressed</li>
        <li><b>Cover</b>Row cover on brassicas until flowering — cabbage moths</li>
      </ul>

      <div class="sub">Spacing at a glance</div>
      <ul>
        <li><b>Pole bean</b>6 in along trellis</li>
        <li><b>Cucumber</b>12 in along trellis</li>
        <li><b>Broccoli</b>18 in, 4 plants in 4 ft × 2 ft</li>
        <li><b>Yellow squash</b>30 in, 2 plants in 5 ft × 2 ft</li>
        <li><b>Strawberry</b>12 in, 2 offset rows · let runners fill gaps</li>
        <li><b>Beets</b>4 in, thin aggressively</li>
        <li><b>Lettuce</b>8 in · cut-and-come-again</li>
      </ul>

      <div class="sub">Radish markers</div>
      <p>The old trick: sow a pinch of radish seed in the same row as a slow germinator (carrot, parsnip, parsley — 2–3 weeks to sprout). Radish pops up in <b>4 days</b>, so you can see the row, weed cleanly, and thin accurately. By the time the carrots are 2 in tall the radish is ready to pull — eat them, and you've cultivated the soil for free.</p>
    </aside>

    <div class="bp-wide">
      <h3><span class="hnum">A</span>Succession · crops that share a slot</h3>
      ${succession([
        { slot: 'Trellis · beans', tag: 'N fence · left half', crops: [
          { name: 'Pole bean', start: 2, end: 8, color: 'c-g2', endLabel: 'frost', peak: [4, 7] }
        ]},
        { slot: 'Trellis · cukes', tag: 'N fence · right half', crops: [
          { name: 'Cucumber', start: 2, end: 7, color: 'c-g3', endLabel: 'spent', peak: [4, 6.5] }
        ]},
        { slot: 'Brassica block', tag: 'mid-left 4×2 · 3 crops', crops: [
          { name: 'Broccoli · spring', start: 0, end: 4, color: 'c-g1', endLabel: 'pull', peak: [2.5, 3.8] },
          { name: 'Beets', start: 4, end: 6, color: 'c-och', endLabel: 'pull', peak: [5, 6] },
          { name: 'Broccoli · fall', start: 6, end: 9, color: 'c-g1', endLabel: 'cut', peak: [7.5, 8.8] }
        ]},
        { slot: 'Squash sprawl', tag: 'mid-right 5×2 ft', crops: [
          { name: 'Yellow squash ×2', start: 2, end: 7, color: 'c-g2', endLabel: 'spent', peak: [3.5, 6] }
        ]},
        { slot: 'Strawberry patch', tag: 'south-left · perennial', crops: [
          { name: 'Strawberries · peak', start: 2, end: 4, color: 'c-tom', endLabel: 'done', peak: [2.8, 3.7] },
          { name: 'Runners + mulch', start: 4, end: 9, color: 'c-g4', endLabel: 'overwinter', gapLabel: '' }
        ]},
        { slot: 'Quick-cut greens', tag: 'south-right 5×1 ft · 2 waves', crops: [
          { name: 'Lettuce · spring', start: 0, end: 3, color: 'c-g4', endLabel: 'bolt', peak: [1, 2.5] },
          { name: 'Lettuce · fall', start: 5, end: 8, color: 'c-g4', endLabel: 'cut', gapLabel: 'summer rest · too hot', peak: [6, 7.5] }
        ]},
        { slot: 'Radish · markers', tag: 'sown with slow crops', crops: [
          { name: 'Spring radish', start: 0, end: 2, color: 'c-och', endLabel: 'pull', peak: [0.8, 1.8] },
          { name: 'Fall radish', start: 5, end: 7, color: 'c-och', endLabel: 'pull', gapLabel: 'summer rest · bolts in heat', peak: [5.8, 6.8] }
        ]}
      ])}
    </div>

    <div class="bp-wide">
      <h3><span class="hnum">B</span>Companions · antagonists</h3>
      <div class="comp-tbl-wrap"><table class="comp-tbl">
        <thead><tr><th>Crop</th><th>Plant with</th><th>Keep away from</th><th>Spacing</th></tr></thead>
        <tbody>
          <tr><td class="crop">Pole bean</td><td class="good">Carrot, corn, radish, cucumber</td><td class="bad">Onion, garlic, pepper</td><td class="sp">6 in</td></tr>
          <tr><td class="crop">Cucumber</td><td class="good">Bean, radish, nasturtium, dill</td><td class="bad">Potato, sage</td><td class="sp">12 in</td></tr>
          <tr><td class="crop">Broccoli</td><td class="good">Dill, chamomile, onion, beet</td><td class="bad">Tomato, strawberry</td><td class="sp">18 in</td></tr>
          <tr><td class="crop">Beets</td><td class="good">Onion, lettuce, brassicas, bush bean</td><td class="bad">Pole bean</td><td class="sp">4 in</td></tr>
          <tr><td class="crop">Yellow squash</td><td class="good">Nasturtium, marigold, corn, bean</td><td class="bad">Potato</td><td class="sp">30 in</td></tr>
          <tr><td class="crop">Strawberry</td><td class="good">Lettuce, spinach, chive, bush bean</td><td class="bad">Brassicas · but fine across the bed</td><td class="sp">12 in</td></tr>
          <tr><td class="crop">Lettuce</td><td class="good">Carrot, radish, strawberry, chive</td><td class="bad">—</td><td class="sp">8 in</td></tr>
          <tr><td class="crop">Radish</td><td class="good">Cucumber, lettuce, nasturtium</td><td class="bad">Hyssop</td><td class="sp">2 in</td></tr>
        </tbody>
      </table></div>
    </div>
  `;
}

function bedPage_33() {
  return `
    <div class="bp-diagram">${bed3x3_A()}</div>
    <aside class="bp-aside">
      <div class="sub">Role</div>
      <h4>Kitchen herbs, waist-high, 10 steps from the stove.</h4>
      <p>Nine squares, one herb per square. The core five (<em>basil, parsley, chives, thyme, oregano</em>) plus sage, cilantro, dill, and mint. Perennials anchor the back and sides; annuals get the sunny front.</p>

      <div class="sub">Sun · Soil · Water</div>
      <ul>
        <li><b>Sun</b>6+ hrs; basil and thyme need it most</li>
        <li><b>Soil</b>Lean — herbs concentrate oils in poor soil</li>
        <li><b>Water</b>Less than veg. Let the top inch dry between waterings</li>
        <li><b>Mint</b>Bury a 1-gal nursery pot; mint lives in the pot</li>
      </ul>

      <div class="sub">Spacing &amp; care</div>
      <ul>
        <li><b>Basil</b>Pinch flowers weekly; cut every 10 days</li>
        <li><b>Parsley</b>Biennial — replace each spring</li>
        <li><b>Chives</b>Divide every 3 yrs</li>
        <li><b>Thyme</b>Prune after bloom</li>
        <li><b>Oregano</b>Cut back hard in fall</li>
        <li><b>Cilantro</b>Bolt-prone; re-sow every 3 wks</li>
      </ul>
    </aside>

    <div class="bp-wide">
      <h3><span class="hnum">A</span>Succession · what's cuttable each month</h3>
      ${succession([
        { slot: 'Perennial anchors', tag: 'thyme · oregano · sage', crops: [
          { name: 'Thyme · oregano · sage', start: 0, end: 9, color: 'c-g1', endLabel: 'cut anytime' }
        ]},
        { slot: 'Chive clump', tag: 'perennial · cut low', crops: [
          { name: 'Chives', start: 0, end: 9, color: 'c-g2', endLabel: 'cut every 3 wks' }
        ]},
        { slot: 'Mint (contained)', tag: 'sunk pot · invasive', crops: [
          { name: 'Mint', start: 1, end: 9, color: 'c-g3', endLabel: 'cut' }
        ]},
        { slot: 'Parsley slot', tag: 'biennial · replace yearly', crops: [
          { name: 'Parsley', start: 0, end: 8, color: 'c-g2', endLabel: 'bolt · pull' }
        ]},
        { slot: 'Basil slot', tag: 'annual · sunniest cell', crops: [
          { name: 'Basil', start: 2, end: 7, color: 'c-g4', endLabel: 'frost' }
        ]},
        { slot: 'Cilantro slot', tag: '2 waves · bolts in heat', crops: [
          { name: 'Cilantro · spring', start: 0, end: 2, color: 'c-g3', endLabel: 'bolt' },
          { name: 'Cilantro · fall', start: 5, end: 8, color: 'c-g3', endLabel: 'cut', gapLabel: 'summer rest · bolts in heat' }
        ]},
        { slot: 'Dill slot', tag: 'self-seeds each year', crops: [
          { name: 'Dill', start: 1, end: 7, color: 'c-g2', endLabel: 'seed heads' }
        ]}
      ])}
    </div>

    <div class="bp-wide">
      <h3><span class="hnum">B</span>Harvest notes</h3>
      <div class="comp-tbl-wrap"><table class="comp-tbl">
        <thead><tr><th>Herb</th><th>Cut technique</th><th>Best for</th><th>Varieties</th></tr></thead>
        <tbody>
          <tr><td class="crop">Basil</td><td>Pinch top two leaves weekly — never pull whole stem</td><td class="good">Pesto, caprese, Thai, pizza</td><td class="sp">Genovese, Thai</td></tr>
          <tr><td class="crop">Parsley</td><td>Cut outer stalks at base</td><td class="good">Tabbouleh, stock, garnish</td><td class="sp">Flat-leaf Italian</td></tr>
          <tr><td class="crop">Chives</td><td>Shear to 2 in; regrows in 10 days</td><td class="good">Eggs, potato, compound butter</td><td class="sp">Common, garlic</td></tr>
          <tr><td class="crop">Thyme</td><td>Strip sprigs · never cut woody base</td><td class="good">Braises, roasts, stock</td><td class="sp">English, lemon</td></tr>
          <tr><td class="crop">Oregano</td><td>Cut stems at 6 in; dries well</td><td class="good">Tomato sauce, pizza, bean soup</td><td class="sp">Greek, Italian</td></tr>
        </tbody>
      </table></div>
    </div>
  `;
}

function bedPage_pots() {
  return `
    <div class="bp-diagram" style="display:flex;align-items:center;justify-content:center;background:#ece6d1;border:1px solid var(--ink);padding:28px">
      <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
        <defs>
          <radialGradient id="terracotta" cx="50%" cy="30%">
            <stop offset="0%" stop-color="#c08960"/>
            <stop offset="100%" stop-color="#7d4d2a"/>
          </radialGradient>
        </defs>
        ${[80, 210, 340].map((cx, i) => {
          const labels = [['Cherry', 'Sungold'], ['Paste', 'San Marzano'], ['Slicer', 'Celebrity']];
          const [role, variety] = labels[i];
          return `
            <ellipse cx="${cx+4}" cy="260" rx="46" ry="7" fill="#1f2a20" opacity="0.2"/>
            <path d="M ${cx-38} 180 L ${cx-32} 252 Q ${cx} 262 ${cx+32} 252 L ${cx+38} 180 Z" fill="url(#terracotta)" stroke="#1f2a20" stroke-width="1"/>
            <ellipse cx="${cx}" cy="180" rx="38" ry="9" fill="#8a5a34" stroke="#1f2a20" stroke-width="1"/>
            <ellipse cx="${cx}" cy="180" rx="32" ry="6.5" fill="#4a2e18" opacity="0.6"/>
            <!-- tomato plant -->
            <path d="M ${cx} 180 Q ${cx-10} 130 ${cx-18} 90 M ${cx} 180 Q ${cx+10} 130 ${cx+18} 90 M ${cx} 180 L ${cx} 80" stroke="#4a5d3a" stroke-width="2" fill="none"/>
            <circle cx="${cx-18}" cy="95" r="10" fill="#4a5d3a" opacity="0.8"/>
            <circle cx="${cx+18}" cy="95" r="11" fill="#4a5d3a" opacity="0.85"/>
            <circle cx="${cx}" cy="75" r="9" fill="#4a5d3a" opacity="0.75"/>
            <circle cx="${cx-12}" cy="120" r="8" fill="#4a5d3a" opacity="0.7"/>
            <circle cx="${cx+12}" cy="120" r="9" fill="#4a5d3a" opacity="0.75"/>
            <!-- tomatoes -->
            <circle cx="${cx-6}" cy="110" r="3.5" fill="#b94a3b"/>
            <circle cx="${cx+5}" cy="100" r="3" fill="#c85a43"/>
            <circle cx="${cx+2}" cy="130" r="4" fill="#a03e2f"/>
            <circle cx="${cx-10}" cy="135" r="3" fill="#d67050"/>
            <!-- stake -->
            <line x1="${cx-22}" y1="180" x2="${cx-22}" y2="50" stroke="#7d5a34" stroke-width="1.5"/>
            <line x1="${cx-22}" y1="90" x2="${cx+18}" y2="100" stroke="#8a6a44" stroke-width="0.8" opacity="0.6"/>
            <line x1="${cx-22}" y1="120" x2="${cx+15}" y2="125" stroke="#8a6a44" stroke-width="0.8" opacity="0.6"/>
            <!-- labels -->
            <text x="${cx}" y="282" font-family="Fraunces,serif" font-size="14" font-style="italic" fill="#1f2a20" text-anchor="middle">${role}</text>
            <text x="${cx}" y="296" font-family="JetBrains Mono,monospace" font-size="8" fill="#4a5d3a" text-anchor="middle" letter-spacing="1.5">${variety.toUpperCase()}</text>
          `;
        }).join('')}
        <text x="210" y="25" font-family="JetBrains Mono,monospace" font-size="9" fill="#1f2a20" text-anchor="middle" letter-spacing="2.5" opacity="0.6">POT 01 · POT 02 · POT 03 · 15 GAL TERRACOTTA</text>
      </svg>
    </div>
    <aside class="bp-aside">
      <div class="sub">Role</div>
      <h4>Three tomatoes, three ripening curves.</h4>
      <p>A cherry for August snacking, a paste for sauce, and a slicer for sandwiches — one of each so you're picking tomatoes every day from July to October. Pots are moveable: chase the sun early, rescue from October rain late.</p>

      <div class="sub">Potting spec</div>
      <ul>
        <li><b>Size</b>15–20 gal minimum; 24 in across. Smaller = parched daily.</li>
        <li><b>Mix</b>Quality potting soil + 20% compost + 1 cup bone meal</li>
        <li><b>Stake</b>6-ft single stake at planting; tie weekly</li>
        <li><b>Drainage</b>4 holes + pot feet; never let sit in saucer</li>
        <li><b>Mulch</b>1–2 in straw or wood chips on top</li>
      </ul>

      <div class="sub">Variety picks (zone 8b)</div>
      <ul>
        <li><b>Cherry</b>Sungold — indet., sweet, first picks late Jul (earliest of the three)</li>
        <li><b>Paste</b>San Marzano or Roma — slow in PNW, first picks late Aug; consider Juliet or Glacier if you want paste-ish fruit in July</li>
        <li><b>Slicer</b>Celebrity or Early Girl — det./semi-det., first picks early-mid Aug</li>
      </ul>
      <p style="font-size:11.5px;color:var(--ink-2);margin-top:10px;font-style:italic">PNW reality check: our summers are 2–3 weeks behind most zone 8b calendars. Don't expect ripe fruit before late July even on the earliest cultivars — paste types often don't start until late August.</p>
    </aside>

    <div class="bp-wide">
      <h3><span class="hnum">A</span>Ripening calendar</h3>
      <div class="succ-grid">
        <span></span>
        <span class="m">MAR</span><span class="m">APR</span><span class="m">MAY</span><span class="m">JUN</span><span class="m">JUL</span><span class="m">AUG</span><span class="m">SEP</span><span class="m">OCT</span><span class="m">NOV</span>
        <span class="row-label">Sungold (cherry)</span>
        <span class="empty"></span><span class="empty"></span><span class="bt" data-l="PLANT"></span><span class="bt"></span><span class="bt" data-l="FIRST"></span><span class="bt" data-l="PICK"></span><span class="bt"></span><span class="bt" data-l="PULL"></span><span class="empty"></span>
        <span class="row-label">San Marzano (paste)</span>
        <span class="empty"></span><span class="empty"></span><span class="bt" data-l="PLANT"></span><span class="bt"></span><span class="bt"></span><span class="bt"></span><span class="bt" data-l="PICK"></span><span class="bt" data-l="PULL"></span><span class="empty"></span>
        <span class="row-label">Celebrity (slicer)</span>
        <span class="empty"></span><span class="empty"></span><span class="bt" data-l="PLANT"></span><span class="bt"></span><span class="bt"></span><span class="bt" data-l="PICK"></span><span class="bt"></span><span class="bt" data-l="PULL"></span><span class="empty"></span>
      </div>
    </div>

    <div class="bp-wide">
      <h3><span class="hnum">B</span>Care checklist</h3>
      <div class="comp-tbl-wrap"><table class="comp-tbl">
        <thead><tr><th>Task</th><th>Cadence</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td class="crop">Water</td><td class="good">Daily in July–Aug; twice if 85°F+</td><td>Pots dry fast; inconsistent water → blossom-end rot</td></tr>
          <tr><td class="crop">Feed</td><td class="good">Weekly, dilute fish emulsion</td><td>Pot soil leaches nutrients fast</td></tr>
          <tr><td class="crop">Sucker</td><td class="good">Weekly for indeterminates</td><td>Energy to fruit, not foliage; airflow vs. mildew</td></tr>
          <tr><td class="crop">Tie</td><td class="good">Weekly</td><td>Stem weight compounds fast once fruiting</td></tr>
          <tr><td class="crop">Underplant</td><td class="good">Basil or marigold at transplant</td><td>Flavor + pest deterrent + living mulch</td></tr>
        </tbody>
      </table></div>
    </div>
  `;
}

// ---------- Mount ----------








// ---------- SHOPPING LIST ----------
function shoppingList() {
  const slug = str => String(str).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const li = (name, qty, sub) => {
    const key = slug(`${name}|${qty||''}|${sub||''}`);
    return `
    <li data-shop-key="${key}">
      <span class="cb"></span>
      <span class="name">${name}${sub ? `<em>${sub}</em>` : ''}</span>
      <span class="qty">${qty || ''}</span>
    </li>`;
  };

  const startersCol = `
    <div class="shop-col">
      <h3>Starters &amp; transplants</h3>
      <span class="when">Buy April 18 \u00b7 Sky Nursery / Swanson's</span>

      <div class="sub-head">Plant NOW (cool-season \u00b7 frost-hardy)</div>
      <ul>
        ${li('<b>Broccoli</b> starts', '\u00d74', 'Packman or DeCicco \u00b7 3\u00d79 mid-left block')}
        ${li('<b>Strawberry</b> crowns', '\u00d710', 'June-bearing (Hood or Shuksan) \u00b7 3\u00d79 south-left \u00b7 PERENNIAL')}
        ${li('<b>Lettuce</b> starts', '\u00d76', 'Buttercrunch + Red Romaine \u00b7 4\u00d710 south + 3\u00d79 south-right')}
        ${li('<b>Onion sets</b>', '\u00d724', 'Yellow (16) + red (8) \u00b7 4\u00d710 middle')}
      </ul>

      <div class="sub-head">Hold until ~May 15 (warm-season)</div>
      <ul>
        ${li('<b>Tomato \u00b7 Sungold</b> (cherry)', '\u00d71', 'indeterminate \u00b7 pot')}
        ${li('<b>Tomato \u00b7 paste</b>', '\u00d71', 'San Marzano, Juliet, or Roma \u00b7 pot')}
        ${li('<b>Tomato \u00b7 slicer</b>', '\u00d71', 'Celebrity, Early Girl, or Better Boy \u00b7 pot')}
        ${li('<b>Bell pepper</b>', '\u00d73', 'any color \u00b7 4\u00d710 north')}
        ${li('<b>Jalape\u00f1o</b>', '\u00d72', 'mild or hot \u00b7 4\u00d710 north')}
        ${li('<b>Basil</b>', '\u00d74', 'Genovese \u00b7 interplant with peppers')}
        ${li('<b>Yellow squash</b>', '\u00d72', 'Straightneck or Zephyr \u00b7 3\u00d79 mid-right')}
        ${li('<b>Zucchini</b>', '\u00d71', 'Costata Romanesco or Black Beauty \u00b7 4\u00d710 middle')}
        ${li('<b>Cucumber</b> starts (optional)', '\u00d71 6-pk', 'or direct-sow seed in May \u00b7 3\u00d79 trellis right half')}
        ${li('<b>Marigold</b> starts', '\u00d71 flat', 'French dwarf \u00b7 bed borders + squash corners')}
      </ul>

      <div class="sub-head">Kitchen herbs (3\u00d73 bed)</div>
      <ul>
        ${li('<b>Basil</b> (extra)', '\u00d71', '3\u00d73 herb bed')}
        ${li('<b>Parsley</b>', '\u00d71', 'flat-leaf Italian')}
        ${li('<b>Chives</b>', '\u00d71', 'perennial \u00b7 divides well')}
        ${li('<b>Thyme</b>', '\u00d71', 'English \u00b7 perennial')}
        ${li('<b>Oregano</b>', '\u00d71', 'Greek \u00b7 perennial')}
        ${li('<b>Sage</b>', '\u00d71', 'common \u00b7 perennial \u00b7 3\u00d73 back row')}
        ${li('<b>Mint</b>', '\u00d71', 'in a SUNK POT \u00b7 will escape otherwise')}
        ${li('<b>Cilantro</b>', '\u00d71', 'or direct-sow + re-sow every 3 wk')}
      </ul>
    </div>`;

  const seedsCol = `
    <div class="shop-col">
      <h3>Seeds &amp; succession</h3>
      <span class="when">Buy April 18 \u00b7 keep the packets in a tin</span>

      <div class="sub-head">Direct-sow NOW (April 18\u201325)</div>
      <ul>
        ${li('<b>Carrot</b> seed', '1 pkt', 'Danvers or Nantes \u00b7 4\u00d710 middle band')}
        ${li('<b>Radish</b> seed', '1 pkt', 'French Breakfast \u00b7 marker crop between carrots')}
        ${li('<b>Lettuce</b> seed (mix)', '1 pkt', 'supplement the starts')}
        ${li('<b>Spinach</b> seed', '1 pkt', 'bolts by June \u2014 sow heavy now')}
        ${li('<b>Cilantro</b> seed', '1 pkt', 'bolts fast \u2014 re-sow every 3 wk')}
      </ul>

      <div class="sub-head">Direct-sow mid-May (after last frost)</div>
      <ul>
        ${li('<b>Pole beans</b> seed', '1 pkt', 'Blue Lake or Kentucky Wonder \u00b7 3\u00d79 trellis left half')}
        ${li('<b>Filet beans</b> seed', '1 pkt', 'Maxibel haricots verts \u00b7 4\u00d710 middle band')}
        ${li('<b>Cucumber</b> seed', '1 pkt', 'Marketmore or Lemon \u00b7 3\u00d79 trellis right half')}
        ${li('<b>Beets</b> seed', '1 pkt', 'Detroit Dark Red or Chioggia \u00b7 sow June in 3\u00d79 brassica block after spring broccoli')}
        ${li('<b>Yellow squash</b> seed (backup)', '1 pkt', 'only if a start dies')}
      </ul>

      <div class="sub-head">Succession re-sows (every 2\u20133 wk)</div>
      <ul>
        ${li('Lettuce', 'every 2 wk', 'through Sep \u2014 shift to shade by July')}
        ${li('Radish', 'every 2 wk', 'through June, pause, resume Sep')}
        ${li('Carrot', 'every 3 wk', 'through early August')}
        ${li('Filet beans', 'every 3 wk', 'May\u2013July \u2014 keeps fresh picks coming')}
        ${li('Cilantro', 'every 3 wk', 'through September')}
      </ul>

      <div class="sub-head">Fall crops (buy now, sow in July)</div>
      <ul>
        ${li('<b>Fall broccoli</b> seed', '1 pkt', 'start indoors July 1 \u2014 transplant Aug into 3\u00d79 brassica block')}
        ${li('<b>Fall lettuce + spinach</b>', '1 pkt ea', 'sow Aug\u2013Sep for Oct\u2013Nov picks')}
      </ul>
    </div>`;

  const note = `
    <div class="shop-note">
      <b>Timing for Bothell (zone 8b):</b> average last frost is ~May 1 but cold nights linger. Cool-season starts (brassicas, greens, alliums) go in <b>April 18</b>. Warm-season starts (tomato, pepper, basil, squash, cucumber) shouldn't go in until <b>soil is 60\u00b0F</b> \u2014 usually around <b>May 15</b>. If you buy tomato/pepper starts on the 18th, pot them up one size and keep them in a sheltered spot (porch, unheated garage at night) for 3\u20134 weeks to harden off before transplant.
    </div>
    <div class="shop-note">
      <b>Where to shop locally:</b> Sky Nursery (Shoreline), Swanson's (Ballard), and Sunnyside Nursery (Marysville) all stock healthy PNW-adapted starts. For seeds, Uprising, Adaptive, or Territorial are the regional picks. Home Depot/Lowe's starts are fine in a pinch but pick through them \u2014 avoid anything leggy or root-bound.
    </div>`;

  return `
    <div class="shop-grid">
      ${startersCol}
      ${seedsCol}
    </div>
    ${note}`;
}



// ---------- HARVEST CUES ----------
function harvestCues() {
  const card = (c) => `
    <div class="hv-card">
      <div class="hv-head">
        <span class="hv-name">${c.name}</span>
        <span class="hv-bed">${c.bed}</span>
      </div>
      <div class="hv-when">${c.when}</div>
      <dl class="hv-body">
        <dt>Size</dt><dd>${c.size}</dd>
        <dt>Color</dt><dd>${c.color}</dd>
        <dt>Touch</dt><dd>${c.touch}</dd>
        <dt>Check</dt><dd>${c.cadence}</dd>
      </dl>
      <p class="hv-warn">${c.warn}</p>
    </div>`;

  const crops = [
    { name: 'Zucchini', bed: '4×10 · mid', when: 'Jun → early Sep',
      size: '<b>6–8 in long</b>, 1½ in across. The ones you see in the store are already past.',
      color: 'Deep glossy green. Skin <b>shines</b> — a dull skin means the seeds inside have bulked up.',
      touch: 'Skin yields slightly to a fingernail. If your nail <b>can\'t pierce it</b>, the flesh has gone spongy.',
      cadence: '<b>Every 2 days.</b> Fruits double in size in 48 hrs during a warm stretch.',
      warn: 'Anything &gt;10 in is a baseball bat — bitter, watery, full of tough seeds. Pull it anyway so the plant keeps setting new fruit.'
    },
    { name: 'Yellow squash', bed: '3×9 · mid-right', when: 'Jun → early Sep',
      size: '<b>6–7 in long</b>, straight neck variety. A touch smaller is better than a touch larger.',
      color: 'Bright buttery yellow, <b>glossy</b>. Any dull patch or pale stripe = pick now.',
      touch: 'Same fingernail test as zucchini. Neck should still be tender, not rubbery.',
      cadence: '<b>Every 2 days</b> — squashes are the #1 thing people let get away.',
      warn: 'Hard rind + big seeds. Flesh turns cottony. Harvest and compost; don\'t let seed-heavy fruit ripen on vine or the plant stops producing.'
    },
    { name: 'Cucumber', bed: '3×9 · trellis', when: 'Jun → mid-Aug',
      size: '<b>6–8 in</b> for slicers (Marketmore). <b>4–5 in</b> for pickling or Lemon types.',
      color: 'Uniform deep green, no yellowing at the blossom end.',
      touch: 'Firm all the way through. Spines still sharp on young fruit — that\'s good.',
      cadence: '<b>Every 2 days.</b> Miss a day in July and you get a yellow blimp.',
      warn: 'Yellow tint, swollen belly, soft spots. Bitter cucumber syndrome sets in — not recoverable. Pick and toss.'
    },
    { name: 'Pole beans', bed: '3×9 · trellis', when: 'Late Jun → frost',
      size: '<b>Pencil-thick</b>, 5–7 in long. Not thicker.',
      color: 'Uniform green, straight. No bulges along the pod.',
      touch: '<b>Smooth pod</b>, no bumps. Snaps crisply when bent — no bend-and-flex.',
      cadence: '<b>Every 2–3 days.</b> Pick all ready beans every visit — it triggers more flowers.',
      warn: 'Pod shows seed bumps → starchy, stringy, leathery. The plant also slows flowering. Strip overgrown pods immediately.'
    },
    { name: 'Filet beans', bed: '4×10 · mid', when: 'Late Jun → Aug',
      size: '<b>Pencil-lead to pencil thick</b>, 4–5 in. Smaller = sweeter. These are the French haricots verts — harvest tiny.',
      color: 'Vibrant bright green, almost glowing.',
      touch: 'Very smooth, tender, <b>snaps like celery</b>. Should not be leathery.',
      cadence: '<b>Every 1–2 days at peak.</b> Maxibels go from perfect to bulgy in 48 hrs.',
      warn: 'Any pod wider than a pencil or with visible seed bumps — done. Flavor and texture fall off fast.'
    },
    { name: 'Broccoli', bed: '3×9 · mid-left', when: 'May–Jun · Sep–Oct',
      size: 'Main head <b>4–7 in across</b> depending on variety. Bigger isn\'t always better.',
      color: 'Deep blue-green. <b>Beads tight and uniform.</b>',
      touch: 'Head feels dense and firm, beads packed like fine sandpaper.',
      cadence: '<b>Daily once sizing up.</b> A warm day pushes it to bolt overnight.',
      warn: 'Beads loosen and you see <b>yellow flower buds</b> = 48 hrs too late. Still edible but texture is coarse. Cut anyway and the plant throws side shoots.'
    },
    { name: 'Beets', bed: '3×9 · mid-left', when: 'Jun · Aug',
      size: '<b>Golf ball to tennis ball</b> (1½–2½ in). The shoulder pokes above soil — that\'s your sizing gauge.',
      color: 'Deep red shoulder visible at soil line (or gold/pink-striped depending on variety).',
      touch: 'Firm, not spongy. Greens still upright and crisp.',
      cadence: '<b>Weekly once shoulders show.</b> Push dirt aside to check diameter; pull the biggest and let siblings fill in.',
      warn: 'Anything &gt; 3 in gets woody rings and earthy-bitter. Eat the greens of any over-sized ones, compost the root.'
    },
    { name: 'Carrots', bed: '4×10 · mid', when: 'Jun · Sep',
      size: 'Shoulder visible at soil, <b>½ – ¾ in across</b>. Pull one as a test.',
      color: 'Bright orange shoulder. Tops lush and dark green.',
      touch: 'Snaps crisply when broken. Not bendy.',
      cadence: '<b>Weekly.</b> Pull progressively — biggest first, let the rest grow.',
      warn: 'Left past ¾ in they go pithy and bitter at the core. Over-mature carrots also crack in the ground.'
    },
    { name: 'Onions', bed: '4×10 · mid', when: 'Aug',
      size: 'Bulbs <b>baseball-sized</b> with papery outer skin forming.',
      color: 'Tops yellow and <b>fall over on their own</b> — that\'s the signal.',
      touch: 'Neck softens above the bulb. Bulb firm, skins dry and crackly.',
      cadence: 'Check once tops start yellowing (late July). Once 80% have flopped, stop watering for 5 days, then lift.',
      warn: 'If tops stay green into September, snap necks over to force bulbing. Over-cured in the ground → rot at the base.'
    },
    { name: 'Bell peppers', bed: '4×10 · N edge', when: 'Aug → Oct',
      size: 'Full-sized fruit (4 in+), <b>walls thickened</b>. Color is the main cue, not size.',
      color: 'Can pick green and firm, or wait for full <b>red/yellow/orange</b> (2–3 weeks more — much sweeter).',
      touch: '<b>Heavy for its size</b>, walls feel firm and thick, glossy skin.',
      cadence: '<b>Twice a week.</b> Ripening is slow but windows close once color sets.',
      warn: 'Wrinkled, soft spots, or sunscald (white patch on sunny side). Still edible but pick immediately so plant sets more fruit.'
    },
    { name: 'Jalapeños', bed: '4×10 · N edge', when: 'Jul → Oct',
      size: '<b>3–4 in long</b>, walls plump.',
      color: 'Dark glossy green for classic heat, or wait for <b>red</b> (hotter + fruitier, 2 weeks extra).',
      touch: 'Firm. <b>Corking</b> (fine white stretch marks) = ready & peak heat.',
      cadence: '<b>Twice a week.</b> Picking keeps new flowers coming.',
      warn: 'Soft, wrinkled skin = overripe. Flavor muddies.'
    },
    { name: 'Tomatoes', bed: 'Pots × 3', when: 'Late Jul → Oct',
      size: 'Full size for the variety. A Sungold will never get bigger than a marble; a slicer hits softball.',
      color: '<b>Full color</b> all the way to the stem. If shoulders are still yellow-green, wait 2 days.',
      touch: '<b>Gentle give</b> when cupped — like a stress ball. Stem end releases with a light twist.',
      cadence: '<b>Every 2 days at peak.</b> Once one fruit ripens, a cluster follows within a week.',
      warn: 'Skin splits or gets soft = over-ripe. Still fine for sauce that day; won\'t store. Tomatoes do finish ripening off-vine if picked at <em>breaker</em> stage (first blush).'
    },
    { name: 'Strawberries', bed: '3×9 · south-left', when: 'Jun (June-bearing)',
      size: 'Varies by variety — harvest by color, not size.',
      color: '<b>Fully red all the way to the shoulder</b> (the part near the stem). Any white or pale-pink patch = not ready.',
      touch: 'Slight give. Comes off the stem with a <b>gentle pinch above the calyx</b> — don\'t pull the fruit itself.',
      cadence: '<b>Every other day in June.</b> A ripe berry at 8 am is a slug dinner by evening.',
      warn: 'Soft, dull, or showing mold. Strawberries don\'t ripen off the plant — pick ripe only.'
    },
    { name: 'Lettuce', bed: '4×10 · S + 3×9 · S', when: 'Apr–Jun · Sep–Nov',
      size: 'Head lettuce: <b>4–6 in tall</b>. Leaf lettuce: cut outer leaves any time they\'re 3 in+.',
      color: 'Bright color, no yellow edges. Center still tight (not stretching upward).',
      touch: 'Leaves crisp, not limp. Cut-and-come-again: slice ~1 in above the crown.',
      cadence: '<b>Every 3 days</b> during active growth.',
      warn: 'A tall center stalk forming = bolting. Taste goes bitter within 2–3 days. Pull the whole plant and re-sow.'
    },
    { name: 'Radishes', bed: '4×10 + 3×9 · markers', when: 'Apr–Jun · Sep–Oct',
      size: '<b>1 in across</b> (marble to quarter-sized). Pull one to check.',
      color: 'Shoulder shows red above soil. Tops still tender.',
      touch: 'Firm. Should snap crisply when bitten.',
      cadence: '<b>Every 2 days</b> once shoulders appear — they size up fast.',
      warn: 'Past 1½ in and you get pith, hollow centers, or splitting. Peppery heat turns acrid. Compost oversized ones.'
    },
    { name: 'Spring peas', bed: '—  (if planted)', when: 'May–Jun',
      size: '<b>Snap peas:</b> pods fat with visible peas inside. <b>Snow peas:</b> pod still flat, peas just starting.',
      color: 'Bright green, glossy.',
      touch: 'Snap peas: pod crisp and plump. Snow peas: pods still flat and tender.',
      cadence: '<b>Every other day.</b> Peas are the fastest-changing crop in the garden.',
      warn: 'Yellow or dull pods with tough shells. Sweetness drops 50% in 12 hours after peak — shell what you can and freeze immediately.'
    },
    { name: 'Herbs (cut-and-come)', bed: '3×3 herb bed', when: 'All season',
      size: 'Basil: pinch when 6 in. Cilantro: cut whole stems before flower buds form.',
      color: 'Tender green tips only — avoid woody stems.',
      touch: 'Basil: pinch top 2 leaves above a node. Chives: shear to 2 in. Thyme/oregano: strip sprigs, never cut woody base.',
      cadence: '<b>Weekly at minimum.</b> Regular cutting is what keeps herbs productive.',
      warn: 'Flowering tops on basil/cilantro = flavor plummets and leaves go bitter. Pinch flowers off the moment you see buds.'
    }
  ];

  const intro = `
    <div class="hv-intro">
      <div>
        <h4>Size is a liar. Touch is the truth.</h4>
        <p>Most crops look ripe well before they peak — and look past peak well before they look bad. The tell is almost always tactile: a fingernail that won't pierce skin, a bean with a bumpy pod, a tomato that's gone from bouncy to mushy. Walk the garden with your hands.</p>
      </div>
      <div class="rule">
        <span class="rule-num">RULE 01</span>
        <b>Pick on the early side.</b> An under-ripe vegetable can ripen on the counter. An over-ripe one can't un-ripen. If in doubt, pick — the plant makes more.
      </div>
      <div class="rule">
        <span class="rule-num">RULE 02</span>
        <b>Harvest = stimulation.</b> Beans, squash, cukes, peppers, basil: every pick triggers more flowers. A vine left carrying mature fruit slows down and eventually quits.
      </div>
    </div>`;

  return intro + `<div class="hv-grid">${crops.map(card).join('')}</div>`;
}




// ---------- SITE PLAN ----------
function sitePlan() {
  const W = 760, H = 480;
  const ink = '#1f2a20';
  const grass = '#e5e6c9';
  const grassDark = '#c9cfa3';
  const wood = '#b89a6b';
  const woodDark = '#8a6e44';
  const soil = '#b69773';
  const soilDark = '#8a6a42';
  const soilLight = '#d4bf94';
  const green = '#4a5d3a';
  const ochre = '#b89534';
  const PF = 26; // px per foot

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;background:${grass};border:1px solid ${ink};border-radius:2px">`;

  // Defs: patterns & filters
  s += `<defs>
    <pattern id="lawn" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
      <rect width="14" height="14" fill="${grass}"/>
      <path d="M 2 10 l 0 -4 M 6 12 l 0 -5 M 10 9 l 0 -4" stroke="${grassDark}" stroke-width="0.6" stroke-linecap="round"/>
    </pattern>
    <pattern id="soil" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="${soilLight}"/>
      <circle cx="2" cy="3" r="0.5" fill="${soilDark}"/>
      <circle cx="7" cy="5" r="0.5" fill="${soilDark}"/>
      <circle cx="4" cy="8" r="0.4" fill="${soilDark}"/>
      <circle cx="9" cy="1.5" r="0.4" fill="${soilDark}"/>
    </pattern>
    <pattern id="fenceH" width="14" height="12" patternUnits="userSpaceOnUse">
      <rect width="14" height="12" fill="${wood}"/>
      <line x1="0" y1="0" x2="14" y2="0" stroke="${woodDark}" stroke-width="0.6"/>
      <line x1="0" y1="6" x2="14" y2="6" stroke="${woodDark}" stroke-width="0.4" opacity="0.5"/>
      <line x1="2" y1="1" x2="2" y2="11" stroke="${woodDark}" stroke-width="0.3" opacity="0.6"/>
      <line x1="8" y1="1" x2="8" y2="11" stroke="${woodDark}" stroke-width="0.3" opacity="0.6"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
  </defs>`;

  // Lawn base
  s += `<rect width="${W}" height="${H}" fill="url(#lawn)"/>`;

  // Scattered clover/sprig accents
  for (let i = 0; i < 36; i++) {
    const x = 20 + Math.random() * (W - 40);
    const y = 20 + Math.random() * (H - 40);
    s += `<circle cx="${x}" cy="${y}" r="1.2" fill="${green}" opacity="0.18"/>`;
  }

  // Fence along top (fence is the north/south-facing wall user described — photo top)
  const fenceH = 16;
  s += `<rect x="0" y="0" width="${W}" height="${fenceH}" fill="url(#fenceH)" stroke="${ink}" stroke-width="0.8"/>`;
  s += `<line x1="0" y1="${fenceH}" x2="${W}" y2="${fenceH}" stroke="${ink}" stroke-width="1"/>`;
  // soft shadow below fence
  s += `<rect x="0" y="${fenceH}" width="${W}" height="4" fill="${ink}" opacity="0.08"/>`;

  // Fence label
  s += `<text x="32" y="38" font-family="JetBrains Mono,monospace" font-size="9" fill="${ink}" letter-spacing="2" opacity="0.65">FENCE · SOUTH-FACING · RADIANT HEAT</text>`;

  // ---- 4×10 bed (rotated, N–S long axis)
  const b410 = { x: 200, y: 160, w: 4*PF, h: 10*PF };
  // soil shadow
  s += `<rect x="${b410.x+3}" y="${b410.y+4}" width="${b410.w}" height="${b410.h}" fill="${ink}" opacity="0.12" filter="url(#soft)"/>`;
  // wood frame
  s += `<rect x="${b410.x}" y="${b410.y}" width="${b410.w}" height="${b410.h}" fill="${wood}" stroke="${ink}" stroke-width="1.2"/>`;
  // soil inset
  const inset = 7;
  s += `<rect x="${b410.x+inset}" y="${b410.y+inset}" width="${b410.w-inset*2}" height="${b410.h-inset*2}" fill="url(#soil)" stroke="${woodDark}" stroke-width="0.6"/>`;
  // wood grain lines
  for (let i = 0; i < 4; i++) {
    const yy = b410.y + (i+1) * (b410.h/5);
    s += `<line x1="${b410.x+1}" y1="${yy}" x2="${b410.x+inset-1}" y2="${yy}" stroke="${woodDark}" stroke-width="0.5"/>`;
    s += `<line x1="${b410.x+b410.w-inset+1}" y1="${yy}" x2="${b410.x+b410.w-1}" y2="${yy}" stroke="${woodDark}" stroke-width="0.5"/>`;
  }
  // label rotated
  s += `<text transform="translate(${b410.x + b410.w/2}, ${b410.y + b410.h/2 - 20}) rotate(-90)" font-family="Fraunces,serif" font-size="20" font-weight="500" fill="${ink}" text-anchor="middle" letter-spacing="1">4 × 10</text>`;
  s += `<text transform="translate(${b410.x + b410.w/2 + 14}, ${b410.y + b410.h/2 + 18}) rotate(-90)" font-family="JetBrains Mono,monospace" font-size="8.5" fill="${green}" text-anchor="middle" letter-spacing="2" font-style="italic">rotation · 4-sided access</text>`;
  s += `<text transform="translate(${b410.x + b410.w/2 - 14}, ${b410.y + b410.h/2 + 18}) rotate(-90)" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" text-anchor="middle" letter-spacing="2" opacity="0.55">BED 01</text>`;

  // dim tick on left of 4×10
  const dimX = b410.x - 16;
  s += `<line x1="${dimX}" y1="${b410.y}" x2="${dimX}" y2="${b410.y + b410.h}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<line x1="${dimX-3}" y1="${b410.y}" x2="${dimX+3}" y2="${b410.y}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<line x1="${dimX-3}" y1="${b410.y + b410.h}" x2="${dimX+3}" y2="${b410.y + b410.h}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<text transform="translate(${dimX-5}, ${b410.y + b410.h/2}) rotate(-90)" font-family="JetBrains Mono,monospace" font-size="8" fill="${ink}" text-anchor="middle" opacity="0.7">10 FT</text>`;
  // dim tick on bottom
  const dimY = b410.y + b410.h + 14;
  s += `<line x1="${b410.x}" y1="${dimY}" x2="${b410.x + b410.w}" y2="${dimY}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<line x1="${b410.x}" y1="${dimY-3}" x2="${b410.x}" y2="${dimY+3}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<line x1="${b410.x + b410.w}" y1="${dimY-3}" x2="${b410.x + b410.w}" y2="${dimY+3}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<text x="${b410.x + b410.w/2}" y="${dimY + 12}" font-family="JetBrains Mono,monospace" font-size="8" fill="${ink}" text-anchor="middle" opacity="0.7">4 FT</text>`;

  // ---- 3×9 bed against fence
  const b39 = { x: b410.x, y: fenceH + 14, w: 9*PF, h: 3*PF };
  s += `<rect x="${b39.x+3}" y="${b39.y+4}" width="${b39.w}" height="${b39.h}" fill="${ink}" opacity="0.12" filter="url(#soft)"/>`;
  s += `<rect x="${b39.x}" y="${b39.y}" width="${b39.w}" height="${b39.h}" fill="${wood}" stroke="${ink}" stroke-width="1.2"/>`;
  s += `<rect x="${b39.x+inset}" y="${b39.y+inset}" width="${b39.w-inset*2}" height="${b39.h-inset*2}" fill="url(#soil)" stroke="${woodDark}" stroke-width="0.6"/>`;
  // wood grain
  for (let i = 1; i < 9; i++) {
    const xx = b39.x + i * (b39.w/9);
    s += `<line x1="${xx}" y1="${b39.y+1}" x2="${xx}" y2="${b39.y+inset-1}" stroke="${woodDark}" stroke-width="0.5"/>`;
    s += `<line x1="${xx}" y1="${b39.y+b39.h-inset+1}" x2="${xx}" y2="${b39.y+b39.h-1}" stroke="${woodDark}" stroke-width="0.5"/>`;
  }
  s += `<text x="${b39.x + b39.w/2 - 60}" y="${b39.y + b39.h/2 + 6}" font-family="Fraunces,serif" font-size="20" font-weight="500" fill="${ink}" text-anchor="middle" letter-spacing="1">3 × 9</text>`;
  s += `<text x="${b39.x + b39.w/2 - 60}" y="${b39.y + b39.h/2 + 22}" font-family="JetBrains Mono,monospace" font-size="8" fill="${green}" text-anchor="middle" letter-spacing="2" font-style="italic">heat &amp; trellis</text>`;
  s += `<text x="${b39.x + b39.w/2 - 60}" y="${b39.y - 6}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" text-anchor="middle" letter-spacing="2" opacity="0.55">BED 02</text>`;
  // dim top (bed width label)
  const dimTopY = b39.y - 20;
  s += `<line x1="${b39.x}" y1="${dimTopY}" x2="${b39.x + b39.w - 90}" y2="${dimTopY}" stroke="${ink}" stroke-width="0.4" opacity="0.5"/>`;
  s += `<text x="${b39.x + (b39.w - 90)/2}" y="${dimTopY - 3}" font-family="JetBrains Mono,monospace" font-size="8" fill="${ink}" text-anchor="middle" opacity="0.6">9 FT</text>`;

  // trellis indicator on fence side of 3×9
  for (let i = 0; i < 10; i++) {
    const tx = b39.x + inset + i * (b39.w - inset*2)/9;
    s += `<line x1="${tx}" y1="${b39.y+inset+1}" x2="${tx}" y2="${b39.y+inset+8}" stroke="${green}" stroke-width="0.5" stroke-dasharray="1.5 1.5" opacity="0.8"/>`;
  }
  s += `<text x="${b39.x + b39.w/2 + 40}" y="${b39.y + inset + 4}" font-family="JetBrains Mono,monospace" font-size="6.5" fill="${green}" text-anchor="middle" letter-spacing="1" opacity="0.9">↑ TRELLIS</text>`;

  // ---- Tomato pots between beds (right of 4×10)
  const potX = b410.x + b410.w + 38;
  const potYs = [b410.y + 24, b410.y + 100, b410.y + 176];
  for (const py of potYs) {
    // shadow
    s += `<ellipse cx="${potX+3}" cy="${py + 22}" rx="22" ry="4" fill="${ink}" opacity="0.18" filter="url(#soft)"/>`;
    // terracotta pot
    s += `<path d="M ${potX-20} ${py-4} L ${potX-16} ${py+18} Q ${potX} ${py+24} ${potX+16} ${py+18} L ${potX+20} ${py-4} Z" fill="${soilDark}" stroke="${ink}" stroke-width="0.9"/>`;
    s += `<ellipse cx="${potX}" cy="${py-4}" rx="20" ry="5" fill="#a87f52" stroke="${ink}" stroke-width="0.9"/>`;
    s += `<ellipse cx="${potX}" cy="${py-4}" rx="16" ry="3.5" fill="#6b4a2b" opacity="0.55"/>`;
    // tomato foliage suggestion
    s += `<circle cx="${potX-6}" cy="${py-10}" r="5" fill="${green}" opacity="0.6"/>`;
    s += `<circle cx="${potX+5}" cy="${py-12}" r="6" fill="${green}" opacity="0.65"/>`;
    s += `<circle cx="${potX}" cy="${py-16}" r="4.5" fill="${green}" opacity="0.55"/>`;
    s += `<circle cx="${potX+3}" cy="${py-8}" r="1.4" fill="#b94a3b"/>`;
    s += `<circle cx="${potX-4}" cy="${py-6}" r="1.2" fill="#c85a43"/>`;
  }
  // pots label
  s += `<text x="${potX + 36}" y="${potYs[1] + 4}" font-family="Fraunces,serif" font-size="11" font-style="italic" fill="${ink}">Tomatoes ×3</text>`;
  s += `<text x="${potX + 36}" y="${potYs[1] + 18}" font-family="JetBrains Mono,monospace" font-size="7.5" fill="${ink}" opacity="0.6" letter-spacing="1.5">IN POTS · 15 GAL</text>`;
  // dashed connector hint between pots
  s += `<line x1="${potX}" y1="${potYs[0]+24}" x2="${potX}" y2="${potYs[2]-4}" stroke="${green}" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>`;

  // ---- 3×3 standing bed — brought in closer to the 4×10
  const b33 = { x: b410.x + b410.w + 120, y: b410.y + b410.h - 3*PF, w: 3*PF, h: 3*PF };
  // legs (standing)
  s += `<rect x="${b33.x - 4}" y="${b33.y + b33.h - 2}" width="4" height="18" fill="${woodDark}"/>`;
  s += `<rect x="${b33.x + b33.w}" y="${b33.y + b33.h - 2}" width="4" height="18" fill="${woodDark}"/>`;
  // shadow
  s += `<rect x="${b33.x+3}" y="${b33.y+5}" width="${b33.w}" height="${b33.h}" fill="${ink}" opacity="0.14" filter="url(#soft)"/>`;
  // frame
  s += `<rect x="${b33.x}" y="${b33.y}" width="${b33.w}" height="${b33.h}" fill="${wood}" stroke="${ink}" stroke-width="1.2"/>`;
  s += `<rect x="${b33.x+inset}" y="${b33.y+inset}" width="${b33.w-inset*2}" height="${b33.h-inset*2}" fill="url(#soil)" stroke="${woodDark}" stroke-width="0.6"/>`;
  // internal cross (4 quadrants suggestion)
  s += `<line x1="${b33.x + b33.w/2}" y1="${b33.y+inset+2}" x2="${b33.x + b33.w/2}" y2="${b33.y+b33.h-inset-2}" stroke="${woodDark}" stroke-width="0.4" stroke-dasharray="2 2" opacity="0.5"/>`;
  s += `<line x1="${b33.x+inset+2}" y1="${b33.y + b33.h/2}" x2="${b33.x+b33.w-inset-2}" y2="${b33.y + b33.h/2}" stroke="${woodDark}" stroke-width="0.4" stroke-dasharray="2 2" opacity="0.5"/>`;
  // herb dots
  const herbPos = [[0.3,0.3],[0.7,0.3],[0.3,0.7],[0.7,0.7]];
  for (const [fx,fy] of herbPos) {
    s += `<circle cx="${b33.x + fx*b33.w}" cy="${b33.y + fy*b33.h}" r="4" fill="${green}" opacity="0.55"/>`;
  }
  s += `<text x="${b33.x + b33.w/2}" y="${b33.y - 10}" font-family="Fraunces,serif" font-size="15" font-weight="500" fill="${ink}" text-anchor="middle">3 × 3</text>`;
  s += `<text x="${b33.x + b33.w/2}" y="${b33.y + b33.h + 30}" font-family="JetBrains Mono,monospace" font-size="8" fill="${green}" text-anchor="middle" letter-spacing="1.5" font-style="italic">standing herbs</text>`;
  s += `<text x="${b33.x + b33.w/2}" y="${b33.y + b33.h + 44}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" text-anchor="middle" letter-spacing="2" opacity="0.55">BED 03 · KITCHEN SIDE</text>`;

  // ---- Compass rose
  const compX = 60, compY = H - 60;
  s += `<circle cx="${compX}" cy="${compY}" r="26" fill="${grass}" stroke="${ink}" stroke-width="0.7"/>`;
  s += `<circle cx="${compX}" cy="${compY}" r="20" fill="none" stroke="${ink}" stroke-width="0.3" opacity="0.5"/>`;
  // North is UP: dark arrow-half points up toward N
  s += `<polygon points="${compX},${compY-22} ${compX+5},${compY} ${compX},${compY+22} ${compX-5},${compY}" fill="${grass}" stroke="${ink}" stroke-width="0.6"/>`;
  s += `<polygon points="${compX},${compY-22} ${compX+5},${compY} ${compX-5},${compY}" fill="${ink}"/>`;
  s += `<line x1="${compX-22}" y1="${compY}" x2="${compX+22}" y2="${compY}" stroke="${ink}" stroke-width="0.4" opacity="0.5"/>`;
  s += `<text x="${compX}" y="${compY-28}" font-family="Fraunces,serif" font-size="11" font-style="italic" fill="${ink}" text-anchor="middle">N</text>`;
  s += `<text x="${compX+32}" y="${compY+3}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" opacity="0.6">E</text>`;
  s += `<text x="${compX-32}" y="${compY+3}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" text-anchor="end" opacity="0.6">W</text>`;
  s += `<text x="${compX}" y="${compY+32}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" text-anchor="middle" opacity="0.6">S</text>`;

  // ---- Sun arc — arcs across the BOTTOM of the plan (the lit side of the yard).
  // Sunrise east = LEFT, sunset west = RIGHT.
  s += `<path d="M 140 ${H-90} Q 400 ${H-10} 660 ${H-90}" fill="none" stroke="${ochre}" stroke-width="1" stroke-dasharray="3 4" opacity="0.75"/>`;
  s += `<circle cx="140" cy="${H-90}" r="3" fill="${ochre}" opacity="0.6"/>`;
  s += `<circle cx="400" cy="${H-24}" r="5" fill="${ochre}"/>`;
  s += `<circle cx="660" cy="${H-90}" r="3" fill="${ochre}" opacity="0.6"/>`;
  s += `<text x="150" y="${H-96}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ochre}" letter-spacing="1.5">W · SET</text>`;
  s += `<text x="650" y="${H-96}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ochre}" text-anchor="end" letter-spacing="1.5">RISE · E</text>`;
  s += `<text x="400" y="${H-30}" font-family="Fraunces,serif" font-size="10" font-style="italic" fill="${ochre}" text-anchor="middle">☼ sun arc</text>`;

  // ---- Scale bar
  const sbX = 180, sbY = H - 32;
  s += `<line x1="${sbX}" y1="${sbY}" x2="${sbX + 5*PF}" y2="${sbY}" stroke="${ink}" stroke-width="1"/>`;
  for (let i = 0; i <= 5; i++) {
    s += `<line x1="${sbX + i*PF}" y1="${sbY-3}" x2="${sbX + i*PF}" y2="${sbY+3}" stroke="${ink}" stroke-width="1"/>`;
  }
  s += `<text x="${sbX}" y="${sbY + 14}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" opacity="0.7">0</text>`;
  s += `<text x="${sbX + 5*PF}" y="${sbY + 14}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" opacity="0.7" text-anchor="end">5 FT</text>`;
  s += `<text x="${sbX + 2.5*PF}" y="${sbY - 6}" font-family="JetBrains Mono,monospace" font-size="7" fill="${ink}" opacity="0.6" text-anchor="middle" letter-spacing="1.5">SCALE</text>`;

  // Title cartouche (bottom-left of plan)
  s += `<g transform="translate(${W-280}, 60)">
    <rect x="0" y="0" width="220" height="52" fill="${grass}" stroke="${ink}" stroke-width="0.5" opacity="0.9"/>
    <text x="12" y="18" font-family="JetBrains Mono,monospace" font-size="8" fill="${ink}" letter-spacing="2" opacity="0.65">PLATE I · SITE PLAN</text>
    <text x="12" y="36" font-family="Fraunces,serif" font-size="14" font-style="italic" fill="${ink}">The yard as drawn</text>
    <text x="12" y="48" font-family="JetBrains Mono,monospace" font-size="7" fill="${green}" letter-spacing="1.5">1 FT = 26 PX · APR 2026</text>
  </g>`;

  s += `</svg>`;
  return s;
}





// Click any shopping-list row to check it off. State persists in
// localStorage under 'garden.shopping.checked', keyed by the slug built
// in `shoppingList()`. A "clear all" button appears once anything is checked.
function initShoppingChecks(root) {
  const STORAGE_KEY = 'garden.shopping.checked';
  root = root || document;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) {}

  const items = root.querySelectorAll('li[data-shop-key]');
  items.forEach(el => {
    if (saved[el.dataset.shopKey]) el.classList.add('checked');
  });

  function updateProgressBar() {
    const total = items.length;
    const done = root.querySelectorAll('li[data-shop-key].checked').length;
    const bar = root.querySelector('#shop-progress');
    if (!bar) return;
    bar.querySelector('.shop-progress-count').textContent = `${done} / ${total} checked`;
    bar.querySelector('.shop-progress-fill').style.width = total ? `${(done/total)*100}%` : '0%';
    bar.querySelector('.shop-clear').hidden = done === 0;
  }

  root.addEventListener('click', ev => {
    const clearBtn = ev.target.closest('.shop-clear');
    if (clearBtn) {
      ev.preventDefault();
      items.forEach(el => el.classList.remove('checked'));
      localStorage.removeItem(STORAGE_KEY);
      saved = {};
      updateProgressBar();
      return;
    }
    const li = ev.target.closest('li[data-shop-key]');
    if (!li || !root.contains(li)) return;
    const key = li.dataset.shopKey;
    const on = li.classList.toggle('checked');
    if (on) saved[key] = 1; else delete saved[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    updateProgressBar();
  });

  // Inject the progress bar at the top of the shopping grid once.
  const grid = root.querySelector('.shop-grid');
  if (grid && !root.querySelector('#shop-progress')) {
    const bar = document.createElement('div');
    bar.id = 'shop-progress';
    bar.innerHTML = `
      <div class="shop-progress-track"><div class="shop-progress-fill"></div></div>
      <div class="shop-progress-meta">
        <span class="shop-progress-count"></span>
        <button type="button" class="shop-clear" hidden>Clear all</button>
      </div>`;
    grid.parentNode.insertBefore(bar, grid);
  }
  updateProgressBar();
}

window.GardenPlan = {
  sitePlan, sitePlanAside,
  bed4x10_A, bed3x9_A, bed3x3_A,
  bedCard, notesA,
  bedPage_410, bedPage_39, bedPage_33, bedPage_pots,
  shoppingList, harvestCues, succession,
  initShoppingChecks
};

