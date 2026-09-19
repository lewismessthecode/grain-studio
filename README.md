# Grain Studio

A free, open-source grainy gradient wallpaper studio. Mix colors, tune the texture, and export PNG wallpapers up to 6K. English by default, with a Chinese language switch.

**Live:** https://lewis-grain-studio.theboyhasnopatience.chatgpt.site

## Run locally

No dependencies or build step. Open `dist/index.html` in a browser, or run:

```sh
python3 -m http.server 8080 --directory dist
```

## Features

- 12 curated palettes and editable colors
- Mist, flow, and linear compositions; remix and undo
- Subtle, Balanced, and Textured presets; Balanced is the default
- Grain strength, export-pixel spacing, softness, and light controls
- Native-pixel center crop rendered from the full export (refresh after changing settings)
- Desktop, ultrawide, phone, and square PNG exports
- All rendering stays in your browser; no account or watermark
- Four clearly marked sponsor placeholders, two on each side on wide screens

## How it works

A seeded field blends color anchors, with optional coordinate warping for flow. A separate noise layer adds monochrome and chromatic grain. Canvas renders the final PNG at the requested size. This is an independent implementation; no commercial wallpaper assets or proprietary source code are included.

## Files

`renderer.js` handles rendering, `palettes.js` contains the presets, `i18n.js` provides translations, and `app.js` wires up the interface. Styles are in `style.css`.

## Hosting and contributions

Serve `dist/` with any static host. No environment variables, API keys, or backend are required. Keep English and Chinese translation keys in sync. Respect reduced-motion preferences and avoid introducing image uploads or tracking without an explicit product decision.

## License

MIT, copyright 2026 Lewis. See LICENSE. Generated wallpapers do not require attribution.
