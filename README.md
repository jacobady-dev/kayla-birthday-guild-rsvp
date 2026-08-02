# Kayla's Guild RSVP Prototype

A lightweight, GitHub Pages-ready fantasy RSVP demo.

## Included

- Animated 3D D20 built with Three.js
- Initiative flavor messages, including natural 1 and natural 20 responses
- Stone tablet and glowing rune presentation
- Parchment contract section
- Attendance-only guild ledger form
- Wax seal confirmation animation
- Responsive mobile layout
- Reduced-motion support

## Publish with GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the `main` branch and `/root` folder.
4. Save.

The site will be available at:

`https://jacobady-dev.github.io/kayla-birthday-guild-rsvp/`

## Important RSVP note

This prototype stores the answer only in the visitor's browser using `localStorage`. It does **not** send the RSVP to the host yet.

The finished form can later connect to Google Sheets, Formspree, Supabase, Firebase, or another lightweight submission service without changing the visual experience.
