# Collie HTML + JavaScript Template

## Getting Started

1. `npm install`
2. `npm run dev`

The dev script runs the Express dev server and a Collie watcher. Save any `.collie` file in the repo and the HTML partials auto-compile into `public/collie/dist`. The Collie HTML runtime (loaded in `public/index.html`) automatically injects the generated HTML into the matching `*-collie` placeholders.

### Additional Scripts

- `npm run collie:build` &mdash; one-off Collie compilation
- `npm run collie:watch` &mdash; rebuild on every `.collie` change
