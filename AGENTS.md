# Documentation project instructions

## About this project

- This is the public AcornOps documentation site.
- Pages are MDX files with YAML frontmatter.
- Configuration lives in `docs.json`.
- Run `npm install` before using the local Mintlify scripts.
- Run `npm run check` before proposing docs changes.
- Run `npm run dev` to preview locally.
- Run `npm run validate` and `npm run links` before handing off documentation changes.

## Agent-Assisted Development

This repository supports human and agent-assisted development. When using a coding agent directly inside this repo, start from this repository root and read this file before editing files.

For work that touches multiple AcornOps repositories, start the agent from the `acornops-workspace` root instead. The workspace root contains the cross-repo manifest, shared skills, validation helpers, and PR coordination workflow.

## Terminology

- Use "management console" for the browser application; do not use outdated browser-app names.
- Use "control plane", "execution engine", "LLM gateway", and "k8s agent" for platform components.
- Use `api.example.com` and `console.example.com` for self-host deployment examples. Use `api.demo.acornops.dev` and `console.demo.acornops.dev` only for the public demo. Keep `docs.acornops.dev` for the public docs host.
- Kubernetes platform deployments use external Postgres and Redis by default.
- Multi-replica control-plane deployments use Redis for agent ownership, cross-pod command routing, run event fanout, and renewed scheduler leases.

## Style preferences

- Use active voice and second person.
- Keep sentences concise.
- Use sentence case for headings.
- Use code formatting for file names, commands, paths, and code references.
- Avoid phrasing that implies a previous public release.

## Content boundaries

- Public docs should explain what operators and users need to run and use AcornOps.
- Component internals belong in the relevant repository README, developer guide, or `docs/contracts`.
- Do not add placeholder pages, sample APIs, or vendor template content.

## Shared Skills

- Shared skills live in `.agents/skills/shared`.
- Repository-owned skills live in `.agents/skills/local` when needed.
- Agent tools may not auto-discover nested skills. When a task matches a skill description, open the relevant `SKILL.md` from `.agents/skills/shared` or `.agents/skills/local` before editing.
- Do not edit `.agents/skills/shared` here; update shared skills in the parent `acornops-workspace` repo and sync them into this repo.

## Handoff And Vendor Neutrality

- Include exact commands run, pass or fail result for each command, skipped checks, docs impact, residual risk, and branch or PR links when applicable.
- Use Conventional Commits for commit subjects and pull request titles.
- Keep this harness vendor-neutral. Do not add required vendor-specific instruction files such as `CLAUDE.md`, `GEMINI.md`, `.cursor`, or `.cursorrules`.
