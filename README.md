# Valentine App - React + TypeScript

A private Valentine's web app with a vault lock screen, built with React, TypeScript, Vite, and Tailwind CSS.

## Shareable link for your love

To send **one link** that only your partner opens (WhatsApp, text, etc.):

1. **Deploy the app** so it’s live on the internet.
2. You get a URL like `https://your-app.vercel.app` or `https://your-app.netlify.app`.
3. **Send that link only to your partner.** They open it, enter the code (2510), and see the full experience. No one else needs the link.

### Easiest: Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. Click **Add New** → **Project**.
3. Import your repo: **pranav006/gift** (or your GitHub username / repo name).
4. Click **Deploy**. No settings to change.
5. In ~1 minute you get a URL, e.g. `https://gift-xxx.vercel.app`.
6. Copy that URL and send it to your partner (WhatsApp, iMessage, etc.). Only they open it — that’s your “shareable link for your love alone.”

### Alternative: Netlify (free)

1. Go to [netlify.com](https://netlify.com) → **Sign up** with GitHub.
2. **Add new site** → **Import from Git** → choose **pranav006/gift**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. **Deploy**. You get a URL like `https://random-name.netlify.app`.
5. Send that link only to your partner.

---

## Features

- **Lock screen** with password-protected vault (key: `2510`)
- **Revealed content** with "Will you be mine?", suggestions, cinematic memories, gift wish
- **Heart burst** and mailto/Formspree for her wish

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Recording her gift wish (view her response)

The app sends her gift wish to **Formspree** so you can view it without her choosing email/WhatsApp.

1. Go to [formspree.io](https://formspree.io) and sign up (use your email, e.g. pranavsanalk13@gmail.com).
2. Click **New form** → name it (e.g. "Valentine gift wish") → Create.
3. Copy your form endpoint, e.g. `https://formspree.io/f/xyzabcde`.
4. In `src/App.tsx`, set:
   ```ts
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyzabcde'  // your form ID
   ```
5. When she submits her wish, Formspree **emails you** that submission and you can also see all submissions in your Formspree dashboard under that form. No copy/email buttons needed — it’s recorded automatically.
