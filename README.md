# Probably Stolen — Module Bay Optimizer

A fan-made simulator and layout optimizer for the machine module bays in *Probably Stolen*.

**Use it here: https://sacrimantius.github.io/probably-stolen-module-optimizer/**

Drag modules into a machine's 7×5 bay to see exactly what they give you, or let the optimizer find the best layout for a goal you set.

## What it models

The numbers follow the game's own rules:

- **Module stats**: every module type, its shape variants (square, L, T, C, S, H) and their stat multipliers.
- **Effects**: Premium, Inferior, Overvolted, Degrading, Learning Algorithm (with job count), Negative Feedback, Receiver (per adjacent node), Top Mount / Side Mount (touching the top or left edge) and Support nodes. The game's integer rounding is reproduced.
- **Module bays**: the standard bay and both expansion-kit stages.
- **Machines**: what each machine actually does with the totals:
  - Furnace: ingot purity by ore share, including the Blast Furnace module's penalty.
  - Desequencer, 3D Printer, Hydroponic Bay and DNA Manipulator: cycles per job for each chip, seed or edit.
  - Moisture Farm: water grade and volume.
  - Water Purifier: max purity steps.
  - Evaporator: distillate share.
  - Wine Rack: aging days.
  - Projector: attractiveness.
  - Alarm: chance to stop a burglary.
  - Deal Maker: bargain bonus.
  - All machines: power draw.

## Using it

- **My modules**: add the modules you own (shape, effects, finished jobs) and drag them into the bay. Click a placed module to see where each bonus comes from.
- **Goal**: a priority list of machine readings, for example *1. Ingot purity, all-ore input: as high as possible, 2. Power draw: as low as possible*. The optimizer gets line 1 as good as it can, keeps that, then improves line 2, and so on. Thresholds such as purity steps, water grades and cycles per job are handled for you.
- **Unlimited modules**: let the optimizer use any number of any module design you allow. You can also limit it to one effect per module, which is easier to find in the game. The result is a shopping list.
- **Must use / Lock**: force a module into the layout, or keep it exactly where it is.
- **Top 5**: each search keeps the five best distinct layouts; load any of them with one click.
- Your setup is saved in your browser. *Back up or share this setup* gives you a text copy.

## Game art

This repository contains **no game art**. Modules are drawn as simple coloured shapes. To see the real icons, load the sprite sheet from your own copy of the game. It stays in your browser and is never uploaded.

1. Export the game's assets with [AssetRipper](https://github.com/AssetRipper/AssetRipper): open the game's install folder, then *Export → Export Primary Content*.
2. In the page, open **Use your game's sprites** and choose `Assets/Resources/items/items_module.png` from the export.

`sprite-data.json` only holds each module's cell shape and its rectangle in that sprite sheet.

## Building

The page is a single static file. `index.html` is generated, so edit the sources and rebuild:

```
node build.mjs
```

| File | Purpose |
|---|---|
| `engine.js` | Game rules: module catalogue, effects, bay evaluation, machine readings, optimizer (simulated annealing) |
| `app.html` | The page: UI and styles |
| `sprite-data.json` | Module cell shapes and sprite-sheet rectangles |
| `shapes.mjs` | Regenerates `sprite-data.json` from an AssetRipper export after a game update |
| `build.mjs` | Inlines everything into `index.html` |

## Disclaimer

Unofficial fan project, not affiliated with the developers of *Probably Stolen*. Game names and mechanics belong to their owners. Numbers may drift after game updates.
