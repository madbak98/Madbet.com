# Responsive QA checklist — MADBAK HOUSE / MADBET

Manual verification at these viewport widths (browser devtools):

| Width | Device target |
|------|----------------|
| 390px | iPhone |
| 430px | iPhone Pro Max |
| 768px | iPad portrait |
| 1024px | iPad landscape |
| 1440px | Desktop |

## Shell

- [ ] No horizontal page scroll; `overflow-x` contained.
- [ ] Bottom nav (≤1023px): Home, Casino, Sports, Wallet, Menu — tap navigates; active state sensible in games.
- [ ] Hamburger / Menu opens drawer; scroll full nav; close via X or backdrop.
- [ ] Sidebar visible ≥1024px; narrower rail at `xl`/`2xl` breakpoints.
- [ ] Top nav: search icon opens full-screen search; desktop shows inline field.
- [ ] Wallet / Join / Login usable; no overlap with notch (safe-area).

## Auth modal

- [ ] Near full viewport height on phone; rounded top only; scroll reaches Google + signup fields + checkboxes.
- [ ] Close control reachable (top-right).

## Home hero

- [ ] Title scales (`clamp`); neon watermark fits; reduced glow on small screens (performance).

## Search

- [ ] Mobile overlay closes on result tap and X; body scroll locks while open.

## Sportsbook

- [ ] Tabs scroll horizontally; slip drawer / panel works; match cards stack.

## Roulette

- [ ] Order: wheel → controls → betting table → recent (phone).
- [ ] Betting grid scrolls inside horizontal strip only.

## Games (general)

- [ ] Bet inputs and primary actions ≥48px touch targets where updated.
- [ ] No canvas wider than viewport.

## Support form

- [ ] Single column on narrow screens; inputs full width.
