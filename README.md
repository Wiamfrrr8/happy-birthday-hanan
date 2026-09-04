Phase A2: Upgraded animations and interactions

What I changed in this push (Phase A2)
- Replaced the homepage with a much stronger animated experience:
  - Cinematic, staggered headline with parallax and springy entrance
  - Multi-burst confetti choreography for Celebrate
  - Polaroid cards with tilt, spring entrance, and cinematic lightbox
  - Placeholder synthesized demo music (no external file) that plays on click
  - Vertical "Reels" demo section (auto-looping placeholders) to mimic TikTok-like feel
  - Lottie support (react-lottie-player) included for sticker effects
  - Guestbook still public and saved to localStorage (will wire Supabase next if you approve)
  - Download card (html2canvas) still included

Next steps I can take immediately (Phase B)
- Wire Supabase for persistent guestbook and image uploads (requires SUPABASE_URL & SUPABASE_ANON_KEY)
- Replace placeholder Lottie/visual assets with higher-quality torn-edge PNGs and sticker Lotties
- Add admin moderation page (optional)
- Deploy to Vercel and provide a live preview URL

How to preview locally
1) npm install
2) npm run dev
3) open http://localhost:3000

Tell me which Phase B items to run next (one-line):
- Wire Supabase now? (Yes / Wait)
- Deploy to Vercel after wiring? (Yes / No)
- Swap placeholders with custom assets now? (Yes / Later)
