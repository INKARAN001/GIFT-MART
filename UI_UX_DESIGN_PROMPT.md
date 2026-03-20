# UI/UX Design Prompt — GIFT MART (with 3D Animation & Transitions)

Use this prompt with a designer, design tool, or AI to generate UI/UX concepts and implementation guidance for the GIFT MART e-commerce web app, including 3D-style animations and transitions.

---

## Project overview

**GIFT MART** is a premium gift e-commerce web app (React + Vite). It sells: **Flash Cards**, **Bouquets**, **Frames**, and **Gift Boxes**. The app has a **splash screen**, **home** (hero video + category grid), **product listing** (search, filters, grid, pagination), **product detail**, **product modal**, **login**, **profile**, **reset password**, and an **admin panel**. Design a cohesive, modern UI/UX system with **3D-style animation and transitions** that feel premium and gift-focused.

---

## Design direction

- **Tone:** Premium, thoughtful, gift-giving — not generic “AI slop.” Avoid overused fonts (e.g. Inter/Comfortaa everywhere). Prefer a distinctive typeface and a clear visual identity.
- **Color:** Support the existing dark footer/nav feel (#1a252f, #ecf0f1). Propose a full palette (primary, secondary, accent, neutrals, success/error) that works in light and dark contexts. Consider warm, gift-friendly accents (gold, soft coral, deep green, or a restrained palette).
- **Layout:** Clean, spacious, mobile-first. Clear hierarchy: hero → categories → products → footer. Consistent spacing scale and grid (e.g. 8px base).
- **Components:** Define styles for: buttons (primary, secondary, ghost), inputs, cards, modals, nav, footer, product cards, filters, pagination, empty states, loading states. Ensure touch targets ≥ 44px and accessibility (contrast, focus states).

---

## 3D animation & transitions (required)

Design and specify **3D-feel** animations and transitions for the following. Describe behavior, duration, easing, and (where relevant) axis/transform so developers can implement with CSS `transform`, `perspective`, and/or a library like Framer Motion or React Spring.

1. **Page / route transitions**  
   When navigating between routes (e.g. Home → Products → Product Detail): use a subtle 3D effect — e.g. incoming page slides in with a slight **perspective** and **rotateY** (or **translateZ**), while the outgoing page does the reverse. Keep duration short (250–400 ms), easing smooth (e.g. cubic-bezier). Avoid blocking content; consider shared-element or crossfade where it makes sense.

2. **Product cards (grid & category tiles)**  
   On **hover**: slight **lift** (translateY), **scale** (e.g. 1.02–1.05), and soft **box-shadow** increase. Optional: very subtle **rotateX** so the card tilts toward the user. On **tap/click**: same lift can be reduced for touch (or replaced with a scale-down then navigate). Stagger card entrance on page load (e.g. 50–80 ms delay per card) with a small **translateY + opacity** or **translateZ** for a 3D stack-in effect.

3. **Product modal / quick view**  
   When opening: modal content scales up from center with **perspective** (e.g. 1000px) and slight **rotateX** so it feels like it “pops” out of the screen. Backdrop fades in. When closing: reverse (scale down + rotate back, then fade backdrop). Duration ~300 ms.

4. **Splash screen**  
   The app already has a splash with typewriter and progress bar. Propose a **3D-style** refinement: e.g. logo or title with a gentle **rotateY** or **translateZ** reveal, or a “curtain” that rotates away (rotateY on a wrapper) to reveal the first route. Keep total splash time under ~4–5 seconds and ensure it doesn’t feel heavy.

5. **Navigation (navbar)**  
   Nav items: on hover/focus, subtle **translateY** or **scale** and color transition. Optional: dropdown or mega-menu with a slight **perspective + translateY** entrance. Mobile menu: full-screen or slide-in panel with **translateX** and optional **rotateY** on the content for a “door” effect. Specify open/close duration and easing.

6. **Buttons & CTAs**  
   Primary CTAs: on hover, slight **scale(1.02–1.05)** and maybe **translateY(-1px)** with stronger shadow. On press: **scale(0.98)**. Optional: subtle **rotateX** on hover for a “tilt toward user” feel. Keep feedback quick (< 150 ms) so it feels responsive.

7. **Hero section (home)**  
   The hero uses a video background. Propose an overlay or title treatment that uses **translateZ** or **rotateY** so text or key elements feel layered in 3D. Optional: parallax on scroll (subtle translateZ or scale) for depth. Don’t obscure the video; keep it performant.

8. **Category blocks (Gift Categories)**  
   Each category tile (Flash Cards, Bouquets, Frames, Gift Boxes): on hover, **lift + scale** and optional **rotateY** (e.g. ±5°). On load: stagger entrance with **translateY + opacity** or **translateZ** from a common perspective. Ensure images don’t distort (use `transform-origin: center`).

9. **Filters & panels**  
   Filter panel (sidebar or drawer): when opening, slide in with **translateX** and optional **perspective + rotateY** so it feels like a panel coming from the side. When closing, reverse. List items inside can have a short stagger on open.

10. **Loading & skeleton states**  
    Use a consistent skeleton (e.g. for product grid). Optional: subtle **pulse** or a very slight **scale/opacity** wave so the UI feels alive. For full-page or section loading, a minimal 3D-style loader (e.g. rotating box or card with **rotateX/rotateY**) that matches the brand.

---

## Deliverables to specify

- **Style guide:** Colors, type scale, spacing, radii, shadows.
- **Component specs:** Key components with states (default, hover, focus, active, disabled) and any 3D/transition notes.
- **Animation spec:** Table or list: screen/element, trigger, animation (transform + opacity/duration/easing), and any perspective or stagger values.
- **Responsive behavior:** How 3D effects simplify or turn off on small screens (e.g. reduce rotateY, keep only translateY + scale) to preserve performance and usability.
- **Accessibility:** Prefer `prefers-reduced-motion: reduce` — specify fallback (e.g. instant or simple fade, no 3D) for all above animations.

---

## Technical context (for implementation)

- **Stack:** React 18, Vite, React Router. No animation library in package.json yet; recommend one (e.g. Framer Motion, React Spring) and note where CSS-only is enough.
- **Existing:** Splash (typewriter + progress bar), hero video, dark footer (#1a252f), Navbar, product grid with filters/search/pagination, product modal, admin panel (separate layout).
- **Goals:** Implement the above 3D transitions without hurting performance (use `will-change` and `transform` sparingly, avoid layout thrashing). Prefer GPU-friendly properties: `transform`, `opacity`; avoid animating `width`/`height` where possible.

---

## One-line summary for quick briefs

**“Design a premium, distinctive UI/UX system for GIFT MART (gift e-commerce: categories, product grid, detail, modal, auth, admin) with a full style guide and 3D-style animations: page transitions, card hover/entrance, modal pop, splash reveal, nav and CTA micro-interactions, hero/category depth, and filter panel — with reduced-motion fallbacks and responsive simplification.”**
