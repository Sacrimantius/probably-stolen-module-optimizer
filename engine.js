// Module bay engine for Probably Stolen. Mirrors ModuleHelper / ModuleEffectHelper / PreBuiltItemHelper.
// Wrapped in one function so the page can also ship it to a Web Worker via ENGINE.toString().
function ENGINE() {
  const f32 = Math.fround;
  // C#: (int)((float)value * mult)
  const mulTrunc = (v, m) => Math.trunc(f32(f32(v) * f32(m)));
  // C#: int division truncates toward zero
  const idiv = (a, b) => Math.trunc(a / b);

  const STATS = ['P', 'E', 'Q'];

  // ModuleEffectHelper.moduleEffects. Names are the game's English text (tablemechanic mech_module_effect_*_name);
  // `game` is the identifier stored in MODULE_EFFECT1_TAG / MODULE_EFFECT2_TAG.
  const EFFECTS = {
    PREMIUM:      { name: 'Premium',            game: 'MODULE_EFFECT_PREMIUM', kind: 'module', mult: 1.2,  incompat: ['INFERIOR', 'LEARNING'], desc: 'Base stats x1.2.' },
    INFERIOR:     { name: 'Inferior',           game: 'MODULE_EFFECT_INFERIOR', kind: 'module', mult: 0.8,  incompat: ['PREMIUM', 'LEARNING'], desc: 'Base stats x0.8.' },
    RECEIVER:     { name: 'Receiver',           game: 'MODULE_EFFECT_RECEIVER', kind: 'module', incompat: [], desc: '+10% of base stats for each adjacent node.' },
    TOP_MOUNT:    { name: 'Top Mount',          game: 'MODULE_EFFECT_TOP_MOUNT', kind: 'module', incompat: [], desc: '+20% of base stats while touching the top edge of the bay.' },
    SIDE_MOUNT:   { name: 'Side Mount',         game: 'MODULE_EFFECT_SIDE_MOUNT', kind: 'module', incompat: [], desc: '+20% of base stats while touching the left edge of the bay.' },
    OVERVOLTED:   { name: 'Overcharged',        game: 'MODULE_EFFECT_OVERVOLTED', kind: 'module', mult: 2,    incompat: ['LEARNING'], risky: true, desc: 'Base stats x2. 10% chance per finished job to turn into a Ruined Module.' },
    DEGRADING:    { name: 'Degrading',          game: 'MODULE_EFFECT_DEGRADING', kind: 'module', mult: 2,    incompat: ['LEARNING'], risky: true, desc: 'Base stats x2. Every finished job lowers each positive base stat by 1.' },
    LEARNING:     { name: 'Learning Algorithm', game: 'MODULE_EFFECT_LEARNING_ALGORITHM', kind: 'module', incompat: ['DEGRADING', 'OVERVOLTED', 'PREMIUM', 'INFERIOR', 'NEG_FEEDBACK'], desc: 'Positive base stats start at 0 and gain 1 per finished job, up to 2x the original. Negative stats also gain 1 per job until they reach 0.' },
    NEG_FEEDBACK: { name: 'Negative Feedback',  game: 'MODULE_EFFECT_NEGATIVE_FEEDBACK', kind: 'module', mult: 1.25, incompat: ['LEARNING'], desc: 'Base stats x1.25, but takes 1/4 of the negative base stats of every adjacent item.' },
    SUPPORT:      { name: 'Support Node',       game: 'NODE_EFFECT_SUPPORT', kind: 'node',   incompat: [], desc: 'Gets 1/5 of the base stats of every adjacent module (negatives too).' },
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

  // ModuleDirectory: [performance, efficiency, quality]. Names are the game's English text (tableitem item_<id>_name).
  const CATALOG = [
    { id: 'system_module_performance', name: 'Performance Module', sprite: 'module_red', base: [16, 0, 0], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_efficiancy', name: 'Efficiency Module', sprite: 'module_green', base: [0, 16, 0], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_quality', name: 'Quality Module', sprite: 'module_yellow', base: [0, 0, 8], type: 'UNIVERSAL', variants: 'basic' },
    { id: 'system_module_overclock', name: 'Overclock Module', sprite: 'module_red_2', base: [36, -44, 0], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_eco', name: 'Eco Module', sprite: 'module_green_2', base: [-16, 32, 0], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_fineness', name: 'Refinement Module', sprite: 'module_yellow_2', base: [-8, -15, 25], type: 'UNIVERSAL', variants: 'advanced' },
    { id: 'system_module_streamlining', name: 'Streamlining Module', sprite: 'module_green_3', base: [8, 25, -16], type: 'UNIVERSAL' },
    { id: 'system_capped_neural_core', name: 'Neural Core Module (Capped)', sprite: 'module_black_4', base: [100, -100, 50], type: 'UNIVERSAL' },
    { id: 'system_uncapped_neural_core', name: 'Neural Core Module (Uncapped)', sprite: 'module_black_5', base: [200, -100, 100], type: 'UNIVERSAL' },
    { id: 'blank_module', name: 'Blank Module', sprite: 'module_white', base: [0, 0, 0], type: 'UNIVERSAL' },
    { id: 'system_module_corrupt', name: 'Corrupted Module', sprite: 'module_corrupt', base: [-8, -5, 0], type: 'UNIVERSAL' },
    { id: 'glitched_module', name: 'Glitched Module (stuck)', sprite: 'module_corrupt', base: [15, -15, 0], type: 'UNIVERSAL' },
    { id: 'system_module_ruined', name: 'Ruined Module', sprite: 'module_ruined', base: [0, 0, 0], type: 'UNIVERSAL' },
    { id: 'node_medium', name: 'Node (Medium)', sprite: 'node_m', base: [0, 0, 0], type: 'UNIVERSAL', node: true },
    { id: 'node_small', name: 'Node (Small)', sprite: 'node_s', base: [0, 0, 0], type: 'UNIVERSAL', node: true, noEffects: true },
    { id: 'farm_module_nutrifruit', name: 'Nutrifruit Hydroponic Module', sprite: 'farm_module_l2', base: [-10, -10, 0], type: 'HYDROPONIC', extra: 'Nutrifruit yield +1' },
    { id: 'farm_module_dream_cap', name: 'Dream Cap Neutralizer Hydroponic Module', sprite: 'farm_module_l4', base: [15, 15, 0], type: 'HYDROPONIC', extra: 'Dream Cap yield +2' },
    { id: 'farm_module_kotton_loom', name: 'Kotton Auto Loom Hydroponic Module', sprite: 'farm_module_l1', base: [-50, -100, 0], type: 'HYDROPONIC', extra: 'Produces Kotton Fabric' },
    { id: 'farm_module_nightmare_cap', name: 'Dream Cap Nightmare Hydroponic Module', sprite: 'farm_module5', base: [-33, -50, 0], type: 'HYDROPONIC', extra: 'Farmed Dream Cap becomes Nightmare Cap' },
    { id: 'farm_module_fillerweed_production', name: 'Fillerweed Production Hydroponic Module', sprite: 'farm_module_l5', base: [0, -25, 0], type: 'HYDROPONIC', extra: 'Fillerweed yield +4' },
    { id: 'farm_module_hydroreed_filter', name: 'Hydroreed Filter Hydroponic Module', sprite: 'farm_module_l6', base: [0, -15, 0], type: 'HYDROPONIC', extra: 'Hydroreed Filter yield +1' },
    { id: 'farm_module_smuggler', name: 'Hydroponic Smuggler Module', sprite: 'farm_module6', base: [0, 0, 0], type: 'HYDROPONIC', extra: 'Removes contraband status of growing seeds' },
    { id: 'evaporator_module_solvent_recovery', name: 'Evaporator Solvent Recovery Module', sprite: 'long_module1', base: [0, -25, 50], type: 'EVAPORATOR', extra: 'Will only recover Solvent' },
    { id: 'dna_manipulator_module_stabilizer', name: 'Genetic Stabilizer Module', sprite: 'long_module1', base: [-50, -25, 0], type: 'DNA_MANIPULATOR', extra: 'The target survives extraction' },
    { id: 'dna_manipulator_module_positive_filter', name: 'Positive Trait Filter Module', sprite: 'long_module1', base: [0, -25, 0], type: 'DNA_MANIPULATOR', extra: 'Extracts positive traits only' },
    { id: 'dna_manipulator_module_negative_filter', name: 'Negative Trait Filter Module', sprite: 'long_module1', base: [0, -25, 0], type: 'DNA_MANIPULATOR', extra: 'Extracts negative traits only' },
    { id: 'dna_manipulator_module_precision', name: 'Precision Extraction Module', sprite: 'long_module1', base: [-75, -75, 0], type: 'DNA_MANIPULATOR', extra: 'Extracts the scanned trait only' },
    { id: 'printer_module_metal', name: 'Metal Printer Module', sprite: 'long_module1', base: [0, -50, 0], type: 'PRINTER', extra: 'Metal Printing' },
    { id: 'printer_module_melee_batch', name: 'Melee Batch Module', sprite: 'long_module2', base: [-50, -50, 0], type: 'PRINTER', extra: 'Printed Melee Weapon Output +1' },
    { id: 'printer_module_cnc', name: 'Computer Numerical Control Module', sprite: 'long_module3', base: [-25, -25, 0], type: 'PRINTER', extra: 'Computer Numerical Control' },
    { id: 'alarm_module_transmitter', name: 'Alarm Transmitter Module', sprite: 'farm_module_l7', base: [0, -50, 0], type: 'ALARM', extra: 'Gain +1 reputation per night' },
    { id: 'furnace_module_blast', name: 'Furnace Module (Blast)', sprite: 'farm_module_l8', base: [0, -100, 0], type: 'FURNACE', extra: 'Uses 3 materials for 2 ingots, lower purity' },
    { id: 'furnace_module_junk', name: 'Furnace Module (Junk Processing)', sprite: 'long_module3', base: [0, 0, 0], type: 'FURNACE', extra: 'Convert 6 Junk into 4 Scrap Metal' },
  ];
  const CAT = Object.fromEntries(CATALOG.map(c => [c.id, c]));

  // Standard machines: a 7x5 grid; MachineHelper.ExpandModule / LoadUpgrade reshape it per MODULE_UPGRADE_STAGE_INT.
  const BAYS = [
    { name: 'Standard bay', mask: '10000010001000001110000010001000001' },
    { name: 'Expansion 1', mask: '10000010000000000000000000001000001' },
    { name: 'Expansion 2', mask: '0'.repeat(35) },
  ];

  // Machine*.cs: InitMachinery power, InitProgressTypeMachine speed, *_RATIO_INT tags, allowed module types.
  // adjQ: machine reads quality through GetAjustedQuality (total / qr). noQ: quality is not read at all.
  // game: the machine's item identifier in save files. grid: a machine with its own bay size (no expansion).
  const MACHINES = [
    { id: 'hydroponic', game: 'hydroponic', name: 'Hydroponic System', power: 8, speed: 8, pr: 2, qr: 2, adjQ: true, types: ['HYDROPONIC'] },
    { id: 'dna', game: 'plant_dna_manipulator', name: 'DNA Manipulator', power: 12, speed: 10, pr: 2, qr: 2, adjQ: true, types: ['DNA_MANIPULATOR'], uses: 'Quality bonus raises gene-edit success chance.' },
    { id: 'printer', game: 'printer', name: '3D Printer', power: 8, speed: 24, qr: 4, adjQ: true, types: ['PRINTER'], uses: 'Quality bonus raises printed item quality.' },
    { id: 'winerack', game: 'wine_rack', name: 'AgeWell', power: 24, pr: 2, er: 2, perfCutsPower: true, types: [], uses: 'Performance also cuts power draw.' },
    { id: 'dealmaker', game: 'deal_maker', name: 'Deal Maker', power: 25, qr: 10, adjQ: true, dealMaker: true, types: [], uses: 'Performance and efficiency both cut power.' },
    { id: 'projector', game: 'mirage_projector', name: 'Mirage Projector', power: 16, pr: 4, qr: 2, types: [] },
    { id: 'purifier', game: 'water_purifier', name: 'Water Purifier', power: 4, types: [] },
    { id: 'desequencer', game: 'desequencer', name: 'Cryptographic Desequencer', power: 10, speed: 33, noQ: true, types: ['ALARM'] },
    { id: 'furnace', game: 'furnace', name: 'Furnace', power: 8, types: ['FURNACE'], purity: true, uses: 'Performance is not used. Ingot purity +1 step per 100 quality (-1 with a Furnace Module (Blast)).' },
    { id: 'moisture', game: 'moisture_farm', name: 'Moisture Farm', power: 6, types: [] },
    { id: 'alarm', game: 'security_alarm', name: 'Alarm System', power: 4, noQ: true, types: ['ALARM'] },
    // MachineEvaporator.CreateMachineInventoryWindow: new GameGridInventory(4, 4), no expansion
    { id: 'evaporator', game: 'evaporator', name: 'Evaporator', power: 6, types: ['EVAPORATOR'], grid: { W: 4, H: 4, mask: '0'.repeat(16), name: 'Evaporator bay (4×4)' } },
  ];
  // The bay of machine m at expansion stage (0-2): { W, H, mask, name }
  function bayFor(m, stage) {
    if (m.grid) return m.grid;
    const b = BAYS[Math.max(0, Math.min(2, stage | 0))];
    return { W: 7, H: 5, mask: b.mask, name: b.name };
  }

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

  // Base stats after shape multiplier, creation effects and use count.
  // inst.fixedBase (from a save file whose numbers do not match the rules) overrides the computed stats.
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
    // ModuleEffectHelper.OnUsedLearningAlgo: a stat below its max gains 1 per use; a stat with no max
    // (it was negative) has max 0, so negatives also climb to 0.
    if (learnMax) b = b.map((v, i) => (learnMax[i] != null ? Math.min(learnMax[i], uses) : Math.min(0, v + uses)));
    if (effs.includes('DEGRADING')) b = b.map(v => (v > 0 ? Math.max(0, v - uses) : v));
    if (Array.isArray(inst.fixedBase) && inst.fixedBase.length === 3) b = inst.fixedBase.slice();
    return { base: b, learnMax };
  }
  // Finished jobs after which a Learning Algorithm module stops improving
  function learnFull(inst) {
    const effs = (inst.effects || []).filter(Boolean);
    if (!effs.includes('LEARNING')) return 0;
    const b0 = baseStats({ ...inst, uses: 0, fixedBase: null });
    const neg = Math.max(0, ...b0.base.map(v => -v));
    return Math.max(neg, ...b0.learnMax.filter(x => x != null));
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
    if (m.id === 'hydroponic') {
      x.push({ k: 'Harvest size', v: HARVEST.map(([b]) => harvestOf(b, r.quality)).join(' / '), was: HARVEST.map(([b]) => b).join(' / '), note: 'for plants that give ' + HARVEST.map(([b]) => b).join(' / ') });
    } else if (m.id === 'moisture') {
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

  const PURITY = { 5: 'Very Low Purity', 6: 'Low Purity', 7: 'Fair Purity', 8: 'High Purity', 9: 'Very High Purity', 10: 'Perfect Purity' };
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
  // PlantList: base harvest quantity per plant (before genetics). Hydroreed (0) is harvested by its own rule.
  const HARVEST = [[4, 'Fillerweed'], [5, 'Nutrifruit'], [8, 'Coffee, Dream Cap, Bloomberry'], [9, 'Kotton']];
  // HydroponicHelper.GetHarvestCount: round(base + base * adjustedQuality / 100), midpoint away from zero
  const roundAway = v => Math.sign(v) * Math.round(Math.abs(v));
  const harvestOf = (base, q) => Math.max(0, roundAway(base + base * (q / 100)));
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
    // A reading with `jobs` takes a parameter (o.job) picked from that list: job size, base harvest...
    if (m.speed) {
      R('cycles', 'Cycles per job', [1, 0, 0], (t, o = {}) => -Math.ceil((o.job || 100) / Math.max(1, out0(t).speed)), v => -v + ' cycle' + (v === -1 ? '' : 's'), { low: true, job: true, jobs: JOBS[m.id] || [], jobLabel: 'job size' });
      R('speed', 'Processing speed', [1, 0, 0], t => out0(t).speed, v => v + ' per cycle');
    }
    if (m.id === 'hydroponic') R('harvest', 'Harvest size', [0, 0, 1], (t, o = {}) => harvestOf(o.job || 8, out0(t).quality), v => v + ' per harvest', { job: true, jobs: HARVEST, jobLabel: 'base harvest' });
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
          if (learnMax) inst.uses = learnFull(inst); // fully trained
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
    const TB_RISK = 0.005, TB_MOD = 0.003, TB_EFF = 0.0003;
    const risky = designs.map(d => (d.effects || []).some(e => EFFECTS[e] && EFFECTS[e].risky));

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
      let missing = 0, riskyCount = 0;
      for (let d = 0; d < D; d++) { if (designs[d].min > used[d]) missing += designs[d].min - used[d]; if (risky[d]) riskyCount += used[d]; }
      // tie-breaks (together always below the smallest real score step of 0.25):
      // no Overcharged / Degrading modules, then fewer modules, then fewer effects
      let s = -TB_RISK * riskyCount - TB_MOD * ed.length - TB_EFF * effCount - 1e4 * missing;
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
    const annealShare = opts.exactMs > 0 ? 0.3 : 1;
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
      if (progress) progress(((r + 1) / restarts) * annealShare);
    }

    // ---------- exact search: branch and bound over every layout ----------
    // Cells are filled in reading order: the first undecided cell either gets a module whose first cell is
    // that cell, or is left empty for good. A branch is cut when an optimistic score for anything it could
    // still become (bound) cannot beat the best layout found so far (annealing seeds it). If the search
    // finishes before opts.exactMs runs out, the best layout is proven optimal for this score.
    let proven = null, exactNodes = 0;
    const exactOk = terms.every(t => (t.scale || 0) >= 0 && t.w.every(x => x >= 0));
    if (opts.exactMs > 0 && movable.length && exactOk) {
      const t0 = Date.now(), deadline = t0 + opts.exactMs, N = W * H;
      const emptyMark = new Uint8Array(N), stamp = new Int32Array(N);
      let sid = 0;
      const anchored = places.map(pl => {
        const m = new Map();
        pl.forEach((p, i) => { let a = N; for (const q of p.idx) if (q < a) a = q; if (!m.has(a)) m.set(a, []); m.get(a).push(i); });
        return m;
      });
      const cellsOf = designs.map(d => d.shape.cells.length);
      const cap = c => (c === Infinity ? 40 : c);
      // positive base stats offered by modules (not nodes), best first, one entry per copy
      const posList = [0, 1, 2].map(k => {
        const l = []; designs.forEach(d => { if (!d.node && d.base[k] > 0) for (let c = 0; c < cap(d.count); c++) l.push(d.base[k]); });
        return l.sort((a, b) => b - a);
      });
      const topSum = (k, n) => { let s = 0; const l = posList[k]; for (let i = 0; i < n && i < l.length; i++) s += l[i]; return s; };
      const nodeCopies = designs.reduce((a, d) => a + (d.node ? cap(d.count) : 0), 0);
      // most neighbours a piece can have: its adjacent cells inside the bay, over every legal placement
      const adjMax = designs.map((d, i) => {
        let best = 0;
        for (const p of places[i]) {
          const own = new Set(p.idx), adj = new Set();
          for (const c of p.idx) {
            const x = c % W, y = (c - x) / W;
            for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
              const q = ny * W + nx;
              if (nx >= 0 && ny >= 0 && nx < W && ny < H && open[q] && !own.has(q)) adj.add(q);
            }
          }
          if (adj.size > best) best = adj.size;
        }
        return best;
      });
      // the most a module could ever give the bay, wherever it sits
      const U = designs.map((d, i) => {
        const b = d.base, ef = d.effects || [];
        if (ef.includes('SUPPORT')) return [0, 1, 2].map(k => idiv(topSum(k, adjMax[i]), 5));
        return [0, 1, 2].map(k => {
          let u = b[k];
          if (b[k] > 0) {
            if (ef.includes('RECEIVER')) u += idiv(b[k] * 10 * Math.min(nodeCopies, adjMax[i]), 100);
            if (ef.includes('TOP_MOUNT')) u += idiv(b[k] * 20, 100);
            if (ef.includes('SIDE_MOUNT')) u += idiv(b[k] * 20, 100);
          }
          return u;
        });
      });
      const tv = terms.map(t => U.map(u => t.w[0] * u[0] + t.w[1] * u[1] + t.w[2] * u[2]));
      const order = terms.map((t, ti) => movable.slice().sort((a, b) => tv[ti][b] / cellsOf[b] - tv[ti][a] / cellsOf[a]));
      const mainTerm = Math.max(0, terms.findIndex(t => t.scale > 0));
      const branchOrder = order[mainTerm];
      const isFree = c => open[c] && owner[c] < 0 && !emptyMark[c];
      const nbs = [];
      // upper bound of a placed module's final contribution, given what is around it now and the
      // undecided cells next to it (each can bring at most one more neighbour)
      function placedUB(e, acc, remNodes) {
        const d = ed[e], it = designs[d], b = it.base, ef = it.effects;
        if (!ef.length) { acc[0] += b[0]; acc[1] += b[1]; acc[2] += b[2]; return; }
        const pl = places[d][ep[e]];
        nbs.length = 0; let free = 0; sid++;
        for (const c of pl.idx) {
          const x = c % W, y = (c - x) / W;
          for (let k = 0; k < 4; k++) {
            const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const q = ny * W + nx, j = owner[q];
            if (j >= 0) { if (j !== e && !nbs.includes(j)) nbs.push(j); }
            else if (isFree(q) && stamp[q] !== sid) { stamp[q] = sid; free++; }
          }
        }
        if (ef.includes('SUPPORT')) {
          for (let k = 0; k < 3; k++) {
            let s = topSum(k, free);
            for (const j of nbs) if (!designs[ed[j]].node) s += designs[ed[j]].base[k];
            acc[k] += idiv(s, 5);
          }
          return;
        }
        let nNow = 0; for (const j of nbs) if (designs[ed[j]].node) nNow++;
        const nMax = nNow + Math.min(free, remNodes);
        for (let k = 0; k < 3; k++) {
          let u = b[k];
          for (const f of ef) {
            if (f === 'RECEIVER') u += idiv(b[k] * 10 * (b[k] > 0 ? nMax : nNow), 100);
            else if (f === 'TOP_MOUNT') { if (pl.y <= 0) u += idiv(b[k] * 20, 100); }
            else if (f === 'SIDE_MOUNT') { if (pl.x <= 0) u += idiv(b[k] * 20, 100); }
            else if (f === 'NEG_FEEDBACK') { let s = 0; for (const j of nbs) { const v = designs[ed[j]].base[k]; if (v < 0) s += v; } u += idiv(s, 4); }
          }
          acc[k] += u;
        }
      }
      const acc = [0, 0, 0];
      function bound() {
        let remNodes = 0;
        for (let d = 0; d < D; d++) if (designs[d].node && !designs[d].fixed) remNodes += cap(designs[d].count) - used[d];
        acc[0] = acc[1] = acc[2] = 0;
        let effC = 0, rc = 0;
        for (let e = 0; e < ed.length; e++) { placedUB(e, acc, remNodes); effC += designs[ed[e]].effects.length; if (risky[ed[e]]) rc++; }
        let free = 0; for (let c = 0; c < N; c++) if (isFree(c)) free++;
        // with step pruning the bound is on the goal alone (tie-breaks left out)
        let s = coarse ? 0 : -TB_RISK * rc - TB_MOD * ed.length - TB_EFF * effC;
        for (let ti = 0; ti < terms.length; ti++) {
          const t = terms[ti];
          let v = t.w[0] * acc[0] + t.w[1] * acc[1] + t.w[2] * acc[2], f = free;
          // fractional knapsack over the free cells with the remaining modules
          for (const d of order[ti]) {
            if (f <= 0) break;
            const val = tv[ti][d]; if (val <= 0) break;
            const rem = designs[d].count - used[d]; if (rem <= 0) continue;
            const sz = cellsOf[d], n = Math.min(rem, Math.floor(f / sz));
            v += n * val; f -= n * sz;
            if (n < rem && f > 0) { v += (val * f) / sz; f = 0; }
          }
          if (t.scale) s += t.scale * (t.cap != null && v > t.cap ? t.cap : v);
          if (t.min != null && v < t.min - 1e-9) s -= PEN * (t.min - v) + 100;
        }
        return s;
      }
      // Real scores move in steps of `step` (weights are multiples of 0.25; tie-breaks add less than 0.25 in
      // total), so a branch whose bound is below best + step cannot beat the best on the goal itself.
      const q4 = x => Math.abs(x * 4 - Math.round(x * 4)) < 1e-9;
      const coarse = terms.every(t => t.w.every(q4) && q4(t.scale || 0) && (t.cap == null || q4(t.cap)) && (t.min == null || q4(t.min)));
      const step = coarse ? 0.25 - 1e-6 : 1e-9;
      let best = top.length ? top[0].s : -Infinity, timedOut = false;
      function dfs(from) {
        if ((++exactNodes & 1023) === 0) {
          const now = Date.now();
          if (now > deadline) { timedOut = true; return; }
          if (progress && (exactNodes & 65535) === 0) progress(annealShare + (1 - annealShare) * (now - t0) / opts.exactMs);
        }
        if (bound() < best + step) return;
        const sc = score(); if (sc > best) best = sc; consider(sc);
        let c = from; while (c < N && !isFree(c)) c++;
        if (c >= N) return;
        for (const d of branchOrder) {
          if (used[d] >= designs[d].count) continue;
          const list = anchored[d].get(c); if (!list) continue;
          for (const p of list) {
            let ok = true;
            for (const q of places[d][p].idx) if (owner[q] >= 0 || emptyMark[q]) { ok = false; break; }
            if (!ok) continue;
            addEntry(d, p); dfs(c + 1); removeEntry(ed.length - 1);
            if (timedOut) return;
          }
        }
        emptyMark[c] = 1; dfs(c + 1); emptyMark[c] = 0;
      }
      reset();
      if (!top.length) consider(score());
      dfs(0);
      proven = !timedOut;
      if (progress) progress(1);
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
    return { ...layouts[0], top: layouts, proven, exactNodes, exactOk };
  }

  // ---------- save file import ----------
  // Reads a save_N.es3 (Easy Save 3: JSON, but dictionary keys may be bare numbers). Read-only.
  // shapeRows(spriteName) -> rows like ['11','01'] for matching a module's grid shape to its variant.
  // Returns { machines: [{ game, id, name, stage, mods: [{ inst, place, temp }] }], loose: [inst], skipped: [id] }
  function parseLenientJson(t) {
    let o = '', i = 0, inS = false;
    const n = t.length;
    while (i < n) {
      const c = t[i];
      if (inS) {
        if (c === '\\') { o += c + t[i + 1]; i += 2; continue; }
        if (c === '"') inS = false;
        o += c; i++; continue;
      }
      if (c === '"') { inS = true; o += c; i++; continue; }
      if (c === '{' || c === ',') {
        o += c; i++;
        let j = i; while (j < n && (t[j] === ' ' || t[j] === '\n' || t[j] === '\r' || t[j] === '\t')) j++;
        const m = /^[-\w.]+(?=\s*:)/.exec(t.slice(j, j + 80));
        if (m) { o += t.slice(i, j) + '"' + m[0] + '"'; i = j + m[0].length; }
        continue;
      }
      o += c; i++;
    }
    return JSON.parse(o);
  }
  const SKIP_INVS = /^(soldInvJSON|trashcanInvJSON|docInvJSON)$/;
  function importSave(text, shapeRows) {
    const d = parseLenientJson(text);
    const invs = [];
    (function walk(v, key) {
      if (typeof v === 'string') { if (v.startsWith('{"saveItems"') && !SKIP_INVS.test(key)) invs.push(JSON.parse(v)); return; }
      if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], k);
    })(d, '');
    if (!invs.length) throw new Error('No inventories found. Is this a Probably Stolen save (save_N.es3)?');
    const effByGame = Object.fromEntries(Object.entries(EFFECTS).map(([k, e]) => [e.game, k]));
    const machByGame = Object.fromEntries(MACHINES.map(m => [m.game, m]));
    const out = { machines: [], loose: [], skipped: [] };
    const cellsOfData = s => { const w = s['<width>k__BackingField'], c = []; s.data.forEach((v, i) => { if (v) c.push([i % w, Math.floor(i / w)]); }); return c; };
    const cellKey = cells => cells.map(c => c.join(',')).sort().join(';');
    for (const inv of invs) {
      const items = inv.saveItems || [];
      const byUuid = new Map(items.map(it => [it.uuid, it]));
      const parentOf = new Map();
      items.forEach(it => (it.childItems || []).forEach(c => parentOf.set(c, it)));
      const tagOf = it => { const m = {}; (it._keys || []).forEach((k, i) => { m[k] = it._values[i]; }); return m; };
      const machines = new Map();
      for (const it of items) {
        if (!(it._keys || []).includes('MODULE_TAG')) continue;
        const cat = CAT[it.identifier];
        if (!cat) { out.skipped.push(it.identifier); continue; }
        const tg = tagOf(it), int = k => (tg[k] ? tg[k].valueInt | 0 : 0);
        const effects = ['MODULE_EFFECT1_TAG', 'MODULE_EFFECT2_TAG'].map(k => tg[k] && effByGame[tg[k].internalValueString]).filter(Boolean);
        // variant: the module's own (unrotated) grid shape
        let variant = '';
        if (cat.variants) {
          const key = cellKey(cellsOfData(it.itemShape));
          const v = VARIANTS[cat.variants].find(v => { const r = shapeRows(spriteName(cat, v.id)); return r && cellKey(shapeOf(r).cells) === key; });
          if (v) variant = v.id;
        }
        const actual = [int('BONUS_PERCENTAGE_PERFORMANCE_INT'), int('BONUS_PERCENTAGE_EFFICIENCY_INT'), int('BONUS_PERCENTAGE_QUALITY_INT')];
        const inst = { cat: cat.id, variant, effects, uses: 0 };
        // finished jobs, worked back from the stats
        const b0 = baseStats(inst).base;
        if (effects.includes('LEARNING')) {
          const lm = baseStats(inst).learnMax;
          let u = 0;
          actual.forEach((v, k) => { if (lm[k] != null) u = Math.max(u, v); else if (b0[k] < 0) u = Math.max(u, v - b0[k]); });
          inst.uses = u;
        } else if (effects.includes('DEGRADING')) {
          const k = b0.findIndex(v => v > 0);
          if (k >= 0) inst.uses = Math.max(0, b0[k] - actual[k]);
        }
        if (baseStats(inst).base.some((v, k) => v !== actual[k])) inst.fixedBase = actual;
        const parent = parentOf.get(it.uuid);
        const m = parent && machByGame[parent.identifier];
        if (!m) { out.loose.push(inst); continue; }
        // where it sits: GridShape.ForwardTransform (flip, then orientation 0-3) of the unrotated shape, plus minX/minY
        const ms = it.itemModifiedShape || it.itemShape;
        const w = ms['<width>k__BackingField'], h = ms['<height>k__BackingField'], or = (ms['<orientation>k__BackingField'] | 0) % 4;
        const cells = cellsOfData(ms).map(([x, y]) => {
          if (ms['<flipped>k__BackingField']) x = w - 1 - x;
          return or === 1 ? [y, w - 1 - x] : or === 2 ? [w - 1 - x, h - 1 - y] : or === 3 ? [h - 1 - y, x] : [x, y];
        });
        const key = cellKey(cells);
        const o = orientations(shapeOf(shapeRows(spriteName(cat, variant)) || ['1'])).find(o => cellKey(o.cells) === key);
        const place = o ? { x: ms['<minX>k__BackingField'] | 0, y: ms['<minY>k__BackingField'] | 0, rot: o.rot, flip: o.flip } : null;
        const temp = ['TEMP_PERCENTAGE_PERFORMANCE_INT', 'TEMP_PERCENTAGE_EFFICIENCY_INT', 'TEMP_PERCENTAGE_QUALITY_INT'].map(int);
        if (!machines.has(parent.uuid)) {
          const ptg = tagOf(parent);
          machines.set(parent.uuid, { game: m.game, id: m.id, name: m.name, stage: ptg.MODULE_UPGRADE_STAGE_INT ? ptg.MODULE_UPGRADE_STAGE_INT.valueInt | 0 : 0, mods: [] });
        }
        machines.get(parent.uuid).mods.push({ inst, place, temp });
      }
      // machines with an empty bay still count (their bay size matters)
      for (const it of items) {
        const m = machByGame[it.identifier];
        if (!m || machines.has(it.uuid) || !(it._keys || []).includes('IS_RECEIVING_BONUS_FROM_MODULE_BOOL') && !(it._keys || []).includes('MACHINE')) continue;
        const ptg = tagOf(it);
        machines.set(it.uuid, { game: m.game, id: m.id, name: m.name, stage: ptg.MODULE_UPGRADE_STAGE_INT ? ptg.MODULE_UPGRADE_STAGE_INT.valueInt | 0 : 0, mods: [] });
      }
      out.machines.push(...machines.values());
    }
    return out;
  }

  return { STATS, EFFECTS, VARIANTS, CATALOG, CAT, BAYS, MACHINES, bayFor, baseStats, learnFull, variantMult, spriteName, allowedSecond, shapeOf, orient, orientations, evaluate, machineOutput, readings, floorFor, usefulCap, mixOf, JOBS, HARVEST, harvestOf, allowedIn, optimize, unlimitedDesigns, POSITIONAL, idiv, mulTrunc, importSave };
}
if (typeof module !== 'undefined') module.exports = ENGINE;
