# 1353 Sherwood Forest — Listing Website

A self-contained, static landing page for the MLS® X13310290 listing
(1353 Sherwood Forest Road, Bracebridge ON).

## Files
- `index.html` — the whole page (hero, highlights, gallery, rooms, details, location, contact)
- `styles.css` — design system (palette drawn from the listing photography)
- `script.js` — animations, gallery lightbox, ft/m unit toggle, mobile menu
- `images/` — web-optimized copies of the listing photos (EXIF metadata stripped)

## View it locally
Any static file server works, e.g.:

```
npx -y http-server "website" -p 4173
```

then open http://localhost:4173. (Opening `index.html` directly in a browser
also works.)

## Deploy
Drag the `website` folder into Netlify Drop (https://app.netlify.com/drop),
or point any static host (Netlify, Vercel, GitHub Pages, S3) at this folder.
No build step is required.

## Notes
- Room dimensions are stored once in metres (MLS source data) in `index.html`
  (`data-l` / `data-w` attributes); the ft⁄m toggle converts on the fly.
  Feet is the default.
- No seller personal information appears anywhere on the page.
- Contact points to NickChreptyk@gmail.com / 647-466-2382.
