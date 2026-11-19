# Probably Stolen — Module Bay Optimizer

A fan-made simulator and layout optimizer for the machine module bays in *Probably Stolen*.

**Use it here: https://sacrimantius.github.io/probably-stolen-module-optimizer/**

Drag modules into a machine's bay to see exactly what they give you, or let the optimizer find the best layout for a goal you set.

## What it models

The numbers follow the game's own rules. Importing real saves reproduces the game's per-module bonuses exactly.

- **Module stats**: every module type, its shape variants (square, L, T, C, S, H) and their stat multipliers.
- **Effects**: Premium, Inferior, Overcharged, Degrading, Learning Algorithm (with finished jobs, including negative stats climbing back to 0), Negative Feedback, Receiver (per adjacent node), Top Mount and Side Mount (touching the top or left edge) and Support Node. The game's integer rounding is reproduced.
- **Module bays**: the standard 7×5 bay, both expansion-kit stages, and the Evaporator's own 4×4 bay.
- **Machines**: what each machine actually does with the totals:
  - Furnace: ingot purity by ore share, including the Furnace Module (Blast) penalty.
  - Cryptographic Desequencer, 3D Printer, Hydroponic System and DNA Manipulator: cycles per job for each chip, seed or edit.
  - Hydroponic System: harvest size per plant.
  - Moisture Farm: water grade and volume.
  - Water Purifier: max purity steps.
  - Evaporator: distillate share.
  - AgeWell: aging days.
  - Mirage Projector: attractiveness.
  - Alarm System: chance to stop a burglary.
  - Deal Maker: bargain bonus.
  - All machines: power draw.

Module, effect and machine names are the game's own English names.

## Using it

- **Import from your save**: choose a `save_N.es3` file from `%USERPROFILE%\AppData\LocalLow\Questing Goose Studio\Probably Stolen\`. Every module in it is added to *My modules*: the ones installed in your machines (with their finished jobs) and the loose ones. Any machine can then be shown exactly as it is in the game. The file is read in your browser and never uploaded or changed.
- **My modules**: add the modules you own (shape, effects, finished jobs) and drag them into the bay. Identical modules are stacked with a count. Click a placed module to see where each bonus comes from.
- **Goal**: a priority list of machine readings, for example *1. Ingot purity, all-ore input: as high as possible, 2. Power draw: as low as possible*. The optimizer gets line 1 as good as it can, keeps that, then improves line 2, and so on. Thresholds such as purity steps, water grades and cycles per job are handled for you. When layouts tie, it prefers ones without Overcharged or Degrading modules, then fewer modules.
- **Search effort**: Quick, Normal and Deep use a fast random search. **Exact** also checks every possible layout (branch and bound, up to 20 seconds per priority). When it finishes, the result is proven to be the best possible.
- **Unlimited modules**: let the optimizer use any number of any module design you allow. You can also limit it to one effect per module, which is easier to find in the game. The result is a shopping list.
- **Must use / Lock**: force a module into the layout, or keep it exactly where it is.
- **Top 5**: each search keeps the five best distinct layouts; load any of them with one click.
- Repeating a search you already ran is answered from a cache in your browser.
- Your setup is saved in your browser. *Back up or share this setup* gives you a text copy.

## Game art

This repository contains **no game art**. Modules are drawn as simple coloured shapes. Under *Module pictures* you can choose to load the module pictures from the [official wiki](https://probablystolen.wiki.gg/wiki/Items/Tags/MODULE) instead; your browser fetches them from the wiki directly. `sprite-data.json` only holds each module's cell shape.

## Building

The page is a single static file. `index.html` is generated, so edit the sources and rebuild:

```
node build.mjs
```

| File | Purpose |
|---|---|
| `engine.js` | Game rules: module catalogue, effects, bays, machine readings, save import, optimizer (simulated annealing plus exact branch-and-bound search) |
| `app.html` | The page: UI and styles |
| `sprite-data.json` | Module cell shapes |
| `build.mjs` | Inlines everything into `index.html` |

## License

MIT, see [LICENSE](LICENSE). This covers the code in this repository only.

## Disclaimer

Unofficial fan project, not affiliated with the developers of *Probably Stolen*. Game names and mechanics belong to their owners. Numbers may drift after game updates.
