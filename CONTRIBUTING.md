# Contribute to the Documentation

## AcornOps Contributions

Use the [AcornOps workspace repository](https://github.com/acornops/acornops-workspace) as the starting point for product and cross-repository contributions.

For contributor workflow details, start with:

- the workspace README,
- `docs/developer-getting-started.md` in the workspace repository,
- the affected child repository README and `AGENTS.md`.

Keep fast-changing implementation details in the repository that owns the behavior. Keep this docs repository focused on stable public guidance for operators and integration developers.

## Local Development

1. Install dependencies with `npm install`.
2. Run `npm run check` from this directory.
3. Run `npm run dev` to preview changes at `http://localhost:3000`.
4. Run `npm run validate` and `npm run links` before pushing.

## Writing Guidelines

- Use "management console" for the browser application; do not use outdated browser-app names.
- Use `api.acornops.dev`, `console.acornops.dev`, and `docs.acornops.dev` for production examples.
- Keep public docs focused on user and operator outcomes.
- Put component-specific implementation details in the component repository.
- Update affected docs in the same change as product, API, deployment, or behavior changes.

## Source Material

Use these repositories as source material when updating public docs:

- platform deployment: `acornops-deployment`,
- management console behavior: `management-console`,
- control-plane API and auth: `control-plane`,
- execution run lifecycle: `execution-engine`,
- LLM gateway and MCP behavior: `llm-gateway`,
- k8s agent behavior: `k8s-agent`,
- VM agent behavior: `vm-agent`.
