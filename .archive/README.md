# Archived original Pixel Puppets website

The original three-page minimal-typography site at pixelpuppets.co before the May 2026 CRT TV redesign took over the root URL.

## Why archived

Originally drafted as a Webflow handoff to Dan in June 2025; Ben built it himself in plain HTML/CSS instead. Lived at pixelpuppets.co from late 2025 through to 4 May 2026, when the CRT TV redesign (developed at `/tv`) was promoted to the root URL.

## What's here

- `index.html` — landing page with the LEDpixel logo wordmark hover animation
- `about.html` — About page
- `contact.html` — Contact page
- `style.css`, `styles.css` — both kept; the late iteration combined them but the original two-file split is preserved here
- `assets/` — images + the logo rollover animation JS
- `fonts/` — Euclid Circular B (body) + LEDpixel (logo) `.otf` files

## Why dotfile prefix?

`.archive/` is dotfile-prefixed so Netlify's deploy step auto-ignores it (Netlify skips files starting with `.` by default). The folder stays in the git repo (history preserved, files retrievable) but never ships to live.

## To restore

If you ever need this site live again, rename `.archive/` → `archive/` (or move the files back to root) and drop the matching redirect rules from `/_redirects`.
