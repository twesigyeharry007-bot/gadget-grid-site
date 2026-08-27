/* ==========================================================================
   The Gadget Grid — Site Configuration
   Edit the values below to update business info, WhatsApp number, and
   (once ready) the Google Sheet that powers the live product catalog.
   ========================================================================== */

const SITE_CONFIG = {
  businessName: "The Gadget Grid",
  tagline: "Smarter Tech. Better Living.",
  address: "GNS Plaza, Old Kampala, Kampala, Uganda",
  phone: "0794776220",
  whatsapp: "256794776220", // international format, no + or leading 0, used for wa.me links
  tiktok: "https://www.tiktok.com/@thegadget.grid",
  tiktokHandle: "@thegadget.grid",
  currency: "UGX",

  // ------------------------------------------------------------------
  // GOOGLE SHEET PRODUCT CATALOG
  // ------------------------------------------------------------------
  // Leave this empty ("") to use the sample product catalog built into
  // js/products.js. Once you've set up your Google Sheet (see README.md
  // for the step-by-step guide), paste the published CSV link here and
  // the site will automatically load your live products instead.
  //
  // Example:
  // sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXX/pub?output=csv"
  //
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCpKSYlUEeWY_eXAfX8Ro4hxKni6I04bwRtj0kfRiwAi5MEAd-HcxhUhE5NG3gvKvkIFLeS5ejboIY/pub?gid=871292714&single=true&output=csv"
};
