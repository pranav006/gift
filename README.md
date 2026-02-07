# Valentine App - React + TypeScript

A private Valentine's web app with a vault lock screen, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Lock screen** with password-protected vault (key: `1402`)
- **Characters** (boy & girl) that move toward each other as you type
- **Frosted glass** UI with pastel hearts and stars
- **Revealed content** with "Will you be my Valentine?" and Yes/No buttons
- **Heart burst** animation on Yes
- **No button** teleports away from cursor/tap

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
