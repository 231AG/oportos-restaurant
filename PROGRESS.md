# OPORTOS — Build Progress

Living checkpoint file. Updated after every meaningful chunk of work so the build can
resume from a cold start (see spec §0.2).

## Current status

**Step:** 1 — Inspect & initialize (done) → 2 — Design tokens & brand system (in progress)

**Next action:** Write design tokens in `app/globals.css`, root layout, and the shared
brand primitives (Grain, Reveal, MagneticButton), then build the hero.

## Environment findings (step 1)

- Empty repo on branch `claude/oportos-restaurant-website-s1lxc1`. Node v22, npm 10.
- Scaffolded with `create-next-app` → Next 16.3.4, React 19.2, TypeScript, Tailwind **v4**
  (CSS-first `@theme`, no `tailwind.config.js`), ESLint flat config, App Router, no `src/`.
- Installed: `three@0.185`, `@react-three/fiber@9`, `@react-three/drei@10`,
  `framer-motion@13`, `gsap@3.15`, `lenis@1.3`, `@types/three`, `playwright` (dev).
- Fonts: **self-hosted via `@fontsource`** (`anton`, `instrument-serif`, `inter`) instead of
  `next/font/google`, so the build never depends on network egress.

### Tooling for visual verification (spec §0.1)

- No browser-automation MCP server is installed in this environment and none can be added
  from here, **but** Chromium is pre-installed at `/opt/pw-browsers/chromium` and the
  `playwright` npm package installs fine. → Visual verification is done with a local
  Playwright driver script (`scripts/shoot.mjs`) that boots the dev/prod server, drives the
  page (scroll, pointer move, viewport resize, clicks) and writes PNGs to `/screenshots`.
  Headless Chromium runs WebGL through SwiftShader (`--use-angle=swiftshader
  --enable-unsafe-swiftshader`), so the real 3D scene is captured, not a blank canvas.
- `SearchSkills` returns **no** Three.js/WebGL skill and **no** design-taste/critique skill
  for this account, so there is nothing to install. Fallback per §0.1: my own judgment plus
  a written design rationale, and an explicit self-run design review in step 10.

### Asset constraints (decided autonomously, spec §0.3)

Outbound network is restricted to the npm registry: `images.unsplash.com`,
`images.pexels.com` and `upload.wikimedia.org` all return `403 connect_rejected`, and the
Unsplash MCP server rejects calls ("email address has not been confirmed"). There is
therefore **no way to source food photography or a ready-made GLB food model.**

Decision: **every visual in the site is generated in-repo.**

- Hero + dish visuals are **procedural Three.js geometry** with custom-patched physical
  materials (fbm char/sear shader, grill-mark stripes, glaze clearcoat) — no GLB download,
  no texture files, ~0 KB of binary assets.
- The no-WebGL / low-end fallback is a **procedural SVG+CSS "plate" illustration** per dish
  (layered radial gradients, duotone, grain, parallax) rather than a photo.
- This is treated as a stronger outcome than the §4 image fallback: the site keeps a real 3D
  hero and real 3D dish portraits under the stated constraint.

## Step log

- [x] 1. Inspect repo, initialize Next.js + deps, confirm tooling/asset constraints.
- [ ] 2. Design tokens & brand system.
- [ ] 3. Hero.
- [ ] 4. Core 3D interaction (+ screenshots).
- [ ] 5. Scroll storytelling (+ screenshots at depths).
- [ ] 6. Signature dishes & menu (+ screenshots).
- [ ] 7. WhatsApp ordering.
- [ ] 8. Responsive behaviour (+ mobile screenshots).
- [ ] 9. Performance.
- [ ] 10. Test, design review, polish.

## Usage-limit interruptions

None so far.
