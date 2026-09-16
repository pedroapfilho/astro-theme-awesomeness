# Shared React components

`src/components/button.tsx` follows shadcn Base Nova. It exports `Button` and `buttonVariants` together; the existing public `astro-awesomeness/components` entry remains available. Product behavior such as the theme toggle belongs in `src/compositions`. Astro templates remain in `src/astro` and layouts in `src/layouts`, with React optional for static consumers.

The shared stylesheet imports `shadcn/tailwind.css`. Consumer brand overrides remain supported. Strict design rules stay enabled; exact named radius, font-size, and hover-color tokens replace arbitrary registry values. The source lock pins the reviewed upstream revision and CSS contract; `pnpm check:shadcn` checks it in CI. Review upstream updates and verify lint, tests, types, and builds before refreshing the lock.
