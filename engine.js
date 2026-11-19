// Module bay engine for Probably Stolen. Mirrors ModuleHelper / ModuleEffectHelper / PreBuiltItemHelper.
// Wrapped in one function so the page can also ship it to a Web Worker via ENGINE.toString().
function ENGINE() {
  const f32 = Math.fround;
  // C#: (int)((float)value * mult)
  const mulTrunc = (v, m) => Math.trunc(f32(f32(v) * f32(m)));
  // C#: int division truncates toward zero
  const idiv = (a, b) => Math.trunc(a / b);

  const STATS = ['P', 'E', 'Q'];

  // ModuleEffectHelper.moduleEffects
  const EFFECTS = {
    PREMIUM:      { name: 'Premium',            kind: 'module', mult: 1.2,  incompat: ['INFERIOR', 'LEARNING'], desc: 'Base stats x1.2.' },
    INFERIOR:     { name: 'Inferior',           kind: 'module', mult: 0.8,  incompat: ['PREMIUM', 'LEARNING'], desc: 'Base stats x0.8.' },
    RECEIVER:     { name: 'Receiver',           kind: 'module', incompat: [], desc: '+10% of base stats for each adjacent node.' },
    TOP_MOUNT:    { name: 'Top Mount',          kind: 'module', incompat: [], desc: '+20% of base stats while touching the top edge of the bay.' },
    SIDE_MOUNT:   { name: 'Side Mount',         kind: 'module', incompat: [], desc: '+20% of base stats while touching the left edge of the bay.' },
    OVERVOLTED:   { name: 'Overvolted',         kind: 'module', mult: 2,    incompat: ['LEARNING'], desc: 'Base stats x2. 10% chance per finished job to turn into a Ruined Module.' },
    DEGRADING:    { name: 'Degrading',          kind: 'module', mult: 2,    incompat: ['LEARNING'], desc: 'Base stats x2. Every finished job lowers each positive base stat by 1.' },
    LEARNING:     { name: 'Learning Algorithm', kind: 'module', incompat: ['DEGRADING', 'OVERVOLTED', 'PREMIUM', 'INFERIOR', 'NEG_FEEDBACK'], desc: 'Positive base stats start at 0 and gain 1 per finished job, up to 2x the original.' },
    NEG_FEEDBACK: { name: 'Negative Feedback',  kind: 'module', mult: 1.25, incompat: ['LEARNING'], desc: 'Base stats x1.25, but takes 1/4 of the negative base stats of every adjacent item.' },
    SUPPORT:      { name: 'Support',            kind: 'node',   incompat: [], desc: 'Gets 1/5 of the base stats of every adjacent module (negatives too).' },
  };

  // Shape variants from PreBuiltItemHelper.SetBasicModuleShape / SetAdvancedModuleShape
  const VARIANTS = {
    basic: [
      { id: '', name: 'Square', mult: 1, chance: '24%' },
      { id: '_l', name: 'L', mult: 1, chance: '26%' },
      { id: '_t', name: 'T', mult: 1, chance: '25%' },
      { id: '_c', name: 'C (x0.75)', mult: 0.75, chance: '25%' },
    ],
    advanced: [
      { id: '', name: 'Square', mult: 1, chance: '33%' },
      { id: '_s', name: 'S (x1.25)', mult: 1.25, chance: '34%' },
      { id: '_h', name: 'H (x1.25)', mult: 1.25, chance: '33%' },
    ],
  };

  // ModuleDirectory: [performance, efficiency, quality]
  const CATALOG = [
    { id: 'system_module_performance', name: 'Performance Module', sprite: 'module_red', base: [16, 0, 0], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_efficiancy', name: 'Efficiency Module', sprite: 'module_green', base: [0, 16, 0], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_quality', name: 'Quality Module', sprite: 'module_yellow', base: [0, 0, 8], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_overclock', name: 'Overclock Module', sprite: 'module_red_2', base: [36, -44, 0], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_eco', name: 'Eco Module', sprite: 'module_green_2', base: [-16, 32, 0], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_fineness', name: 'Fineness Module', sprite: 'module_yellow_2', base: [-8, -15, 25], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_streamlining', name: 'Streamlining Module', sprite: 'module_green_3', base: [8, 25, -16], type: 'UNIVERSAL' },
    { id: 'system_capped_neural_core', name: 'Capped Neural Core', sprite: 'module_black_4', base: [100, -100, 50], type: 'UNIVERSAL' },
    { id: 'system_uncapped_neural_core', name: 'Uncapped Neural Core', sprite: 'module_black_5', base: [200, -100, 100], type: 'UNIVERSAL' },
    { id: 'blank_module', name: 'Blank Module', sprite: 'module_white', base: [0, 0, 0], type: 'UNIVERSAL' },
    { id: 'system_module_corrupt', name: 'Corrupted Module', sprite: 'module_corrupt', base: [-8, -5, 0], type: 'UNIVERSAL' },
    { id: 'glitched_module', name: 'Glitched Module (stuck)', sprite: 'module_corrupt', base: [15, -15, 0], type: 'UNIVERSAL' },
    { id: 'system_module_ruined', name: 'Ruined Module', sprite: 'module_ruined', base: [0, 0, 0], type: 'UNIVERSAL' },
    { id: 'node_medium', name: 'Node', sprite: 'node_m', base: [0, 0, 0], type: 'UNIVERSAL', node: true },
    { id: 'node_small', name: 'Small Node', sprite: 'node_s', base: [0, 0, 0], type: 'UNIVERSAL', node: true, noEffects: true },
    { id: 'farm_module_nutrifruit', name: 'Nutrifruit Module', sprite: 'farm_module_l2', base: [-10, -10, 0], type: 'HYDROPONIC', extra: 'Nutrifruit yield +1' },
    { id: 'farm_module_dream_cap', name: 'Dream Cap Neutralizer', sprite: 'farm_module_l4', base: [15, 15, 0], type: 'HYDROPONIC', extra: 'Dream cap yield +2' },
    { id: 'farm_module_kotton_loom', name: 'Kotton Loom Module', sprite: 'farm_module_l1', base: [-50, -100, 0], type: 'HYDROPONIC', extra: 'Produces kotton fabric' },
    { id: 'farm_module_nightmare_cap', name: 'Nightmare Cap Module', sprite: 'farm_module5', base: [-33, -50, 0], type: 'HYDROPONIC', extra: 'Nightmare cap' },
    { id: 'farm_module_fillerweed_production', name: 'Fillerweed Production', sprite: 'farm_module_l5', base: [0, -25, 0], type: 'HYDROPONIC', extra: 'Fillerweed yield +4' },
    { id: 'farm_module_hydroreed_filter', name: 'Hydroreed Filter', sprite: 'farm_module_l6', base: [0, -15, 0], type: 'HYDROPONIC', extra: 'Hydroreed yield +1' },
    { id: 'farm_module_smuggler', name: 'Smuggler Module', sprite: 'farm_module6', base: [0, 0, 0], type: 'HYDROPONIC', extra: 'Removes contraband' },
    { id: 'evaporator_module_solvent_recovery', name: 'Solvent Recovery', sprite: 'long_module1', base: [0, -25, 50], type: 'EVAPORATOR', extra: 'Solvent only' },
    { id: 'dna_manipulator_module_stabilizer', name: 'DNA Stabilizer', sprite: 'long_module1', base: [-50, -25, 0], type: 'DNA_MANIPULATOR', extra: 'Stabilizer' },
    { id: 'dna_manipulator_module_positive_filter', name: 'DNA Positive Filter', sprite: 'long_module1', base: [0, -25, 0], type: 'DNA_MANIPULATOR', extra: 'Positive filter' },
    { id: 'dna_manipulator_module_negative_filter', name: 'DNA Negative Filter', sprite: 'long_module1', base: [0, -25, 0], type: 'DNA_MANIPULATOR', extra: 'Negative filter' },
    { id: 'dna_manipulator_module_precision', name: 'DNA Precision', sprite: 'long_module1', base: [-75, -75, 0], type: 'DNA_MANIPULATOR', extra: 'Precision' },
    { id: 'printer_module_metal', name: 'Metal Printing Module', sprite: 'long_module1', base: [0, -50, 0], type: 'PRINTER', extra: 'Metal printing' },
    { id: 'printer_module_melee_batch', name: 'Melee Batch Module', sprite: 'long_module2', base: [-50, -50, 0], type: 'PRINTER', extra: 'Melee output +1' },
    { id: 'printer_module_cnc', name: 'CNC Module', sprite: 'long_module3', base: [-25, -25, 0], type: 'PRINTER', extra: 'CNC printing' },
    { id: 'alarm_module_transmitter', name: 'Alarm Transmitter', sprite: 'farm_module_l7', base: [0, -50, 0], type: 'ALARM', extra: 'Reputation +1' },
    { id: 'furnace_module_blast', name: 'Blast Furnace Module', sprite: 'farm_module_l8', base: [0, -100, 0], type: 'FURNACE', extra: 'Blast furnace 3 to 2' },
    { id: 'furnace_module_junk', name: 'Junk Module', sprite: 'long_module3', base: [0, 0, 0], type: 'FURNACE', extra: 'Junk 6 to 4' },
  ];
  const CAT = Object.fromEntries(CATALOG.map(c => [c.id, c]));

  const FULL = '0'.repeat(35);
  const BAYS = [
    { name: 'Standard bay', mask: '10000010001000001110000010001000001' },
    { name: 'Expansion 1', mask: '10000010000000000000000000001000001' },
    { name: 'Expansion 2', mask: FULL },
  ];

  // Machine*.cs: InitMachinery power, InitProgressTypeMachine speed, *_RATIO_INT tags, allowed module types
  // Machine*.cs: InitMachinery power, InitProgressTypeMachine speed, *_RATIO_INT tags, allowed module types.
  // adjQ: machine reads quality through GetAjustedQuality (total / qr). noQ: quality is not read at all.
  const MACHINES = [
    { id: 'hydroponic', name: 'Hydroponic Bay', power: 8, speed: 8, pr: 2, qr: 2, adjQ: true, types: ['HYDROPONIC'], uses: 'Quality bonus improves the harvest split (bigger, healthier plants).' },
    { id: 'dna', name: 'DNA Manipulator', power: 12, speed: 10, pr: 2, qr: 2, adjQ: true, types: ['DNA_MANIPULATOR'], uses: 'Quality bonus raises gene-edit success chance.' },
    { id: 'printer', name: '3D Printer', power: 8, speed: 24, qr: 4, adjQ: true, types: ['PRINTER'], uses: 'Quality bonus raises printed item quality.' },
    { id: 'winerack', name: 'Wine Rack', power: 24, pr: 2, er: 2, perfCutsPower: true, types: [], uses: 'Performance also cuts power draw.' },
    { id: 'dealmaker', name: 'Deal Maker', power: 25, qr: 10, adjQ: true, dealMaker: true, types: [], uses: 'Performance and efficiency both cut power.' },
    { id: 'projector', name: 'Projector', power: 16, pr: 4, qr: 2, types: [] },
    { id: 'purifier', name: 'Water Purifier', power: 4, types: [] },
    { id: 'desequencer', name: 'Desequencer', power: 10, speed: 33, noQ: true, types: ['ALARM'] },
    { id: 'furnace', name: 'Furnace', power: 8, types: ['FURNACE'], purity: true, uses: 'Performance is not used. Ingot purity +1 step per 100 quality (-1 with a Blast Furnace Module).' },
    { id: 'moisture', name: 'Moisture Farm', power: 6, types: [] },
    { id: 'alarm', name: 'Alarm', power: 4, noQ: true, types: ['ALARM'] },
    { id: 'evaporator', name: 'Evaporator', power: 6, types: ['EVAPORATOR'], noExpansion: true },
  ];

  function variantMult(cat, variant) {
    if (!cat.variants) return 1;
    const v = VARIANTS[cat.variants].find(v => v.id === (variant || ''));
    return v ? v.mult : 1;
  }
  function spriteName(cat, variant) { return cat.sprite + (cat.variants ? (variant || '') : ''); }

  // Effects a module may carry in slot 2 given slot 1 (ModuleEffectHelper.AddEffectToModule)
  function allowedSecond(first, isNode) {
    return Object.keys(EFFECTS).filter(k => {
      const e = EFFECTS[k];
      if (isNode || e.kind !== 'module') return false;
      if (!first) return true;
      return k !== first && !EFFECTS[first].incompat.includes(k);
    });
  }

  // Base stats after shape multiplier, creation effects and use count
  function baseStats(inst) {
    const cat = CAT[inst.cat];
    let b = cat.base.slice();
    const m = variantMult(cat, inst.variant);
    if (m !== 1) b = b.map(v => mulTrunc(v, m));
    let learnMax = null;
    const effs = (inst.effects || []).filter(Boolean);
    for (const e of effs) {
      const E = EFFECTS[e];
      if (E.mult) b = b.map(v => mulTrunc(v, E.mult));
      if (e === 'LEARNING') { learnMax = b.map(v => (v > 0 ? v * 2 : null)); b = b.map(v => (v > 0 ? 0 : v)); }
    }
    const uses = Math.max(0, inst.uses | 0);
    if (learnMax) b = b.map((v, i) => (learnMax[i] != null ? Math.min(learnMax[i], uses) : v));
    if (effs.includes('DEGRADING')) b = b.map(v => (v > 0 ? Math.max(0, v - uses) : v));
    return { base: b, learnMax };
  }

  function shapeOf(rows) {
    const cells = [];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '1') cells.push([x, y]); }));
    return { cells, w: rows[0].length, h: rows.length };
  }
  // flip horizontally first, then rotate 90deg clockwise `rot` times
  function orient(shape, rot, flip) {
    let { cells, w, h } = shape;
    if (flip) cells = cells.map(([x, y]) => [w - 1 - x, y]);
    for (let r = 0; r < rot; r++) { cells = cells.map(([x, y]) => [h - 1 - y, x]); [w, h] = [h, w]; }
    return { cells, w, h };
  }
  function orientations(shape) {
    const out = [], seen = new Set();
    for (let flip = 0; flip < 2; flip++) for (let rot = 0; rot < 4; rot++) {
      const o = orient(shape, rot, flip);
      const key = o.w + 'x' + o.h + ':' + o.cells.map(c => c.join(',')).sort().join(';');
      if (seen.has(key)) continue;
      seen.add(key); out.push({ rot, flip, ...o });
    }
    return out;
  }

  // items: [{ base:[P,E,Q], node:bool, effects:[..], cells:[[x,y]..] (global) }]
  // Returns per-item temp stats, breakdown lines and totals (ModuleEffectHelper.ComputeAllModuleTempStat)
  function evaluate(items, W, H) {
    const owner = new Int16Array(W * H).fill(-1);
    items.forEach((it, i) => it.cells.forEach(([x, y]) => { owner[y * W + x] = i; }));
    const nb = items.map(() => new Set());
    items.forEach((it, i) => it.cells.forEach(([x, y]) => {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = owner[ny * W + nx];
        if (j >= 0 && j !== i) nb[i].add(j);
      }
    }));
    const totals = [0, 0, 0];
    const out = items.map((it, i) => {
      const temp = it.base.slice();
      const lines = [];
      const add = (label, d) => { if (d.some(v => v)) { lines.push({ label, d }); d.forEach((v, k) => { temp[k] += v; }); } };
      const minX = Math.min(...it.cells.map(c => c[0])), minY = Math.min(...it.cells.map(c => c[1]));
      for (const e of it.effects || []) {
        if (e === 'RECEIVER') {
          const n = [...nb[i]].filter(j => items[j].node).length;
          if (n) add(`Receiver (${n} node${n > 1 ? 's' : ''})`, it.base.map(v => idiv(v * 10 * n, 100)));
        } else if (e === 'TOP_MOUNT') {
          if (minY <= 0) add('Top Mount', it.base.map(v => idiv(v * 20, 100)));
        } else if (e === 'SIDE_MOUNT') {
          if (minX <= 0) add('Side Mount', it.base.map(v => idiv(v * 20, 100)));
        } else if (e === 'NEG_FEEDBACK') {
          const s = [0, 0, 0];
          nb[i].forEach(j => items[j].base.forEach((v, k) => { if (v < 0) s[k] += v; }));
          add('Negative Feedback', s.map(v => idiv(v, 4)));
        } else if (e === 'SUPPORT') {
          const s = [0, 0, 0];
          nb[i].forEach(j => { if (!items[j].node) items[j].base.forEach((v, k) => { s[k] += v; }); });
          const set = s.map(v => idiv(v, 5));
          const d = set.map((v, k) => v - temp[k]);
          add('Support', d);
        }
      }
      temp.forEach((v, k) => { totals[k] += v; });
      return { temp, lines, neighbors: [...nb[i]] };
    });
    return { items: out, totals };
  }

  // ModuleHelper.ApplyBasicModuleEffect / GetAjustedQuality / MachineDealMaker.UpdatePowerUse
  function machineOutput(m, totals, ctx = {}) {
    const [P, E, Q] = totals;
    const r = {};
    if (m.speed) r.speed = m.pr ? Math.trunc(f32(m.speed + f32(idiv(m.speed * P, m.pr) / 100))) : m.speed + idiv(m.speed * P, 100);
    let power;
    if (m.dealMaker) power = m.power - idiv(m.power * (E + P), 100);
    else {
      power = m.power - idiv(m.power * E, 100);
      if (m.er) power = Math.trunc(f32(m.power - f32(idiv(m.power * E, m.er) / 100)));
      if (m.perfCutsPower && m.pr) power -= Math.trunc(f32(idiv(m.power * P, m.pr) / 100));
    }
    r.power = Math.max(1, power);
    r.quality = m.adjQ ? idiv(Q, m.qr) : null;
    if (m.purity) r.purity = idiv(Q, 100) - (ctx.blast ? 1 : 0);
    if (m.dealMaker) r.bargain = Math.max(0, 10 + idiv(Q, m.qr));
    // machine-specific readings of the raw totals: [{ k: label, v: value, was: value with an empty bay, note }]
    const x = r.extra = [];
    if (m.id === 'moisture') {
      // MachineMoistureFarm.GetOutputVolume / GetOutputQuality
      const grade = q => { const n = q + 50; return n < 0 ? 'Gutterflow' : n < 50 ? 'Rustwater' : n < 100 ? 'Ghostwater' : n < 150 ? 'Basewater' : n < 200 ? 'High Quality Water' : 'Pure Water'; };
      x.push({ k: 'Water per night', v: Math.max(850 * (100 + P) / 100, 0).toFixed(0) + ' L', was: '850 L', note: 'less when several farms share the air' });
      x.push({ k: 'Water grade', v: grade(Q), was: grade(0), note: 'Basewater at Q 50, High Quality at 100, Pure at 150' });
    } else if (m.id === 'evaporator') {
      // MachineEvaporator: 300000 per cycle x (1 + P/100); distillate = evaporated x clamp(Q, 0, 100)%
      x.push({ k: 'Evaporation per cycle', v: Math.round(300 * Math.max(0, 1 + P / 100)) + ' L', was: '300 L' });
      x.push({ k: 'Recovered as distillate', v: Math.max(0, Math.min(100, Q)) + '%', was: '0%', note: 'caps at 100% (Q 100)' });
    } else if (m.id === 'purifier') {
      // MachinePurifier.GetPurityMult / GetMaxPurityCap; performance adds to dirt removal
      const mult = Q >= 200 ? 0 : Q >= 100 ? 0.1 : Q >= 75 ? 0.2 : Q >= 50 ? 0.35 : Q >= 25 ? 0.65 : Q >= 15 ? 0.85 : 1;
      x.push({ k: 'Max water purity', v: ((10000 - Math.round(99 * mult)) / 100).toFixed(2) + '%', was: '99.01%', note: 'steps at Q 15, 25, 50, 75, 100, 200' });
      x.push({ k: 'Dirt removal', v: (P >= 0 ? '+' : '') + P + '%', was: '+0%' });
    } else if (m.id === 'winerack') {
      x.push({ k: 'Aging per cycle', v: (1 + idiv(Math.max(0, Q), 125)) + ' days', was: '1 day', note: '+1 day per 125 quality' });
    } else if (m.id === 'projector') {
      // MachineProjector.GetAttractivenessBoost
      x.push({ k: 'Attractiveness', v: Math.max(0, 100 + idiv(Q, m.qr) + idiv(P, m.pr)) + '%', was: '100%', note: 'quality/2 + performance/4' });
    } else if (m.id === 'alarm') {
      // MachineAlarm.GetAlarmeStopRate, rolled as RNG.Roll(rate + 1)
      x.push({ k: 'Chance to stop a burglary', v: Math.min(100, Math.max(0, P + 50) + 1) + '%', was: '51%' });
    }
    return r;
  }

  const PURITY = { 5: 'Very Low', 6: 'Low', 7: 'Fair', 8: 'High', 9: 'Very High', 10: 'Perfect' };
  const GRADES = ['Gutterflow', 'Rustwater', 'Ghostwater', 'Basewater', 'High Quality Water', 'Pure Water'];
  const gradeIndex = q => { const n = q + 50; return n < 0 ? 0 : n < 50 ? 1 : n < 100 ? 2 : n < 150 ? 3 : n < 200 ? 4 : 5; };
  const purifierCap = q => { const mult = q >= 200 ? 0 : q >= 100 ? 0.1 : q >= 75 ? 0.2 : q >= 50 ? 0.35 : q >= 25 ? 0.65 : q >= 15 ? 0.85 : 1; return 10000 - Math.round(99 * mult); };
  // Job sizes (MACHINE_PROGRESS_TARGET): a job takes ceil(size / speed) cycles
  const JOBS = {
    desequencer: [[75, 'SUP / SER keycard chip'], [100, 'MED / ENG keycard chip'], [125, 'SEC keycard chip'], [150, 'CMD keycard chip']],
    printer: [[10, 'Small bottle'], [20, 'Makeshift RDS, toy laser, springs'], [24, 'RDS, laser, silencer, .22 mag'], [36, '.22 high-cap, 10mm mag'], [48, '.22 extended, 10mm high-cap'], [50, '.22 pistol'], [60, '2x .22 pistol, 10mm extended'], [34, 'Box cutter'], [64, 'Kitchen knife'], [75, 'Hatchet'], [82, 'Meat cleaver'], [98, 'Combat knife'], [120, 'Combat machete']],
    hydroponic: [[11, 'Fillerweed'], [18, 'Hydroreed, Bloomberry'], [21, 'Coffee'], [23, 'Nutrifruit'], [28, 'Dream Cap'], [32, 'Kotton']],
    dna: [[20, 'Complexity 0'], [24, 'Complexity 1'], [28, 'Complexity 2'], [32, 'Complexity 3'], [40, 'Complexity 5']],
  };
  // Each reading: { id, label, w (stat mix it grows with), value(totals, opts) higher = better, show(value), low (lower is better for the player), levels? }
  function readings(m, ctx = {}) {
    const out = [];
    const R = (id, label, w, value, show, extra = {}) => out.push({ id, label, w, value, show, ...extra });
    const out0 = t => machineOutput(m, t, ctx);
    const pw = m.dealMaker ? [1, 1, 0] : m.perfCutsPower ? [0.5, 0.5, 0] : [0, 1, 0];
    if (m.purity) {
      const lvl = (t, share) => Math.max(5, Math.min(10, 6 + share + out0(t).purity));
      const levels = [5, 6, 7, 8, 9, 10].map(v => ({ v, label: PURITY[v] }));
      R('purity_ore', 'Ingot purity, all-ore input', [0, 0, 1], t => lvl(t, 2), v => PURITY[v], { levels });
      R('purity_scrap', 'Ingot purity, all-scrap input', [0, 0, 1], t => lvl(t, 0), v => PURITY[v], { levels });
    }
    if (m.speed) {
      R('cycles', 'Cycles per job', [1, 0, 0], (t, o = {}) => -Math.ceil((o.job || 100) / Math.max(1, out0(t).speed)), v => -v + ' cycle' + (v === -1 ? '' : 's'), { low: true, job: true });
      R('speed', 'Processing speed', [1, 0, 0], t => out0(t).speed, v => v + ' per cycle');
    }
    if (m.dealMaker) R('bargain', 'Bargain bonus', [0, 0, 1], t => out0(t).bargain, v => v + '%');
    else if (m.adjQ) R('qbonus', 'Quality bonus', [0, 0, 1], t => out0(t).quality, v => (v > 0 ? '+' : '') + v);
    if (m.id === 'moisture') {
      R('grade', 'Water grade', [0, 0, 1], t => gradeIndex(t[2]), v => GRADES[v], { levels: GRADES.map((label, v) => ({ v, label })) });
      R('water', 'Water per night', [1, 0, 0], t => Math.max(850 * (100 + t[0]) / 100, 0), v => Math.round(v) + ' L');
    } else if (m.id === 'evaporator') {
      R('distil', 'Recovered as distillate', [0, 0, 1], t => Math.max(0, Math.min(100, t[2])), v => v + '%');
      R('evap', 'Evaporation per cycle', [1, 0, 0], t => Math.round(300 * Math.max(0, 1 + t[0] / 100)), v => v + ' L');
    } else if (m.id === 'purifier') {
      R('maxpur', 'Max water purity', [0, 0, 1], t => purifierCap(t[2]), v => (v / 100).toFixed(2) + '%');
      R('dirt', 'Dirt removal', [1, 0, 0], t => t[0], v => (v > 0 ? '+' : '') + v + '%');
    } else if (m.id === 'winerack') {
      R('aging', 'Aging per cycle', [0, 0, 1], t => 1 + idiv(Math.max(0, t[2]), 125), v => v + ' day' + (v === 1 ? '' : 's'));
    } else if (m.id === 'projector') {
      R('attract', 'Attractiveness', [0.25, 0, 0.5], t => Math.max(0, 100 + idiv(t[2], m.qr) + idiv(t[0], m.pr)), v => v + '%');
    } else if (m.id === 'alarm') {
      R('stop', 'Chance to stop a burglary', [1, 0, 0], t => Math.min(100, Math.max(0, t[0] + 50) + 1), v => v + '%');
    }
    R('power', 'Power draw', pw, t => -out0(t).power, v => -v + ' power', { low: true });
    R('rawP', 'Performance total', [1, 0, 0], t => t[0], v => (v > 0 ? '+' : '') + v + '%');
    R('rawE', 'Efficiency total', [0, 1, 0], t => t[1], v => (v > 0 ? '+' : '') + v + '%');
    R('rawQ', 'Quality total', [0, 0, 1], t => t[2], v => (v > 0 ? '+' : '') + v + '%');
    return out;
  }
  // The smallest stat mix value (in units of reading.w) that gives at least `target`; null if out of reach.
  function floorFor(rd, target, o = {}) {
    const k = rd.w.reduce((a, x, i) => (Math.abs(x) > Math.abs(rd.w[a]) ? i : a), 0);
    for (let v = -2000; v <= 4000; v++) {
      const t = [0, 0, 0]; t[k] = Math.round(v / rd.w[k]);
      if (rd.value(t, o) >= target - 1e-9) return v;
    }
    return null;
  }
  // Mix value past which the reading cannot improve (null = keeps improving)
  function usefulCap(rd, o = {}) {
    const k = rd.w.reduce((a, x, i) => (Math.abs(x) > Math.abs(rd.w[a]) ? i : a), 0);
    const t = [0, 0, 0]; t[k] = Math.round(4000 / rd.w[k]);
    const v = floorFor(rd, rd.value(t, o), o);
    return v == null || v >= 3990 ? null : v;
  }
  const mixOf = (w, t) => w[0] * t[0] + w[1] * t[1] + w[2] * t[2];

  function allowedIn(m, cat) { return cat.type === 'UNIVERSAL' || m.types.includes(cat.type); }

  // ---------- design generation for unlimited mode ----------
  const POSITIONAL = ['RECEIVER', 'TOP_MOUNT', 'SIDE_MOUNT', 'NEG_FEEDBACK', 'SUPPORT'];
  // Every module design (module x shape x effect combo) built from the allowed lists,
  // pruned to the Pareto front of base stats among designs with the same sprite and positional effects.
  function unlimitedDesigns(catIds, effectIds, maxEffects = 2) {
    const effAllowed = new Set(effectIds);
    const out = [];
    for (const id of catIds) {
      const cat = CAT[id];
      const variants = cat.variants ? VARIANTS[cat.variants].map(v => v.id) : [''];
      const combos = [[]];
      if (cat.node) { if (maxEffects >= 1 && effAllowed.has('SUPPORT') && !cat.noEffects) combos.push(['SUPPORT']); }
      else {
        const mods = Object.keys(EFFECTS).filter(k => EFFECTS[k].kind === 'module' && effAllowed.has(k));
        if (maxEffects >= 1) mods.forEach(a => combos.push([a]));
        if (maxEffects >= 2) mods.forEach((a, i) => mods.slice(i + 1).forEach(b => {
          if (!EFFECTS[a].incompat.includes(b)) combos.push([a, b]);
          else if (!EFFECTS[b].incompat.includes(a)) combos.push([b, a]);
        }));
      }
      for (const variant of variants) {
        const groups = {};
        for (const effects of combos) {
          const inst = { cat: id, variant, effects, uses: 0 };
          const { base, learnMax } = baseStats(inst);
          if (learnMax) inst.uses = Math.max(...learnMax.filter(x => x != null)); // fully trained
          const b = baseStats(inst).base;
          const key = effects.filter(e => POSITIONAL.includes(e)).sort().join('+');
          (groups[key] = groups[key] || []).push({ inst, base: b });
        }
        for (const list of Object.values(groups)) {
          list.forEach((d, i) => {
            const dominated = list.some((o, j) => j !== i && o.base.every((v, k) => v >= d.base[k]) &&
              (o.base.some((v, k) => v > d.base[k]) || (o.inst.effects.length < d.inst.effects.length) || (o.inst.effects.length === d.inst.effects.length && j < i)));
            if (!dominated) out.push(d.inst);
          });
        }
      }
    }
    return out;
  }

  // ---------- optimizer (simulated annealing over placements) ----------
  // opts: { mask, W, H, weights:[3], mins:[3|null], iters, restarts, seed,
  //   designs:[{ base, node, effects, shape:{cells,w,h}, count (number or Infinity), min (must-place count), fixed: {rot,flip,x,y} | null }] }
  // A design with fixed set is one locked module: always placed there, never moved.
  function optimize(opts, progress) {
    const { mask, W, H } = opts;
    const designs = opts.designs;
    const open = [...mask].map(c => c === '0');
    let seed = opts.seed >>> 0 || 12345;
    const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };

    // legal placements per shape (shared between designs with the same shape)
    const shapeCache = {};
    const places = designs.map(d => {
      const key = d.shape.w + 'x' + d.shape.h + ':' + d.shape.cells.join(';');
      if (!shapeCache[key]) {
        const list = [];
        orientations(d.shape).forEach(o => {
          for (let y = 0; y + o.h <= H; y++) for (let x = 0; x + o.w <= W; x++) {
            const idx = o.cells.map(([cx, cy]) => (y + cy) * W + x + cx);
            if (idx.every(i => open[i])) list.push({ rot: o.rot, flip: o.flip, x, y, idx });
          }
        });
        shapeCache[key] = list;
      }
      return shapeCache[key];
    });
    const D = designs.length;
    // entries: placed modules. ed = design index, ep = placement index
    let ed = [], ep = [];
    const used = new Int32Array(D);
    const owner = new Int16Array(W * H).fill(-1);
    const fixedOwner = new Uint8Array(W * H);
    // Goal terms: value = w . totals; score += scale * min(value, cap); value below min is penalised.
    // Older callers pass weights / mins / caps per stat; those become one term per stat.
    const terms = opts.terms || [0, 1, 2].map(k => ({ w: [0, 1, 2].map(j => (j === k ? 1 : 0)), scale: opts.weights[k], cap: (opts.caps || [])[k] ?? null, min: (opts.mins || [])[k] ?? null }));
    // a capped stat earns nothing above its cap
    const PEN = 50;

    function addEntry(d, p) {
      const e = ed.length; ed.push(d); ep.push(p); used[d]++;
      for (const c of places[d][p].idx) owner[c] = e;
    }
    function removeEntry(e) {
      const d = ed[e], p = ep[e];
      for (const c of places[d][p].idx) owner[c] = -1;
      used[d]--;
      const last = ed.length - 1;
      if (e !== last) {
        ed[e] = ed[last]; ep[e] = ep[last];
        for (const c of places[ed[e]][ep[e]].idx) owner[c] = e;
      }
      ed.pop(); ep.pop();
      return [d, p];
    }

    const totals = [0, 0, 0];
    function score() {
      totals[0] = totals[1] = totals[2] = 0;
      let effCount = 0;
      const nbs = [];
      for (let e = 0; e < ed.length; e++) {
        const it = designs[ed[e]], pl = places[ed[e]][ep[e]];
        const t0 = it.base[0], t1 = it.base[1], t2 = it.base[2];
        let d0 = 0, d1 = 0, d2 = 0, set = null;
        effCount += it.effects.length;
        if (it.effects.length) {
          nbs.length = 0;
          for (const c of pl.idx) {
            const x = c % W, y = (c - x) / W;
            if (x + 1 < W) { const j = owner[c + 1]; if (j >= 0 && j !== e && !nbs.includes(j)) nbs.push(j); }
            if (x > 0) { const j = owner[c - 1]; if (j >= 0 && j !== e && !nbs.includes(j)) nbs.push(j); }
            if (y + 1 < H) { const j = owner[c + W]; if (j >= 0 && j !== e && !nbs.includes(j)) nbs.push(j); }
            if (y > 0) { const j = owner[c - W]; if (j >= 0 && j !== e && !nbs.includes(j)) nbs.push(j); }
          }
          for (const ef of it.effects) {
            if (ef === 'RECEIVER') {
              let n = 0; for (const j of nbs) if (designs[ed[j]].node) n++;
              d0 += idiv(t0 * 10 * n, 100); d1 += idiv(t1 * 10 * n, 100); d2 += idiv(t2 * 10 * n, 100);
            } else if (ef === 'TOP_MOUNT') {
              if (pl.y <= 0) { d0 += idiv(t0 * 20, 100); d1 += idiv(t1 * 20, 100); d2 += idiv(t2 * 20, 100); }
            } else if (ef === 'SIDE_MOUNT') {
              if (pl.x <= 0) { d0 += idiv(t0 * 20, 100); d1 += idiv(t1 * 20, 100); d2 += idiv(t2 * 20, 100); }
            } else if (ef === 'NEG_FEEDBACK') {
              let s0 = 0, s1 = 0, s2 = 0;
              for (const j of nbs) { const b = designs[ed[j]].base; if (b[0] < 0) s0 += b[0]; if (b[1] < 0) s1 += b[1]; if (b[2] < 0) s2 += b[2]; }
              d0 += idiv(s0, 4); d1 += idiv(s1, 4); d2 += idiv(s2, 4);
            } else if (ef === 'SUPPORT') {
              let s0 = 0, s1 = 0, s2 = 0;
              for (const j of nbs) if (!designs[ed[j]].node) { const b = designs[ed[j]].base; s0 += b[0]; s1 += b[1]; s2 += b[2]; }
              set = [idiv(s0, 5), idiv(s1, 5), idiv(s2, 5)];
            }
          }
        }
        if (set) { totals[0] += set[0]; totals[1] += set[1]; totals[2] += set[2]; }
        else { totals[0] += t0 + d0; totals[1] += t1 + d1; totals[2] += t2 + d2; }
      }
      let missing = 0;
      for (let d = 0; d < D; d++) if (designs[d].min > used[d]) missing += designs[d].min - used[d];
      let s = -0.01 * ed.length - 0.001 * effCount - 1e4 * missing; // tie-breaks: fewer modules, then fewer effects
      for (const t of terms) {
        const v = t.w[0] * totals[0] + t.w[1] * totals[1] + t.w[2] * totals[2];
        if (t.scale) s += t.scale * (t.cap != null && v > t.cap ? t.cap : v);
        if (t.min != null && v < t.min - 1e-9) s -= PEN * (t.min - v) + 100;
      }
      return s;
    }

    // locked modules
    const fixedEntries = [];
    designs.forEach((d, i) => {
      if (!d.fixed) return;
      const p = places[i].findIndex(q => q.rot === d.fixed.rot && q.flip === d.fixed.flip && q.x === d.fixed.x && q.y === d.fixed.y);
      if (p >= 0 && places[i][p].idx.every(c => !fixedOwner[c])) { fixedEntries.push([i, p]); places[i][p].idx.forEach(c => { fixedOwner[c] = 1; }); }
    });
    const movable = [...Array(D).keys()].filter(i => !designs[i].fixed && places[i].length && designs[i].count > 0);
    const isFixed = e => designs[ed[e]].fixed;

    const iters = opts.iters || 20000, restarts = opts.restarts || 10;
    // best distinct layouts (distinct = different stat totals), best first
    const TOPN = opts.topN || 5, top = [];
    function consider(sc) {
      if (top.length >= TOPN && sc <= top[top.length - 1].s + 1e-9) return;
      const key = totals.join(",");
      const i = top.findIndex(t => t.key === key);
      if (i >= 0) { if (top[i].s >= sc - 1e-9) return; top.splice(i, 1); }
      top.push({ s: sc, key, ed: ed.slice(), ep: ep.slice(), totals: totals.slice() });
      top.sort((a, b) => b.s - a.s);
      if (top.length > TOPN) top.pop();
    }
    const reset = () => { ed = []; ep = []; used.fill(0); owner.fill(-1); fixedEntries.forEach(([d, p]) => addEntry(d, p)); };
    for (let r = 0; r < restarts; r++) {
      reset();
      // optional starting layout (e.g. the previous goal pass) for the first restart
      if (r === 0 && opts.init) for (const q of opts.init) {
        const pi = places[q.design] ? places[q.design].findIndex(p => p.rot === q.rot && p.flip === q.flip && p.x === q.x && p.y === q.y) : -1;
        if (pi >= 0 && !designs[q.design].fixed && used[q.design] < designs[q.design].count && places[q.design][pi].idx.every(c => owner[c] < 0)) addEntry(q.design, pi);
      }
      let cur = score();
      consider(cur);
      if (!movable.length) break;
      const T0 = 30, T1 = 0.02;
      for (let it = 0; it < iters; it++) {
        const T = T0 * Math.pow(T1 / T0, it / iters);
        const removed = []; let added = null;
        const nMov = ed.length - fixedEntries.length;
        if (nMov > 0 && rnd() < 0.2) {
          let e; do { e = (rnd() * ed.length) | 0; } while (isFixed(e));
          removed.push(removeEntry(e));
        } else {
          const d = movable[(rnd() * movable.length) | 0];
          const p = (rnd() * places[d].length) | 0;
          const idx = places[d][p].idx;
          if (idx.some(c => fixedOwner[c])) continue;
          // relocate when this design has no copies left
          if (used[d] >= designs[d].count) {
            const mine = []; for (let e = 0; e < ed.length; e++) if (ed[e] === d) mine.push(e);
            removed.push(removeEntry(mine[(rnd() * mine.length) | 0]));
          }
          for (const c of idx) { const j = owner[c]; if (j >= 0) removed.push(removeEntry(j)); }
          addEntry(d, p); added = [d, p];
        }
        const nx = score();
        if (nx >= cur || rnd() < Math.exp((nx - cur) / T)) {
          cur = nx;
          consider(cur);
        } else {
          if (added) removeEntry(owner[places[added[0]][added[1]].idx[0]]);
          for (let k = removed.length - 1; k >= 0; k--) addEntry(removed[k][0], removed[k][1]);
        }
      }
      if (progress) progress((r + 1) / restarts);
    }

    // Finishing pass: for every placed module, try each other design with the same shape in the exact
    // same spot (e.g. Receiver+Learning -> Learning, or -> Side Mount+Learning on the left edge).
    // Keeps a swap when the score does not drop, so idle effects are dropped via the effect tie-break.
    const sameShape = places.map(pl => designs.map((_, j) => j).filter(j => places[j] === pl && !designs[j].fixed));
    const polished = [];
    for (const t of top) {
      ed = []; ep = []; used.fill(0); owner.fill(-1);
      t.ed.forEach((d, k) => addEntry(d, t.ep[k]));
      let cur = score(), improved = true, guard = 0;
      while (improved && guard++ < 200) {
        improved = false;
        const pairs = ed.map((d, k) => [d, ep[k]]);
        for (const [d, p] of pairs) {
          if (designs[d].fixed) continue;
          for (const d2 of sameShape[d]) {
            if (d2 === d || used[d2] >= designs[d2].count) continue;
            removeEntry(owner[places[d][p].idx[0]]); addEntry(d2, p);
            const s2 = score();
            if (s2 > cur + 1e-9) { cur = s2; improved = true; break; }
            removeEntry(owner[places[d2][p].idx[0]]); addEntry(d, p);
          }
          if (improved) break;
        }
      }
      score();
      const key = totals.join(',');
      if (!polished.some(q => q.key === key)) polished.push({ s: cur, key, ed: ed.slice(), ep: ep.slice(), totals: totals.slice() });
    }
    polished.sort((a, b) => b.s - a.s);
    top.length = 0; top.push(...polished);

    const layouts = top.map(t => ({
      score: t.s, totals: t.totals,
      placements: t.ed.map((d, k) => { const p = places[d][t.ep[k]]; return { design: d, rot: p.rot, flip: p.flip, x: p.x, y: p.y }; }),
    }));
    return { ...layouts[0], top: layouts };
  }

  return { STATS, EFFECTS, VARIANTS, CATALOG, CAT, BAYS, MACHINES, baseStats, variantMult, spriteName, allowedSecond, shapeOf, orient, orientations, evaluate, machineOutput, readings, floorFor, usefulCap, mixOf, JOBS, allowedIn, optimize, unlimitedDesigns, POSITIONAL, idiv, mulTrunc };
}
if (typeof module !== 'undefined') module.exports = ENGINE;
