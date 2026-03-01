# FixIt Lusaka MVP

FixIt Lusaka is a simple public directory for trusted skilled workers in Lusaka, Zambia.

## Non-Technical Overview
FixIt Lusaka helps customers quickly find local workers and contact them directly.

- Customers search for plumbers, electricians, carpenters, and welders.
- They filter by name, trade, area, or service type.
- They contact workers directly via WhatsApp or phone.
- Workers submit listing requests through a form.
- Submissions are reviewed by admin before being published.
- Approved workers are added manually to `workers.json`.

This keeps the platform fast, low-cost, and easy to maintain.

## Technical Overview
This project is a static frontend app with JSON-driven rendering.

### Files
- `index.html`: Main UI, sections, form, filters, and render containers.
- `workers.json`: Single source of truth for worker listings.
- `app.js`: Fetches `workers.json`, renders cards, and handles search/filter logic.

### Runtime Flow
1. Browser loads `index.html`.
2. `app.js` fetches `./workers.json`.
3. Workers are rendered into:
   - Featured section (`featured: true`)
   - All workers section (all records)
4. Search and filters update cards live without reload.
5. Listing form posts to Formspree.
6. Admin verifies submissions manually.
7. Admin adds approved workers to `workers.json` and redeploys.

## Tech Stack
- HTML5 (semantic structure)
- Tailwind CSS via CDN (styling)
- Vanilla JavaScript (logic)
- Formspree (form submission and email)
- Netlify static hosting (drag-and-drop deploy)

No React, no backend API, no database, no build tools.

## Why This Stack
- Fast to launch and iterate.
- Minimal hosting and maintenance cost.
- Easy deployment.
- Easy for non-backend collaborators.

### Tradeoffs
- No live admin dashboard.
- Changes require editing JSON and redeploying.
- Manual moderation workflow.

## Data Model (`workers.json`)
Each worker object includes:

- `id` (string)
- `name` (string)
- `trade` (`Plumber` | `Electrician` | `Carpenter` | `Welder`)
- `area` (string)
- `phone` (string, local format)
- `whatsapp` (string, international digits only)
- `services` (string)
- `rating` (number)
- `verified` (boolean)
- `featured` (boolean)
- `created_at` (string date)

## Manual Approval SOP
1. Check new submissions in Formspree email.
2. Verify worker identity by call/WhatsApp.
3. Add approved worker object into `workers.json`.
4. Keep `id` unique and fields complete.
5. Redeploy to Netlify.

## Form Behavior
- Form submission sends data to Formspree.
- Submission does **not** auto-add to `workers.json`.
- Publishing is manual via admin review.

## Local Development
Because the app fetches `workers.json`, run with a static server (recommended), for example:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deployment (Netlify)
1. Ensure updated files are saved:
   - `index.html`
   - `app.js`
   - `workers.json`
2. Drag and drop project folder to Netlify.
3. Site updates go live after deploy completes.

## Quick Collaborator Pitch
"FixIt Lusaka is a static, moderated local worker directory. Worker submissions come through Formspree. Admin verifies submissions, then approved listings are added to a JSON file which the frontend renders automatically."
