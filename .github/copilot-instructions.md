# Intro Felp Cartas - AI Coding Agent Instructions

## Project Overview
Interactive web-based card reveal system with customizable animated backgrounds and visual effects. Originally designed for streaming/OBS, featuring custom "Pokémon-style" cards with dynamic shader effects (stars, smoke, ink, Balatro-style distortion, CRT). Includes a separate background generator tool for creating patterned wallpapers using Pokémon sprites from PokeAPI.

## Architecture

### Two Main Pages
1. **index.html** - Main card reveal interface with background effects and controls
2. **bg-generator.html** - Standalone tool for generating custom patterned backgrounds with Pokémon sprites

### Core Component Structure
- **scripts/cards.js** - Card deck management, flip animations, and image tinting
  - `deckData` array defines 5 custom cards (not actual Pokémon, but themed items like "Agenda 2030", "Ramen", etc.)
  - Each card has: image path, name, and hex color for canvas-based tinting
  - `tintImage()` applies color overlay while preserving white pixels (threshold: 240)
  - `flipSequence()` reveals 5 random cards with staggered timing (200ms delays)

- **Visual Effects (Shader Scripts)** - All canvas-based, run in RequestAnimationFrame loops:
  - `stars-shader.js` - Particle system with twinkle animation, HSL color control
  - `smoke-shader.js` - Perlin-noise-like smoke effect using simplex noise
  - `ink-shader.js` - Ink blot/liquid effect with color shifting
  - `balatro-shader.js` - Psychedelic distortion effect (named after Balatro game)
  - `crt-shader.js` - CRT TV simulation with scanlines, RGB shift, and curvature

- **Background Control**
  - `bg-control.js` - Color palette selector for solid backgrounds (10 preset colors)
  - `pattern-bg-control.js` - Pattern layer overlay system (dots, stripes, etc.)
  - `bg-generator.js` - Separate tool: large class-based generator for Pokemon sprite patterns

### State Management
- **session-storage.js** - Simple wrapper for `localStorage` (not sessionStorage)
  - All visual settings persisted here
  - Keys follow pattern: `bgColor`, `starsSettings`, `smokeSettings`, etc.
  - Settings are objects serialized to JSON

### UI System
- **ui.js** - Audio controls and menu toggle behavior
  - Auto-play music workaround for OBS browser sources (requires user interaction)
  - Volume set to 0.05 by default
  - Background music: `audio/theme.ogg` (looping)

## Key Patterns & Conventions

### Shader Effect Pattern (Used Across All Visual Effects)
```javascript
// 1. Setup function with defaults and session storage
function setupXxxControls() {
    const defaults = { enabled: false, /* params */ };
    let config = getFromSessionStorage('xxxSettings') || defaults;
    saveToSessionStorage('xxxSettings', config);
    
    // Bind UI controls to config
    document.getElementById('xxx-toggle').onchange = (e) => {
        config.enabled = e.target.checked;
        if (e.target.checked) initXxxShader();
    };
}

// 2. Init function creates canvas context and animation loop
function initXxxShader() {
    const canvas = document.getElementById('xxx-canvas');
    const ctx = canvas.getContext('2d');
    
    function animate() {
        // Render frame
        requestAnimationFrame(animate);
    }
    animate();
}
```

### Control Panel UI Convention
- HTML structure: `.control-panel > .control-row > (label + input + .control-value)`
- Range inputs always have a corresponding `-val` span for displaying current value
- Reset buttons restore defaults and update both config and UI
- Panels toggle visibility via inline `style="display: none"`

### Color Management
- Background colors stored as hex strings (e.g., `#37946e`)
- Active color button gets `.active` class
- `rgbToHex()` converts computed styles to hex for comparison
- All color pickers use data attributes: `data-color="#xxxxxx"`

### Card System Specifics
- **Exactly 5 cards displayed** (hardcoded loop in cards.js)
- Cards use 3D flip animation via CSS `rotateY()`
- Image tinting uses canvas pixel manipulation (RGBA loop with saturation factor 0.4)
- Card backs have layered structure: `fondo_carta.png` (background) + `reverso_carta.png` (front)
- Name box is 3-part image: left/center/right segments with text overlay

## External Dependencies
- **PokeAPI** - Used by pokemon-data.js and bg-generator.js
  - Random Pokemon fetching with generation filtering (1-9)
  - Sprite URLs: `pokemon.sprites.front_default` (smooth) or `front_default` for pixel art
  - Shiny variants available via `shiny` query parameter
  
- **umami.is** - Analytics tracking (script tag in both HTML files)

## Development Workflows

### Adding New Visual Effect
1. Create `scripts/new-effect-shader.js` following the shader pattern above
2. Add `<canvas id="new-effect-canvas">` to index.html (inside body, before main content)
3. Add control panel HTML with unique IDs (`new-effect-toggle`, etc.)
4. Include script tag at bottom of index.html: `<script src="scripts/new-effect-shader.js"></script>`
5. Canvas should have `aria-hidden="true"` and `position: fixed` styling

### Modifying Card Deck
- Edit `deckData` array in cards.js (each entry: `{image, name, color}`)
- Images must be in `img/pokemons/` folder (PNG format)
- Card images are tinted, so use grayscale or low-saturation source images
- Maximum 7 cards in `deckData` (randomly selects 5 per flip)

### Testing in OBS
- Use "Browser Source" with URL pointing to index.html
- Width: 1920px, Height: 1080px recommended
- Enable "Control audio via OBS" to bypass autoplay restrictions
- Music will auto-start if OBS audio control is enabled

## File Organization
- `/img/` - Asset images (Aseprite source files + exported PNGs)
  - `/img/pokemons/` - Card character sprites (not actual Pokémon)
  - Card template images: `fondo_carta.png`, `reverso_carta.png`, `name_box_*.png`
- `/scripts/` - All JavaScript (no build process, vanilla JS)
- `/styles/` - CSS files (no preprocessor)
  - `main.css` - Global styles and layout
  - `cards.css` - Card-specific 3D flip animations
  - `bg-generator.css` - Styles for generator page only

## Important Notes
- **No build system** - All code runs directly in browser (ES6+ features)
- **No frameworks** - Pure vanilla JavaScript with manual DOM manipulation
- **Spanish UI** - All user-facing text is in Spanish (lang="es")
- **Canvas rendering** - Heavy use of 2D canvas for effects and image manipulation
- **Aseprite workflow** - Source `.aseprite` files present but exported PNGs are used
- **OBS-first design** - Auto-play workarounds and fixed dimensions for streaming overlays

## Common Gotchas
- Canvas effects use `devicePixelRatio` clamped to 1.5 for performance
- Image tinting requires `crossOrigin = "Anonymous"` to read pixel data
- Shader configs use camelCase keys but HTML IDs use kebab-case (e.g., `colorShift` ↔ `xxx-colorshift`)
- `flipSequence()` in cards.js is not exported - trigger via browser console or add button
- Background generator is resource-intensive - debounced regeneration (300ms)
