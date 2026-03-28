# 🌌 Solar System in Three.js

A rebuilt, lightweight Solar System simulation rendered directly with Three.js.

## Highlights

- 3D scene with the Sun and eight planets.
- Earth includes a Moon orbit.
- Orbit controls (drag to rotate, scroll to zoom).
- Live simulation date with date picker.
- Adjustable simulation speed in days per second.
- Toggle orbit rings and planet labels.
- Optional iframe host page for embedding.

## Run locally

Because this project imports ES modules from a CDN, run it with a local web server:

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/systeme_solaire.html`
- or `http://localhost:8080/systeme_solaire_iframe.html`

## Project files

- `systeme_solaire.html` — main app shell and controls.
- `systeme_solaire.css` — UI and overlay styling.
- `systeme_solaire.js` — Three.js scene setup and simulation logic.
- `systeme_solaire_iframe.html` — embed wrapper page.
