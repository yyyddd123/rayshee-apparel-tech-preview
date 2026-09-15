RAYSHEE LOCAL WEB PREVIEW

Open:
Double-click start-rayshee.cmd

Or open this file directly in Chrome / Edge:
site/index.html

Included:
- Complete responsive local website.
- 29 HTML pages.
- Local CSS, JavaScript, fonts and placeholder images.
- Sample cart saved in the local browser.
- Inquiry and catalog form success previews.
- No WordPress, PHP, database or internet connection required.

Editing:
- Page content: scripts/content/*.mjs
- Global styles: site/assets/css/styles-v3.css
- Global interactions: site/assets/js/site.js
- Images: site/assets/images/editorial/

After editing source content, run:
npm.cmd run build
npm.cmd run check

Preview with a local server:
npm.cmd run preview
Then open http://localhost:4173

Production note:
This is a local front-end preview. Live email, payment and WordPress administration require later server integration.