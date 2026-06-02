<p align="center">
  <img width="220" src="https://raw.githubusercontent.com/acornops/docs/main/logo/light.svg" alt="AcornOps" />
</p>

<h1 align="center">AcornOps Docs</h1>

<p align="center">
  <a href="https://github.com/acornops/docs/actions/workflows/ci.yml"><img src="https://github.com/acornops/docs/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/docs-Mintlify-blue.svg" alt="Mintlify docs" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.17-green.svg" alt="Node >=20.17" />
  <img src="https://img.shields.io/badge/links-checked-blue.svg" alt="Links checked" />
</p>

<p align="center">
  Public AcornOps documentation site published at <code>https://docs.acornops.dev/</code>.
</p>

## Development

Mintlify requires Node.js v20.17.0 or newer. Install project dependencies:

```bash
npm install
```

Preview the docs from this directory:

```bash
npm run dev
```

View your local preview at `http://localhost:3000`.

Production docs are hosted by Mintlify on `https://docs.acornops.dev/`. Keep public links pointed at that host; root-domain redirects are owned outside the docs site.

## Agent-Assisted Development

This repository supports human and agent-assisted development. Start coding agents from this repository root for public-docs-only work, and from the `acornops-workspace` root for changes that touch multiple AcornOps repositories.

## Validation

Run local structural checks:

```bash
npm run check
```

Run Mintlify checks before pushing:

```bash
npm run validate
npm run links
```

## Content Scope

- Keep public user/operator guidance here.
- Keep component-specific developer docs in the component repositories.
- Keep deployment runbooks and the system architecture source of truth in `acornops-deployment/docs`.
