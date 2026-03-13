# Project conventions

## Package manager: pnpm

This project uses **pnpm** as its package manager. Do NOT use npm or yarn.

- Install dependencies: `pnpm install`
- Add a package: `pnpm add <package>`
- Add a dev dependency: `pnpm add -D <package>`
- Remove a package: `pnpm remove <package>`
- Run scripts: `pnpm <script>` (e.g., `pnpm dev`, `pnpm build`, `pnpm start`)
- Never use `npm install`, `npm run`, or `yarn` commands.
- The lockfile is `pnpm-lock.yaml` — do not generate or modify `package-lock.json` or `yarn.lock`.
