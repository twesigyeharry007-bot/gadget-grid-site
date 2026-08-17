# The Gadget Grid — Website

A custom storefront for The Gadget Grid: home page, shop with search/filters, cart, and a WhatsApp-based checkout. No build tools required — it's plain HTML/CSS/JS, so you can open it, host it, or hand it to any developer.

## What's inside

```
index.html        Home page (hero, featured products, about, contact)
shop.html          Full catalog with search + category filters
checkout.html       Cart summary + WhatsApp order handoff
css/style.css        All site styling
js/config.js          Business info + Google Sheet link (edit this first)
js/products.js         Product data loading + rendering
js/cart.js              Shopping cart logic (saved in the browser)
js/ui.js                  Nav menu + small UI wiring
assets/                     Logo and product photos
```

## 1. Try it locally

Because the site loads files with JavaScript, opening `index.html` directly by double-clicking may be blocked by your browser. Easiest way to preview it properly:

1. Install [Python](https://www.python.org) (most computers already have it) or Node.js.
2. Open a terminal in this folder and run:
   - Python: `python3 -m http.server 8000`
   - Node: `npx serve .`
3. Visit `http://localhost:8000` in your browser.

## 2. Managing products with a Google Sheet (no code needed)

You chose to manage your product catalog from a Google Sheet, so you can add, edit, or remove products anytime from your phone or computer — no developer needed.

### Step-by-step

1. Create a new Google Sheet.
2. In row 1, add these exact column headers (case doesn't matter, order doesn't matter):

   | id | name | category | price | oldPrice | image | description | stock | featured |
   |----|------|----------|-------|----------|-------|--------------|-------|----------|

   - **id** — a short unique code for the product, e.g. `camon-blue` (no spaces or quote marks)
   - **name** — product name shown on the site
   - **category** — e.g. `Phones`, `Accessories`, `Audio`, `Wearables` (used for the filter buttons)
   - **price** — number only, e.g. `799000` (no "UGX" or commas)
   - **oldPrice** — optional, only fill in if the item is on sale (shows a strikethrough price + "Sale" badge)
   - **image** — a direct link to the product photo (see below for how to get one), or leave blank to use a placeholder icon
   - **description** — a short one-line description
   - **stock** — `yes` or `no` (controls the "Out of Stock" badge and disables the Add button)
   - **featured** — `yes` or `no` (featured products appear on the home page)

3. Add one row per product.
4. Getting an image link for each product:
   - Upload the photo to **Google Drive**, right-click → Share → "Anyone with the link", then use this link format:
     `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID` (the file ID is the long code in the share link)
   - Or upload to a free image host like [imgbb.com](https://imgbb.com) or [postimages.org](https://postimages.org) and copy the "direct link".
5. Publish the sheet: **File → Share → Publish to web**. Choose the correct sheet tab, set the format to **Comma-separated values (.csv)**, and click **Publish**. Copy the link it gives you.
6. Open `js/config.js` in this folder and paste the link into `sheetCsvUrl`:

   ```js
   sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/PASTE-YOUR-LINK-HERE/pub?output=csv"
   ```

7. Save, re-upload the site (or refresh if already hosted), and your products will load live from the sheet.

If `sheetCsvUrl` is left blank, the site automatically falls back to the sample products already built into `js/products.js` — the two Tecno Camon phones (with placeholder prices you should update) plus a few sample accessories to show off the layout. **Replace or remove the sample accessory items once you have real products in your sheet.**

## 3. Payments & checkout (current setup)

Right now the site does **not** process online payments. Customers browse, add items to their cart, and "Send Order via WhatsApp" opens a pre-filled WhatsApp message to **0794 776 220** with the full order (items, quantities, total, customer name/phone, pickup or delivery). You confirm the order and payment method directly with the customer.

When you're ready to accept real online payments (Mobile Money, cards), a gateway like Flutterwave or Pesapal can be added to `checkout.html` — this needs a merchant account with that provider first.

## 4. Editing business info

All contact details live in `js/config.js`:

```js
address: "GNS Plaza, Old Kampala, Kampala, Uganda",
phone: "0794776220",
whatsapp: "256794776220",   // international format for WhatsApp links
tiktok: "https://www.tiktok.com/@thegadget.grid",
```

Update these in one place and they apply across the whole site.

## 5. Deploying the site (free hosting)

The easiest free option is **Netlify**:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole site folder onto the page.
3. Netlify gives you a live link immediately (you can add a custom domain later in Netlify's settings).

Alternatives: GitHub Pages, Vercel, or any regular web hosting that serves static files.

## 6. Notes on the sample content

- The two Tecno Camon product photos and prices are placeholders — please confirm the exact model name/specs and set the real price before going live.
- Accessory products (earbuds, power bank, charger, etc.) are sample placeholders to show the layout — replace with your real inventory via the Google Sheet.
- The logo used on the site was extracted from your uploaded logo file with the background removed.
