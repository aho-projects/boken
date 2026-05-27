# 📋 Installing the Boken embeds on kasserommet.no

You need to paste 10 iframes across 8 WordPress pages. The iframes pull from your Vercel deployment at **https://boken-kappa.vercel.app** — keep that live and they keep working.

## How to add an iframe to a WP page

For every WP page that needs an iframe:

1. Open the page in WordPress editor (Pages → click the page → Edit)
2. Decide where on the page the embed should appear
3. Click **+** to add a block → search **"Custom HTML"** → click it
4. Paste the iframe code (from the matching section below)
5. Click **Save / Update** (top right)
6. View the page (incognito tab is best to avoid editor caching) → the iframe should load and auto-size

**Once per page** — add this resize listener too, anywhere in the page (it makes iframes grow to fit their content automatically):

```html
<script>
(function () {
  var BOKEN_HOST = 'https://boken-kappa.vercel.app';
  window.addEventListener('message', function (e) {
    if (!e || !e.data || e.data.type !== 'boken-resize') return;
    document.querySelectorAll('iframe[src^="' + BOKEN_HOST + '"]').forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = (e.data.height + 4) + 'px';
    });
  });
})();
</script>
```

You can paste it inside the same Custom HTML block as the iframe, or in its own block. One per page is enough.

---

## 📄 The 8 pages and what goes on each

### 1️⃣ `/08-gruppe` (main page) — 2 iframes

**A. Feedback form** — paste at the bottom of the page:

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/feedback"
  title="Tilbakemelding fra lærer"
  style="width:100%; min-height:900px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

**B. Examples gallery (full books)** — paste below the form:

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?mode=fullbooks"
  title="Eksempler fra lærere — fulle bøker"
  style="width:100%; min-height:560px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 2️⃣ `/08-gruppe/naturfag-ute` — 2 iframes

**A. Naturfag-kart** — paste below "læringsmål":

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/naturfag-map"
  title="Kart over nærmiljø"
  style="width:100%; min-height:760px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

**B. Examples filtered to Naturfag** — paste in the "Eksempler fra elever" section:

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=naturfag"
  title="Eksempler — Naturfag"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 3️⃣ `/08-gruppe/ut-og-titte` — 2 iframes

**A. Radius-kart + Skriv ut feltkort** — paste where it says "kart":

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/ut-og-titte"
  title="Radius-kart"
  style="width:100%; min-height:760px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

**B. Examples filtered to Ut og titte** — paste in the examples section:

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=ut-og-titte"
  title="Eksempler — Ut og titte"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 4️⃣ `/08-gruppe/sketchnoting` — 1 iframe

**Examples filtered to Sketchnoting:**

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=sketchnoting"
  title="Eksempler — Sketchnoting"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 5️⃣ `/08-gruppe/isberg` — 1 iframe

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=isberg"
  title="Eksempler — Isberg"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 6️⃣ `/08-gruppe/bytte-perspektiv` — 1 iframe

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=bytte-perspektiv"
  title="Eksempler — Bytte perspektiv"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 7️⃣ `/08-gruppe/hjemmelagde-kilden` — 1 iframe

```html
<iframe
  src="https://boken-kappa.vercel.app/embed/examples?opplegg=hjemmelagde-kilden"
  title="Eksempler — Den hjemmelagde kilden"
  style="width:100%; min-height:520px; border:0; background:transparent;"
  loading="lazy"
  scrolling="no"
></iframe>
```

---

### 8️⃣ `/08-gruppe/hvordan-lage-boka` — 0 iframes

This page is purely static content; no embeds needed.

---

## ⚙️ Testing checklist after pasting

For each iframe you paste:

- [ ] Open the WP page in **incognito mode** (so you see what visitors see)
- [ ] Scroll to where the iframe should be — confirm it loads
- [ ] If it shows up with the wrong height, the resize listener wasn't pasted on that page — add it
- [ ] Try interacting (click "Finn meg" on the map, type in a search, etc.)
- [ ] Upload form: try submitting once with a test image; check Supabase dashboard for the row

## 🐛 Troubleshooting

- **iframe is too short** → resize listener missing. Add the `<script>` block from the top of this doc.
- **iframe shows nothing** → check the URL — should start with `https://boken-kappa.vercel.app/embed/`. Hard refresh (Cmd+Shift+R).
- **Uploaded images don't appear in gallery** → make sure the user picked at least one opplegg checkbox when uploading. Otherwise they're saved but not tagged to any opplegg.
- **Map shows "401 Error"** → already fixed by switching to CARTO tiles. If it recurs, ping me.
- **Form submit gives "Supabase ikke konfigurert"** → environment variable wasn't picked up in production. Check Vercel dashboard.

## 🔁 Updating later

Every time we push new code to GitHub (`aho-projects/boken`), Vercel auto-deploys and **all WP pages instantly get the update** — no re-pasting needed. The iframes always pull the latest from boken-kappa.vercel.app.

You'll only need to re-paste if you want to ADD or MOVE an iframe.
