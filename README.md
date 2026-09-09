# Sound Pixels

A microphone-reactive pixel visualizer built with TypeScript, Canvas, and the Web Audio API. Audio input drives color, movement, and beat-triggered glitches.

[Play online](https://cassiokiyoshi.github.io/sound-pixels/) · [Source](https://github.com/cassiokiyoshi/sound-pixels)

## Run locally

From this project directory, with Python 3 installed:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. A compiled `dist/app.js` is included, so you can try the visualizer without building it.

Click **Start microphone**, allow microphone access, and adjust **Sensitivity** to suit your input. Microphone access requires localhost or HTTPS; GitHub Pages provides HTTPS.

## Development

With Node.js and npm installed, run from this directory:

```sh
npm ci
npm run build
```

The build compiles `src/app.ts` to `dist/app.js`. Rebuild after editing TypeScript, then refresh the served page.

## Structure

- `src/app.ts`: microphone input, audio analysis, and canvas animation.
- `dist/app.js`: compiled browser script.
- `index.html` and `css/style.css`: interface and styling.
- `tsconfig.json`: TypeScript compiler configuration.

The project runs as a static site, including on GitHub Pages.
