# Cyklos — frontend

> Ask a question. Get an answer calculated from your birth chart.

React + TypeScript + Vite + Tailwind v4. This repository currently holds the
**design foundation**: tokens, the component system, routing, the data layer
and page stubs. Product screens are the next step.

Open `/foundation` in the running app to see every token and component on one
page.

## Getting started

```bash
npm install && npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Typecheck, then production build |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build |

## Structure

```
src/
  components/
    common/       Button, Card, Tabs, DataTable, states…
    navigation/   TopNav, BottomNav, MobileHeader
    charts/       ChartWheel, ChartDiamond
    astrology/    PlanetRow, HouseCard, GrahaGlyph, DegreeValue
    readings/     ReadingCard, QuestionCard, AnswerBlock
    forms/        Field, Input, Select
    modals/       Overlay, Modal
    sheets/       BottomSheet
    brand/        Logo, LogoMark, Wordmark
  data/           Mock JSON, shaped exactly like the future API
  services/       The API seam — swap mocks for fetch here, nowhere else
  hooks/          useAsync, useMediaQuery, useDisclosure, useFocusTrap…
  layouts/        AppLayout, AuthLayout, PageContainer
  pages/          One folder per product area
  routes/         paths.ts, navigation.tsx, the route table
  styles/         tokens.css (source of truth), base.css, tokens.ts
  types/          Domain types — astrology, readings, user, ui
  utils/          cn, format, astro (the display vocabulary)
```

## Connecting the real API

Every screen reads data through `src/services/*.service.ts`, which return typed
promises. To go live:

1. Set `VITE_API_BASE_URL` and `VITE_USE_MOCKS=false`.
2. In each service, replace `mockRequest(...)` with `request(...)` — the real
   `fetch` wrapper is already written in `src/services/client.ts`, complete with
   error normalisation.

No component, hook or page changes: they only ever see the promise.

## Design tokens

`src/styles/tokens.css` is the single source of truth. Tailwind v4 reads its
`@theme` block and generates the utilities (`--color-navy` → `bg-navy`,
`--radius-control` → `rounded-control`, `--text-title` → `text-title`).

`src/styles/tokens.ts` mirrors a subset in JS, because SVG attributes and
Recharts props cannot take a class.

When you add a custom scale token (a size, radius, shadow or height), also
declare it in `src/utils/cn.ts` — `tailwind-merge` needs to know about it, or
it will mistake `text-title` for a colour and drop the colour beside it.

## Brand

The original lockup is at `public/brand/cyklos-lockup.png`. The app draws the
mark as SVG (`components/brand/Logo.tsx`) so it scales and takes colour from
its surface.

## Reference

Built against *Cyklos Flows v2* (43 artboards, flows A–G) and the competitor
feature matrix. Each page stub names the artboards it will be built from.
