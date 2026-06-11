# Agent Instructions for Admin Dashboard

## Purpose

This file helps AI coding agents work productively in this repository.

## Key project facts

- Framework: React 19 + Vite 8
- Language: TypeScript 6, strict mode
- Styling: Tailwind CSS 4 via `@tailwindcss/vite`
- Routing: TanStack Router with generated route tree (`src/routeTree.gen.ts`)
- UI system: shadcn/ui primitives, Radix UI, Lucide icons, Sonner toasts
- Form handling: TanStack React Form
- Data layer: `src/lib/` contains client-side mock services and in-memory helpers
- Localization: `react-i18next` plus `src/locales/{en,de,nl}`

## Important files

- `src/main.tsx` — app entry point
- `src/routeTree.gen.ts` — generated route tree used by router
- `src/routes/` — route modules and layouts
- `src/components/` — UI components, form components, app shell
- `src/lib/` — mock data services, API client, auth client
- `tsconfig.json` — path aliases `#/*` and `@/*`
- `vite.config.ts` — plugin setup for Tailwind and TanStack Router
- `eslint.config.js` — ESLint uses `@tanstack/eslint-config`
- `.PROJECT_ANALYSIS.md` — repo summary with stack and architecture notes

## Repository conventions

- Use the existing component structure under `src/components/` rather than adding unrelated UI components in route files.
- Keep routes in `src/routes/`; route file naming follows TanStack Router conventions.
- Prefer `#/*` or `@/*` path aliases for imports, not long relative paths.
- Use Tailwind utility classes and the `cn()` helper from `src/lib/utils.ts`.
- All code is ESM; preserve `type: "module"` and `import` syntax.
- Use existing UI primitives in `src/components/ui/` when possible.
- Keep formatting consistent with `prettier.config.js`:
    - `semi: false`
    - `singleQuote: true`
    - `trailingComma: 'all'`
    - `tabWidth: 4`
    - `printWidth: 140`

## Scripts

- `npm ci` — install dependencies
- `npm run dev` — start local development server
- `npm run build` — production build
- `npm run preview` — preview build locally
- `npm run lint` — run ESLint
- `npm run format` — run Prettier and ESLint fix
- `npm run check` — run Prettier check

## How to help

- When changing UI, prefer updating or reusing `src/components/ui/*` and `src/components/form/*`
- When changing routes, update `src/routes/*` and preserve `routeTree.gen.ts` generation behavior
- When adding data logic, follow the existing `src/lib/*` mock-service pattern
- If a feature touches localization, add keys to all `src/locales/*/translation.json` files

## Notes for future instructions

- There is no dedicated backend code in this repo.
- If you need more detailed behavior rules for design system usage or route generation, ask to add a focused customization file.
