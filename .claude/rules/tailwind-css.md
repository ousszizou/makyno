# Tailwind CSS v4 Unified Rules

**Prefix:** **TW-**

These rules define how Tailwind CSS v4 must be used in **mhwar**. They combine **technical v4-specific practices** with **accessibility, RTL, and UX standards**.

The goal: **accessible, responsive, performant, inclusive UI that works perfectly in LTR & RTL from day one**.

---

## 1. Core Tailwind v4 Configuration (MUST)

### 1.1 CSS-first configuration

* Use **CSS-first configuration** with the `@theme` directive
* Avoid JavaScript config unless strictly necessary

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --breakpoint-3xl: 1920px;
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

### 1.2 Legacy config support (ONLY if needed)

```css
@import "tailwindcss";
@config "../../tailwind.config.js";
```

### 1.3 Import syntax

* ✅ **Always** use:

```css
@import "tailwindcss";
```

* ❌ Never use:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4 Official package names (MUST)

* PostCSS: `@tailwindcss/postcss`
* CLI: `@tailwindcss/cli`
* Vite: `@tailwindcss/vite`

---

## 2. Design Tokens & Theme Rules (MUST)

### 2.1 CSS variables only

All design tokens **must be CSS variables**.

```css
.custom-element {
  background-color: var(--color-blue-500);
  font-family: var(--font-sans);
}
```

### 2.2 Allowed namespaces

* `--color-*`
* `--font-*`
* `--text-*`
* `--font-weight-*`
* `--spacing-*`
* `--radius-*`
* `--shadow-*`

### 2.3 Overriding rules

```css
@theme {
  --font-*: initial; /* reset font system */
  --*: initial;      /* reset entire theme */
}
```

---

## 3. Accessibility & Semantics (MUST)

* **TW-1** Use semantic HTML as the foundation
* **TW-2** Minimum contrast ratios

  * 4.5:1 normal text
  * 3:1 large text
* **TW-9** Keyboard accessibility is mandatory

```html
focus-visible:ring-2 focus-visible:ring-offset-2
```

* Logical tab order
* No keyboard traps

### Forms

* Labels with `htmlFor` + `id`
* `aria-invalid`, `aria-errormessage`
* `valid:` / `invalid:` variants
* `sr-only` instructions for screen readers

---

## 4. Dark Mode & User Preferences (MUST)

### 4.1 Dark mode

* Must support `dark:` variants
* Must respect `prefers-color-scheme`

```css
@variant dark (&:where(.dark, .dark *));
```

### 4.2 User preferences

* `motion-safe:` / `motion-reduce:`
* `prefers-reduced-data:`
* `forced-colors:` / `contrast-more:`

---

## 5. Mobile‑First & Layout Rules (MUST)

### 5.1 Breakpoints

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

* Always mobile-first
* Use `clamp()` for fluid typography

### 5.2 Class ordering (TW‑13)

Order classes as:

> layout → spacing → typography → color → effects

* Multi-line formatting required for >8 classes

---

## 6. RTL & Logical Properties (MUST)

### Core RTL rules

* **TW-5** Use logical properties only
* **TW-6** Every layout must work with `dir="rtl"`
* **TW-7** Use start/end utilities

Examples:

* `text-start` ❌ `text-left`
* `ms-4` ❌ `ml-4`
* `border-e` ❌ `border-r`

⚠️ Every component **must be tested** with RTL before merging.

---

## 7. Container Queries (SHOULD)

```html
<div class="@container">
  <div class="@sm:text-lg @md:text-xl @lg:text-2xl">
    Responsive to container
  </div>
</div>
```

### Ranges

```html
<div class="@min-md:@max-xl:hidden">
  Conditional visibility
</div>
```

---

## 8. Motion, Loading & Feedback (SHOULD)

* **TW‑11** Use `animate-pulse` for skeletons
* Animations must respect reduced motion

---

## 9. Advanced Tailwind v4 Features (OPTIONAL)

### 9.1 3D transforms

```html
<div class="transform-3d rotate-x-12 rotate-y-6 translate-z-4 perspective-distant"></div>
```

### 9.2 Gradients

```html
<div class="bg-linear-45 from-blue-500 to-purple-500"></div>
<div class="bg-linear-to-r/oklch from-blue-500 to-red-500"></div>
<div class="bg-conic from-red-500 via-yellow-500 to-green-500"></div>
```

### 9.3 Variants

```html
<div class="group">
  <span class="opacity-0 group-has-data-active:group-hover:opacity-100"></span>
</div>
```

---

## 10. Custom Extensions

### Utilities

```css
@utility tab-4 {
  tab-size: 4;
}
```

### Variants

```css
@variant pointer-coarse (@media (pointer: coarse));
```

### Plugins

```css
@plugin "@tailwindcss/typography";
```

---

## 11. Breaking Changes (MUST KNOW)

### CSS variables in arbitrary values

```html
bg-(--brand-color)
```

### Renamed utilities

```text
shadow-xs  rounded-xs  blur-xs
```

---

## 12. Prefixing (OPTIONAL)

```css
@import "tailwindcss" prefix(tw);
```

---

## 13. Final 6‑Second Checklist (TW‑14)

Before shipping any UI:

1. Looks correct below 640px
2. Works in dark mode
3. Perfect in RTL
4. Focus clearly visible
5. Form errors announced
6. Reduced motion feels smooth

---

## Example: RTL‑Perfect Button Group

```tsx
<div dir="rtl" className="flex flex-col sm:flex-row gap-4 justify-end @container">
  <button className="px-6 py-3 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-safe:transition">
    إرسال
  </button>
  <button className="px-6 py-3 rounded-lg font-medium border border-border hover:bg-accent motion-safe:transition">
    إلغاء
  </button>
  <span className="sr-only">أزرار النموذج</span>
</div>
```
