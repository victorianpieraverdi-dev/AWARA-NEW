# Universe Refactor Plan

## Goal

The player universe should stop being a compressed desktop map on mobile. It should become a layered architecture where one shared progression model feeds different views.

```text
UniverseProgression
→ UniverseState
→ Desktop Universe View
→ Mobile Focus View
→ Mobile Map View
→ Future Board View
```

## First implemented layer

`js/universe/universeProgression.js` is a pure data/model module.

It has no DOM access, no localStorage access and no dependency on the current `index.html` universe implementation.

It defines:

- `UNIVERSE_LEVELS`
- `getUniverseLevelByLight(light)`
- `getNextUniverseLevel(light)`
- `getUniverseProgress(light)`
- `getUnlockedUniverseLevels(light)`
- `getGenerationLayers(light)`
- `getUniverseCardDepth(light)`
- `createUniverseSnapshot(playerState)`

## Player levels

```text
Ahamkara / Mind
→ Soul / Feeling
→ Jiva / Earth and Star Temple
→ Spirit / Cosmos and Service
→ Sobor / Galactic and Universal Architecture
→ Divine Board Game
```

## Integration rule

Do not remove the existing legacy universe yet.

The current `core.js` / `index.html` universe remains the legacy desktop implementation until the new model is wired gradually.

Safe next steps:

1. Use `createUniverseSnapshot(state)` inside a debug-only panel.
2. Replace the mobile focus card text with data from `UniverseProgression`.
3. Add `UniverseMobileFocusView` as a separate module.
4. Only after that, begin extracting desktop rendering from `core.js`.

## UX rule

```text
more depth inside
less chaos outside
```

Mobile should show current level, current focus and next action. It should not expose the whole cosmology at once.
