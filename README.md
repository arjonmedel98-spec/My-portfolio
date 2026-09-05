# Arjon Medel — Portfolio Site

A static site (HTML/CSS/JS, no build step) ready to deploy on Netlify.

## Deploy to Netlify (2 minutes)

1. Unzip this folder if it isn't already.
2. Go to https://app.netlify.com/drop
3. Drag the whole folder (containing `index.html`, `styles.css`, `script.js`) onto the page.
4. Netlify gives you a live URL immediately. You can rename it under
   **Site settings → Change site name**.

The contact form uses **Netlify Forms** — it works automatically once deployed
on Netlify (no extra setup, no backend). Submissions will appear under
**Site → Forms** in your Netlify dashboard. If you want an email notification
for each submission, go to **Forms → Settings and usage → Add notification**.

## Things to double-check before you publish

- **"Cloudshare"**: you mentioned this tool in your request — I've listed it
  as-is under Tools & Platforms. Double-check the exact name/capitalization
  is right (search for "Cloudshare" in `index.html` if it needs a fix).
- **References**: your CV lists two references with personal phone numbers.
  I left those off the public site since posting someone else's phone number
  without asking them isn't a great idea — add a "references on request" line
  if you want to mention them at all.
- **More projects**: the work grid pulls real projects from your Behance
  profile. Add more by copying a `.work-card` block in `index.html` and
  pointing it at another gallery link + thumbnail image.
- **Phone number**: your phone number is shown in the Contact section.
  Remove that line in `index.html` if you'd rather keep it off a public page.

## File structure

```
index.html    – all page content and structure
styles.css    – design tokens (colors, type) + layout
script.js     – mobile nav, scroll-spy, project filter, AJAX contact form
```

No dependencies, no npm install — just static files.
