# plotter in the shop

Clickable prototype of the second plotter variant for the M241/M245 user tests and the "Höhle der Löwen" pitch: a machine in a shop that writes your card with a real pen while you watch. People use it either on the machine's touch screen or on their own phone after scanning a QR code. Nothing is ordered, sent or charged.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5174 (the web shop prototype uses 5173, so both can run side by side).

## What you can click through

- **Machine screen:** start screen with a card being written → choose a card (greeting card, postcard, letter) → occasion → message with an on-screen Swiss keyboard → style → check & pay → watch the pen write → take the card from the tray.
- **Your own handwriting:** write each letter once on the writing pad (just the letters in your card, or the whole alphabet). The card is then written with your letters. Skipped letters fall back to the Jamie style.
- **Little drawing:** pick one of 12 line drawings, or draw your own with a finger or stylus.
- **Address and stamp:** the address is written on the envelope (or on the postcard) by the same pen, and an A-Post stamp can be added.
- **Paying:** by card, TWINT or at the counter. All of it is simulated, and the card reader under the screen lights up.
- **Phone (QR code):** the same steps on a phone. It ends with a 4-digit pickup code, which you type in at the machine under "I have a pickup code".
- **Machine details:** "Are you still there?" after 90 seconds without a tap, automatic reset after the last screen, help pop-up and language buttons (only English works).

The bar at the top switches between **Machine screen** and **Phone**, hides the machine outline (for a real touch screen) and goes full screen. `?view=phone` opens the phone version directly.

**Hand-off without a server:** the phone saves the card in the browser's storage under its pickup code. The machine finds it when both views run in the same browser (two tabs work too). On another device, the machine offers "load an example phone order" instead.

## Prices

| | CHF |
|---|---|
| Greeting card (A6 folded, with envelope) | 4.90 |
| Postcard (A6) | 2.90 |
| Letter (A5, with envelope) | 3.90 |
| Own handwriting, per card | + 0.50 |
| Address written on the envelope or card | + 0.50 |
| A-Post stamp | + 1.20 |

The material, ink and machine costs come from the web shop's cost calculation (`plotter-web-shop/PRICING.md`). In-store prices are higher because they include the card and envelope and the shop's share, and the card is written while you wait. The shop's share is an assumption and still needs to be checked.

## Stack

React 18, TypeScript and Vite. QR codes are drawn with [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT). Colours and handwriting fonts are the same as in the web shop.

```
src/
  frames/       the machine (scaled 1280 × 800 touch screen), the phone outline, screen switching, idle timer
  screens/      one file per step (Welcome, ChooseCard, Occasion, Message, Style, Handwriting, Review, Writing, Done, Sent)
  components/   card renderer, on-screen keyboard, writing pad, QR code, pop-up, toast, top and bottom bars
  lib/          text layout and writing order, pen strokes, pricing, phone hand-off, typing helpers
  state/        all order state in one reducer
  data/         cards, occasions with message ideas, handwriting styles, inks, examples
```

Cards are drawn as SVG in millimetres. The same layout drives the preview, the writing animation and the writing-time estimate.

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: type-check and build to `dist/`
- `npm run typecheck`: type-check only

`.github/workflows/deploy.yml` publishes the site to GitHub Pages on every push to `master`, once the repo has a GitHub remote and Pages is set to **GitHub Actions**.
