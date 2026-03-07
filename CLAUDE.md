# FullProduct.dev / GREEN Stack

This project was kickstarted with FullProduct.dev's universal app starterkit:

## Core conventions

- **Feature-first colocation**: Routes, resolvers, schemas, screens live together in `features/*/` or `packages/*/` workspaces instead of being split by frontend/backend.
- **Zod schemas as single source of truth**: Use `schema()` from `@green-stack/schemas`. APIs, types, db models and docs derive from these to stay in sync.
- **Workspace-defined routes**: Define routes in `features/*/routes/`. Run `npm run link:routes` to re-export to Expo/Next.
- **Universal UI**: Use `View`, `Text`, `Image` from `@app/ui` with Nativewind compatible `className` instead of HTML primitives.

## Detailed docs (reference when relevant)

- [Project structure](apps/docs/content/project-structure.mdx)
- [Routing](apps/docs/content/universal-routing.mdx)
- [Data resolvers & APIs](apps/docs/content/data-resolvers.mdx)
- [Data fetching](apps/docs/content/data-fetching.mdx)
- [Schemas & single sources of truth](apps/docs/content/single-sources-of-truth.mdx)
- [Universal styling](apps/docs/content/write-once-styles.mdx)
- [Form management](apps/docs/content/form-management.mdx)
- [Generators](apps/docs/content/generators.mdx)
- [Workspace drivers](apps/docs/content/workspace-drivers.mdx)
- [Env vars + App config](apps/docs/content/app-config.mdx)
- [Automatic docgen](apps/docs/content/automatic-docgen.mdx)

# Code Style

When updating or recreating files, always maintain the same code style and tab spacing of the existing files.

# Plans

Wherever possible, think of a plan and good feeback loop for the code you'll be writing.

Make the plan extremely conside. Sacrifice grammar for the sake of concision.

At the end of each plan, give me a list of unresolved questions to answer, if any.

A good feedback loop could be a test suite to run red green iterations with, or some of our common dev scripts to run to help test everything still works as expected:
- `npm run test` (runs all tests in the project)
- `npm run build` (runs all build scripts in the project)
- `npm run build:schema` (builds the GraphQL schema)
- `npm run build:theme-colors` (builds the theme colors)
- `npm run collect:resolvers` (collects all resolvers in the project)
- `npm run collect:schemas` (collects all schemas in the project)
- `npm run collect:drivers` (collects all drivers in the project)
- `npm run collect:generators` (collects all generators in the project)
- `npm run link:routes` (reexports all routes in the project to the Expo/Next app routers)
